/**
 * BaseRepository - Base repository pattern implementation
 * 
 * Provides data access layer abstraction.
 * Separates business logic from data access logic.
 */
export class BaseRepository {
  /**
   * Create a base repository
   * 
   * @param {object} model - Database model
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records
   * 
   * @param {object} options - Query options
   * @returns {Promise<array>} Records
   */
  async findAll(options = {}) {
    let query = this.model.query();

    if (options.where) {
      Object.entries(options.where).forEach(([field, value]) => {
        query = query.where(field, value);
      });
    }

    if (options.orderBy) {
      const { field, direction = 'ASC' } = options.orderBy;
      query = query.orderBy(field, direction);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return await query.get();
  }

  /**
   * Find record by ID
   * 
   * @param {string|number} id - Record ID
   * @returns {Promise<object|null>} Record or null
   */
  async findById(id) {
    return await this.model.find(id);
  }

  /**
   * Find one record by criteria
   * 
   * @param {object} criteria - Search criteria
   * @returns {Promise<object|null>} Record or null
   */
  async findOne(criteria) {
    let query = this.model.query();

    Object.entries(criteria).forEach(([field, value]) => {
      query = query.where(field, value);
    });

    return await query.first();
  }

  /**
   * Create a record
   * 
   * @param {object} data - Record data
   * @returns {Promise<object>} Created record
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Update a record
   * 
   * @param {string|number} id - Record ID
   * @param {object} data - Update data
   * @returns {Promise<object>} Updated record
   */
  async update(id, data) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }
    return await record.update(data);
  }

  /**
   * Delete a record
   * 
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }
    return await record.delete();
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
   * Get the model
   * 
   * @returns {object} Model
   */
  getModel() {
    return this.model;
  }
}

/**
 * RepositoryFactory - Factory for creating repositories
 * 
 * Manages repository instances with dependency injection.
 */
export class RepositoryFactory {
  constructor() {
    this.repositories = new Map();
    this.creators = new Map();
  }

  /**
   * Register a repository
   * 
   * @param {string} name - Repository name
   * @param {function} creator - Repository creator function
   */
  register(name, creator) {
    this.creators.set(name, creator);
  }

  /**
   * Get or create repository instance
   * 
   * @param {string} name - Repository name
   * @returns {object} Repository instance
   */
  make(name) {
    // Return cached instance if exists
    if (this.repositories.has(name)) {
      return this.repositories.get(name);
    }

    // Create new instance
    if (!this.creators.has(name)) {
      throw new Error(`Repository [${name}] not registered`);
    }

    const creator = this.creators.get(name);
    const instance = creator();
    
    // Cache instance
    this.repositories.set(name, instance);
    
    return instance;
  }

  /**
   * Check if repository registered
   * 
   * @param {string} name - Repository name
   * @returns {boolean}
   */
  has(name) {
    return this.creators.has(name);
  }

  /**
   * Remove repository
   * 
   * @param {string} name - Repository name
   */
  forget(name) {
    this.repositories.delete(name);
    this.creators.delete(name);
  }

  /**
   * Clear all repositories
   */
  clear() {
    this.repositories.clear();
    this.creators.clear();
  }
}

/**
 * Create a new repository factory
 * 
 * @returns {RepositoryFactory}
 */
export function createRepositoryFactory() {
  return new RepositoryFactory();
}

/**
 * Global repository factory instance
 */
export const repositoryFactory = new RepositoryFactory();
