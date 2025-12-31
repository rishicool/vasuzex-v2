import { NotFoundError, ValidationError } from '../Exceptions/index.js';
import { Log } from '../Support/Facades/index.js';

/**
 * Validator class - static methods for validation
 * Avoiding Facade to prevent container binding issues
 */
class ValidatorClass {
  static validate(data, schema) {
    const result = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      const errors = result.error.details.reduce((acc, detail) => {
        const key = detail.path.join('.');
        acc[key] = detail.message;
        return acc;
      }, {});

      return { error: errors, value: null };
    }

    return { error: null, value: result.value };
  }
}

const Validator = ValidatorClass;

/**
 * BaseService - Base service layer class
 * 
 * Provides common CRUD operations, pagination, filtering, and sorting.
 * Inspired by Laravel's service layer pattern and repository pattern.
 */
export class BaseService {
  /**
   * Create a base service
   * 
   * @param {object} model - Database model (GuruORM Model or similar)
   */
  constructor(model) {
    this.model = model;
    this.searchableFields = [];
    this.filterableFields = [];
    this.sortableFields = ['id', 'created_at', 'updated_at'];
    this.defaultPerPage = 15;
    this.maxPerPage = 100;
    this.request = null; // Will be set from controller
  }

  /**
   * Parse columnSearch[field]=value from query params
   * @param {Object} queryParams - Request query parameters
   * @returns {Object} Column search object
   */
  getColumnSearch(queryParams) {
    const result = {};
    if (queryParams.columnSearch && typeof queryParams.columnSearch === 'object') {
      return queryParams.columnSearch;
    }
    for (const key in queryParams) {
      const match = key.match(/^columnSearch\[(.+)\]$/);
      if (match) result[match[1]] = queryParams[key];
    }
    return result;
  }

