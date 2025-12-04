import { NotFoundError } from '../Exceptions/index.js';

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
  }

  /**
   * Find all records with optional filters, sorting, and pagination
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
}