  /**
   * Validate UUID format
   * @param {String} id - UUID to validate
   * @param {String} fieldName - Field name for error message
   * @throws {ValidationError} If invalid UUID
   */
  validateUUID(id, fieldName = 'ID') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      const field = fieldName.toLowerCase().replace(/ /g, '');
      const errors = { [field]: `Invalid ${fieldName}: must be a valid UUID` };
      throw new ValidationError(errors, `Invalid ${fieldName}: must be a valid UUID`);
    }
  }

  /**
   * Convert camelCase to snake_case for PostgreSQL column names
   * PostgreSQL convention uses snake_case
   * @param {string} str - camelCase string
   * @returns {string} snake_case string
   */
  toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Set request context (call from controller before service methods)
   * @param {Object} req - Express request object
   * @returns {this} For chaining
   */
  setContext(req) {
    this.request = req;
    return this;
  }

  /**
   * Get query options from request
   * Standardizes pagination, search, sort, filters from req.query
   * @returns {Object} Standardized query options
   */
  getQueryOptions() {
    if (!this.request) {
      return {};
    }

    const { query } = this.request;
    const columnSearch = this.extractColumnSearch(query);

    return {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      sortBy: query.sortBy || query.sort_by || 'created_at',
      sortOrder: query.sortOrder || query.sort_order || 'desc',
      filters: this.extractFilters(query),
      columnSearch: columnSearch,
      relations: query.with ? query.with.split(',') : []
    };
  }

  /**
   * Extract column-specific search from query params
   * Frontend sends: columnSearch[name]=john&columnSearch[email]=test
   * Backend receives as: req.query['columnSearch[name]'] = 'john'
   * This method parses them into: {name: 'john', email: 'test'}
   * @param {Object} query - Request query params
   * @returns {Object} Column search object
   */
  extractColumnSearch(query) {
    const columnSearch = {};
    const columnSearchPattern = /^columnSearch\[(.+)\]$/;

    Object.keys(query).forEach(key => {
      const match = key.match(columnSearchPattern);
      if (match && query[key]) {
        const fieldName = match[1];
        columnSearch[fieldName] = query[key];
      }
    });

    return columnSearch;
  }

  /**
   * Extract filters from query params
   * Override in child services for custom filter extraction
   * @param {Object} query - Request query params
   * @returns {Object} Filters object
   */
  extractFilters(query) {
    const filters = {};
    const excludedKeys = ['page', 'limit', 'search', 'sortBy', 'sort_by', 'sortOrder', 'sort_order', 'with'];
    const columnSearchPattern = /^columnSearch\[(.+)\]$/;

    Object.keys(query).forEach(key => {
      // Skip excluded keys and columnSearch params
      if (excludedKeys.includes(key) || columnSearchPattern.test(key)) {
        return;
      }

      const value = query[key];
      if (value !== undefined && value !== null && value !== '') {
        filters[key] = value;
      }
    });

    return filters;
  }

  /**
   * Advanced list method with comprehensive features
   * Handles pagination, sorting, searching, filtering, relation joins, aggregates
   * Single source of truth for all datatable/list operations
   * 
   * @param {Object} Model - GuruORM Model class
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated results with data and pagination meta
   */
  async getList(Model, options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      columnSearch = {},
      sortBy = 'id',
      sortOrder = 'asc',
      searchFields = [],      // Fields for global search
      numericFields = [],     // Fields that are numeric (need CAST for ILIKE)
      columnFields = {},      // Fields for column search
      sortableFields = {},    // Whitelist of allowed sort columns with mapping
      nullableColumns = [],   // Columns that may have NULL values and should use NULLS LAST/FIRST
      relationJoins = {},     // Relations to join for sorting: { 'user.name': { relation: 'user', foreignKey: 'user_id', table: 'users' } }
      filters = null,         // Custom filters function
      relations = [],         // Relations to load
      withAggregates = {}     // Relationship aggregates: { avg: [['ratings', 'rating']], count: ['orders'], sum: [['sales', 'amount']] }
    } = options;

    let query = Model.query();
    const modelTable = Model.table;
    const hasRelationJoin = !!relationJoins[sortBy];

    // Join relations EARLY if sorting by a relation column
    if (hasRelationJoin) {
      const joinConfig = relationJoins[sortBy];
      
      // Apply join
      query = query.leftJoin(
        joinConfig.table,
        `${modelTable}.${joinConfig.foreignKey}`,
        '=',
        `${joinConfig.table}.id`
      );
      
      // Select all columns from main table to avoid conflicts
      query = query.select(`${modelTable}.*`);
    }

    // Apply relationship aggregates (withAvg, withCount, withSum, withMin, withMax)
    if (withAggregates) {
      if (withAggregates.avg) {
        for (const [relation, column] of withAggregates.avg) {
          query = query.withAvg(relation, column);
        }
      }
      if (withAggregates.count) {
        for (const relation of withAggregates.count) {
          query = query.withCount(relation);
        }
      }
      if (withAggregates.sum) {
        for (const [relation, column] of withAggregates.sum) {
          query = query.withSum(relation, column);
        }
      }
      if (withAggregates.min) {
        for (const [relation, column] of withAggregates.min) {
          query = query.withMin(relation, column);
        }
      }
      if (withAggregates.max) {
        for (const [relation, column] of withAggregates.max) {
          query = query.withMax(relation, column);
        }
      }
    }

    // Load relations
    if (relations.length > 0) query = query.with(relations);

    // Helper to qualify column names when relation joins are active
    const qualifyColumn = (col) => hasRelationJoin ? `${modelTable}.${col}` : col;

    // Global search (search across multiple fields)
    if (search && searchFields.length > 0) {
      query = query.where((q) => {
        searchFields.forEach((field, i) => {
          const qualifiedField = qualifyColumn(field);
          // Check if field is numeric - cast to text for pattern matching
          const isNumeric = numericFields.includes(field);
          
          if (isNumeric) {
            // For numeric fields, cast to text for ILIKE search
            const condition = i === 0 ? 'whereRaw' : 'orWhereRaw';
            q[condition](`CAST(${qualifiedField} AS TEXT) ILIKE ?`, [`%${search}%`]);
          } else {
            // For text fields, use normal ILIKE
            i === 0 ? q.where(qualifiedField, 'ILIKE', `%${search}%`) : q.orWhere(qualifiedField, 'ILIKE', `%${search}%`);
          }
        });
      });
    }

    // Column search (search individual columns - only direct fields)
    if (columnSearch && Object.keys(columnSearch).length > 0) {
      Object.entries(columnSearch).forEach(([col, val]) => {
        if (val && columnFields[col]) {
          const dbColumn = columnFields[col];
          const qualifiedColumn = qualifyColumn(dbColumn);
          const isNumeric = numericFields.includes(dbColumn);
          
          if (isNumeric) {
            // For numeric fields, cast to text for ILIKE search
            query = query.whereRaw(`CAST(${qualifiedColumn} AS TEXT) ILIKE ?`, [`%${val}%`]);
          } else {
            // For text fields, use normal ILIKE
            query = query.where(qualifiedColumn, 'ILIKE', `%${val}%`);
          }
        }
      });
    }

    // Custom filters (handle complex logic like relation searches here)
    // Pass modelTable when relation joins are active so filters can qualify WHERE clauses
    if (filters) query = filters(query, columnSearch, hasRelationJoin ? modelTable : null);

    // Validate and map sortBy column
    let validatedSortBy = sortBy;
    if (sortableFields && Object.keys(sortableFields).length > 0) {
      // Check if sortBy is in whitelist
      if (sortableFields[sortBy]) {
        validatedSortBy = sortableFields[sortBy];
      } else {
        // Invalid sort column - use default
        validatedSortBy = sortableFields[Object.keys(sortableFields)[0]] || 'id';
        this.log('Invalid sortBy parameter', { 
          provided: sortBy, 
          using: validatedSortBy,
          allowed: Object.keys(sortableFields) 
        });
      }
    }

    // Sort query with NULL handling
    // For nullable columns (like aggregates), use NULLS LAST for DESC, NULLS FIRST for ASC
    if (nullableColumns.includes(validatedSortBy)) {
      const direction = sortOrder.toLowerCase();
      const nullsPosition = direction === 'desc' ? 'NULLS LAST' : 'NULLS FIRST';
      query = query.orderByRaw(`"${validatedSortBy}" ${direction.toUpperCase()} ${nullsPosition}`);
    } else {
      query = query.orderBy(validatedSortBy, sortOrder.toLowerCase());
    }
    
    // Use GuruORM's paginate (fixed in v2.0.2+ to properly handle eager loading)
    const result = await query.paginate(limit, page);

    return {
      data: result.data,
      pagination: {
        page: result.currentPage,
        limit: result.perPage,
        total: result.total,
        totalPages: result.lastPage
      }
    };
  }

  /**
   * Find all records with optional filters, sorting, and pagination
   * Legacy method - consider using getList() for new code
   * 
   * @param {object} options - Query options
   * @returns {Promise<object>} Paginated results
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = this.defaultPerPage,
      sort = 'created_at',
      order = 'desc',
      filters = {},
      search = null,
      searchFields = this.searchableFields,
    } = options;

    // Build query
    let query = this.model.query();

    // Apply filters
    if (Object.keys(filters).length > 0) {
      query = this.applyFilters(query, filters);
    }

    // Apply search
    if (search && searchFields.length > 0) {
      query = this.applySearch(query, search, searchFields);
    }

    // Apply sorting
    if (this.sortableFields.includes(sort)) {
      query = query.orderBy(sort, order.toUpperCase());
    }

    // Get total count before pagination
    const total = await query.count();

    // Apply pagination
    const perPage = Math.min(limit, this.maxPerPage);
    const offset = (page - 1) * perPage;
    
    const results = await query.limit(perPage).offset(offset).get();

    return this.paginatedResponse(results, {
      page,
      perPage,
      total,
    });
  }

  /**
   * Find a single record by ID
   * 
   * @param {string|number} id - Record ID
   * @param {object} options - Query options
   * @returns {Promise<object>} Found record
   * @throws {NotFoundError} If record not found
   */
  async findById(id, options = {}) {
    const record = await this.model.find(id);

    if (!record) {
      throw new NotFoundError(
        options.notFoundMessage || `${this.model.name || 'Record'} not found`
      );
    }

    return record;
  }

  /**
   * Find a single record by criteria
   * 
   * @param {object} criteria - Search criteria
   * @param {object} options - Query options
   * @returns {Promise<object|null>} Found record or null
   */
  async findOne(criteria, options = {}) {
    let query = this.model.query();

    // Apply criteria
    Object.entries(criteria).forEach(([field, value]) => {
      query = query.where(field, value);
    });

    const record = await query.first();

    if (!record && options.throwIfNotFound) {
      throw new NotFoundError(
        options.notFoundMessage || `${this.model.name || 'Record'} not found`
      );
    }

    return record;
  }

  /**
   * Create a new record
   * 
   * @param {object} data - Record data
   * @returns {Promise<object>} Created record
   */
  async create(data) {
    // Run before create hook
    if (typeof this.beforeCreate === 'function') {
      data = await this.beforeCreate(data);
    }

    const record = await this.model.create(data);

    // Run after create hook
    if (typeof this.afterCreate === 'function') {
      await this.afterCreate(record);
    }

    return record;
  }

  /**
   * Update a record by ID
   * 
   * @param {string|number} id - Record ID
   * @param {object} data - Update data
   * @param {object} options - Update options
   * @returns {Promise<object>} Updated record
   */
  async update(id, data, options = {}) {
    const record = await this.findById(id, options);

    // Run before update hook
    if (typeof this.beforeUpdate === 'function') {
      data = await this.beforeUpdate(record, data);
    }

    const updated = await record.update(data);

    // Run after update hook
    if (typeof this.afterUpdate === 'function') {
      await this.afterUpdate(updated);
    }

    return updated;
  }

  /**
   * Delete a record by ID
   * 
   * @param {string|number} id - Record ID
   * @param {object} options - Delete options
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, options = {}) {
    const record = await this.findById(id, options);

    // Run before delete hook
    if (typeof this.beforeDelete === 'function') {
      await this.beforeDelete(record);
    }

    const result = await record.delete();

    // Run after delete hook
    if (typeof this.afterDelete === 'function') {
      await this.afterDelete(record);
    }

    return result;
  }

  /**
   * Bulk create records
   * 
   * @param {array} records - Array of record data
   * @returns {Promise<array>} Created records
   */
  async bulkCreate(records) {
    const created = [];

    for (const data of records) {
      const record = await this.create(data);
      created.push(record);
    }

    return created;
  }

  /**
   * Bulk update records
   * 
   * @param {object} criteria - Selection criteria
   * @param {object} data - Update data
   * @returns {Promise<number>} Number of updated records
   */
  async bulkUpdate(criteria, data) {
    let query = this.model.query();

    Object.entries(criteria).forEach(([field, value]) => {
      query = query.where(field, value);
    });

    return await query.update(data);
  }

  /**
   * Bulk delete records
   * 
   * @param {object} criteria - Selection criteria
   * @returns {Promise<number>} Number of deleted records
   */
  async bulkDelete(criteria) {
    let query = this.model.query();

    Object.entries(criteria).forEach(([field, value]) => {
      query = query.where(field, value);
    });

    return await query.delete();
  }

  /**
   * Count records
   * 
   * @param {object} criteria - Filter criteria
   * @returns {Promise<number>} Record count
   */
  async count(criteria = {}) {
    let query = this.model.query();

    Object.entries(criteria).forEach(([field, value]) => {
      query = query.where(field, value);
    });

    return await query.count();
  }

  /**
   * Check if record exists
   * 
   * @param {object} criteria - Search criteria
   * @returns {Promise<boolean>} Exists status
   */
  async exists(criteria) {
    const count = await this.count(criteria);
    return count > 0;
  }

  /**
   * Apply filters to query
   * 
   * @param {object} query - Query builder
   * @param {object} filters - Filters to apply
   * @returns {object} Modified query
   */
  applyFilters(query, filters) {
    Object.entries(filters).forEach(([field, value]) => {
      if (!this.filterableFields.includes(field)) {
        return;
      }

      if (Array.isArray(value)) {
        query = query.whereIn(field, value);
      } else if (typeof value === 'object' && value !== null) {
        // Handle operators (gt, lt, gte, lte, like, etc.)
        Object.entries(value).forEach(([operator, operatorValue]) => {
          switch (operator) {
            case 'gt':
              query = query.where(field, '>', operatorValue);
              break;
            case 'gte':
              query = query.where(field, '>=', operatorValue);
              break;
            case 'lt':
              query = query.where(field, '<', operatorValue);
              break;
            case 'lte':
              query = query.where(field, '<=', operatorValue);
              break;
            case 'like':
              query = query.where(field, 'LIKE', `%${operatorValue}%`);
              break;
            case 'ne':
              query = query.where(field, '!=', operatorValue);
              break;
            default:
              query = query.where(field, operatorValue);
          }
        });
      } else {
        query = query.where(field, value);
      }
    });

    return query;
  }

  /**
   * Apply search to query
   * 
   * @param {object} query - Query builder
   * @param {string} search - Search term
   * @param {array} fields - Fields to search
   * @returns {object} Modified query
   */
  applySearch(query, search, fields) {
    if (!search || fields.length === 0) {
      return query;
    }

    query = query.where((q) => {
      fields.forEach((field, index) => {
        if (index === 0) {
          q.where(field, 'LIKE', `%${search}%`);
        } else {
          q.orWhere(field, 'LIKE', `%${search}%`);
        }
      });
    });

    return query;
  }

  /**
   * Format paginated response
   * 
   * @param {array} data - Result data
   * @param {object} meta - Pagination metadata
   * @returns {object} Formatted response
   */
  paginatedResponse(data, meta) {
    const { page, perPage, total } = meta;
    const lastPage = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        perPage,
        currentPage: page,
        lastPage,
        from: (page - 1) * perPage + 1,
        to: Math.min(page * perPage, total),
      },
      links: {
        first: 1,
        last: lastPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  }

  /**
   * Get the model instance
   * 
   * @returns {object} Model
   */
  getModel() {
    return this.model;
  }

  /**
   * Helper: parse boolean
   * @param {any} value - Value to parse
   * @returns {boolean|undefined} Parsed boolean or undefined
   */
  toBool(value) {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1' || value === 1;
  }

  /**
   * Helper: parse integer
   * @param {any} value - Value to parse
   * @param {number} defaultValue - Default value if parsing fails
   * @returns {number} Parsed integer or default
   */
  toInt(value, defaultValue = 0) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Helper: validate required fields
   * @param {Object} data - Data object
   * @param {Array<string>} fields - Required field names
   * @throws {Error} If any required field is missing
   */
  checkRequired(data, fields = []) {
    const missing = fields.filter(f => !data[f]);
    if (missing.length > 0) {
      throw new Error(`Missing: ${missing.join(', ')}`);
    }
  }

  /**
   * Helper: log action
   * @param {string} action - Action description
   * @param {Object} details - Additional details
   */
  log(action, details = {}) {
    Log.info(`[${this.constructor.name}] ${action}`, details);
  }

  /**
   * Helper: log error
   * @param {string} action - Action description
   * @param {Error} error - Error object
   */
  logError(action, error) {
    Log.error(`[${this.constructor.name}] ${action}`, {
      message: error.message,
      stack: error.stack
    });
  }

  /**
   * Validate data using Joi schema (Vasuzex Validator)
   * Laravel-style validation: throws ValidationError if validation fails
   * IMPORTANT: Does NOT transform data, only validates
   * 
   * @param {Object} data - Data to validate
   * @param {Object} schema - Joi schema object
   * @throws {ValidationError} Validation error with field-specific errors
   */
  validate(data, schema) {
    const { error } = Validator.validate(data, schema);
    
    if (error) {
      // Build descriptive message from error fields
      const fieldNames = Object.keys(error);
      const message = `Validation failed: ${fieldNames.join(', ')}`;
      
      throw new ValidationError(error, message);
    }
    
    // Validation passed, no return needed
    // Use original data in your service methods
  }
}
