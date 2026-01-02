/**
 * Base Model
 * Laravel Eloquent-inspired base model extending GuruORM
 */

import { Model as GuruORMModel } from 'guruorm';
import { logDatabaseError, enhanceDatabaseError } from './DatabaseErrorHandler.js';

export class Model extends GuruORMModel {
  // Laravel-style properties
  static timestamps = true;
  static dateFormat = null;
  static perPage = 15;

  // Fillable/Guarded
  static fillable = [];
  static guarded = ['*'];
  static hidden = [];
  static visible = [];
  static appends = [];
  static casts = {};

  // Relationships
  static with = [];
  static withCount = [];

  // Soft deletes
  static softDeletes = false;
  static deletedAt = 'deleted_at';

  // Timestamps
  static createdAt = 'created_at';
  static updatedAt = 'updated_at';

  // Boot tracking
  static booted = false;
  static globalScopes = {};

  // Event dispatcher
  static dispatcher = null;

  // Logger instance (set by application)
  static logger = null;

  // Instance properties  
  // NOTE: Do NOT initialize object/array properties here as class fields!
  // Class field initialization creates SHARED references between all instances.
  // These are properly initialized in the constructor chain (GuruORM parent).
  // Only primitive values (boolean, number, string) are safe to initialize here.
  exists = false;
  wasRecentlyCreated = false;
  isDirtyFlag = false;
  isHydrating = false;
  // original, attributes, relations, pendingMutators are initialized in parent constructor

  /**
   * Constructor
   */
  constructor(attributes = {}) {
    super(attributes); // GuruORM handles: syncOriginal(), fill(), bootIfNotBooted()
    
    // Initialize instance-specific arrays/objects that aren't in parent
    this.pendingMutators = [];
  }

  /**
   * Boot model
   */
  static boot() {
    // Override in subclasses for custom boot logic
  }

  /**
   * Boot model if not booted
   */
  bootIfNotBooted() {
    if (!this.constructor.booted) {
      this.constructor.booted = true;
      this.constructor.boot();
    }
  }

  /**
   * Set event dispatcher
   */
  static setEventDispatcher(dispatcher) {
    this.dispatcher = dispatcher;
  }

  /**
   * Get event dispatcher
   */
  static getEventDispatcher() {
    return this.dispatcher;
  }

  /**
   * Fill model attributes
   */
  fill(attributes = {}) {
    for (const [key, value] of Object.entries(attributes)) {
      if (this.isFillable(key)) {
        this.setAttribute(key, value);
      }
    }
    return this;
  }

  /**
   * Force fill attributes (bypass fillable)
   */
  forceFill(attributes = {}) {
    this.isHydrating = true;
    for (const [key, value] of Object.entries(attributes)) {
      this.attributes[key] = value;
    }
    this.isHydrating = false;
    return this;
  }

  /**
   * Check if attribute is fillable
   */
  isFillable(key) {
    const fillable = this.constructor.fillable;
    const guarded = this.constructor.guarded;

    // If fillable is defined and not empty, check if key is in it
    if (fillable.length > 0) {
      return fillable.includes(key);
    }

    // If guarded is *, nothing is fillable unless in fillable array
    if (guarded.includes('*')) {
      return false;
    }

    // Key is fillable if not in guarded
    return !guarded.includes(key);
  }

  /**
   * Set attribute with mutator support
   */
  setAttribute(key, value) {
    // Skip mutators when hydrating from database
    if (!this.isHydrating) {
      // Check if mutator exists (setXxxAttribute method)
      const mutator = `set${this.studly(key)}Attribute`;
      if (typeof this[mutator] === 'function') {
        const result = this[mutator](value);
        // If mutator returns a promise, store it for later resolution
        if (result instanceof Promise) {
          this.pendingMutators.push(result);
        }
        this.isDirtyFlag = true;
        return this;
      }
    }

    // Cast value for storage if casts defined
    if (this.constructor.casts[key]) {
      value = this.castAttributeForStorage(key, value);
    }

    this.attributes[key] = value;
    this.isDirtyFlag = true;
    return this;
  }

  /**
   * Get attribute with accessor support and lazy loading
   * Calls GuruORM's getAttribute to get lazy loading support
   */
  getAttribute(key) {
    // Check if accessor exists (getXxxAttribute method)
    const accessor = `get${this.studly(key)}Attribute`;
    if (typeof this[accessor] === 'function') {
      return this[accessor](this.attributes[key]);
    }

    // Check if appended (computed attributes)
    if (this.constructor.appends.includes(key)) {
      return this[accessor] ? this[accessor]() : null;
    }

    // Delegate to GuruORM's getAttribute for:
    // - Lazy loading of relationships
    // - Loaded relations
    // - Attributes with casting
    return super.getAttribute(key);
  }

  /**
   * Cast attribute for retrieval
   */
  castAttribute(key, value) {
    if (value === null || value === undefined) {
      return value;
    }

    const castType = this.constructor.casts[key];

    switch (castType) {
      case 'int':
      case 'integer':
        return parseInt(value);
      case 'real':
      case 'float':
      case 'double':
        return parseFloat(value);
      case 'string':
        return String(value);
      case 'bool':
      case 'boolean':
        return Boolean(value);
      case 'object':
      case 'array':
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'collection':
        return Array.isArray(value) ? value : [value];
      case 'date':
      case 'datetime':
        return value instanceof Date ? value : new Date(value);
      case 'timestamp':
        return value instanceof Date ? value.getTime() : new Date(value).getTime();
      default:
        return value;
    }
  }

  /**
   * Cast attribute for storage
   */
  castAttributeForStorage(key, value) {
    if (value === null || value === undefined) {
      return value;
    }

    const castType = this.constructor.casts[key];

    switch (castType) {
      case 'object':
      case 'array':
      case 'json':
        return typeof value === 'string' ? value : JSON.stringify(value);
      case 'date':
      case 'datetime':
        return value instanceof Date ? value : new Date(value);
      case 'timestamp':
        return value instanceof Date ? value : new Date(value);
      default:
        return value;
    }
  }

  /**
   * Sync original attributes
   */
  syncOriginal() {
    this.original = { ...this.attributes };
    this.isDirtyFlag = false;
    return this;
  }

  /**
   * Get original attribute value
   */
  getOriginal(key = null) {
    if (key) {
      return this.original[key];
    }
    return { ...this.original };
  }

  /**
   * Check if model or specific attributes are dirty
   */
  isDirty(attributes = null) {
    if (attributes === null) {
      return this.isDirtyFlag;
    }

    const attrs = Array.isArray(attributes) ? attributes : [attributes];
    
    for (const attr of attrs) {
      if (this.attributes[attr] !== this.original[attr]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get dirty attributes
   */
  getDirty() {
    const dirty = {};

    for (const [key, value] of Object.entries(this.attributes)) {
      if (value !== this.original[key]) {
        dirty[key] = value;
      }
    }

    return dirty;
  }

  /**
   * Save model (create or update)
   */
  async save() {
    try {
      // Ensure pendingMutators is initialized (safety check)
      if (!this.pendingMutators) {
        this.pendingMutators = [];
      }
      
      // Resolve any pending async mutators first
      if (this.pendingMutators.length > 0) {
        await Promise.all(this.pendingMutators);
        this.pendingMutators = [];
      }

      // Fire saving event
      if (await this.fireModelEvent('saving') === false) {
        return false;
      }

      // Determine if creating or updating
      if (this.exists) {
        const saved = await this.performUpdate();
        
        if (saved) {
          await this.fireModelEvent('updated', false);
          await this.fireModelEvent('saved', false);
        }

        return saved;
      } else {
        const saved = await this.performInsert();

        if (saved) {
          this.exists = true;
          this.wasRecentlyCreated = true;
          await this.fireModelEvent('created', false);
          await this.fireModelEvent('saved', false);
        }

        return saved;
      }
    } catch (error) {
      // Log database error if logger is available
      if (this.constructor.logger) {
        logDatabaseError(error, this.constructor.logger);
      }
      // Enhance and re-throw
      throw enhanceDatabaseError(error);
    }
  }

  /**
   * Perform insert operation
   */
  async performInsert() {
    // Fire creating event
    if (await this.fireModelEvent('creating') === false) {
      return false;
    }

    // Add timestamps
    if (this.constructor.timestamps) {
      this.updateTimestamps();
    }

    // Filter out internal tracking properties before insert
    const attributes = { ...this.attributes };
    delete attributes.isDirtyFlag;  // Remove internal tracking fields
    delete attributes.pendingMutators;  // Remove async mutator tracking
    delete attributes.isHydrating;  // Remove hydration flag
    delete attributes.exists;  // Remove exists flag
    delete attributes.wasRecentlyCreated;  // Remove recently created flag
    delete attributes.original;  // Remove original tracking
    delete attributes.relations;  // Remove relations (handled separately)
    
    // Use insertGetId() to automatically get the inserted ID with RETURNING clause
    const pk = this.constructor.primaryKey || 'id';
    
    const insertedId = await this.constructor
      .query()
      .insertGetId(attributes, pk);

    // Set primary key if returned (works for both auto-increment and UUID)
    if (insertedId) {
      this.setAttribute(pk, insertedId);
    }

    this.syncOriginal();
    return true;
  }

  /**
   * Perform update
   */
  async performUpdate() {
    // Fire updating event
    if (await this.fireModelEvent('updating') === false) {
      return false;
    }

    // Get dirty attributes
    const dirty = this.getDirty();

    if (Object.keys(dirty).length === 0) {
      return true;
    }

    // Update timestamps
    if (this.constructor.timestamps && this.constructor.updatedAt) {
      this.updateTimestamps();
      dirty[this.constructor.updatedAt] = this.attributes[this.constructor.updatedAt];
    }

    // Filter out internal tracking properties before update
    delete dirty.isDirtyFlag;  // Remove internal tracking fields
    delete dirty.pendingMutators;  // Remove async mutator tracking
    delete dirty.isHydrating;  // Remove hydration flag
    delete dirty.exists;  // Remove exists flag
    delete dirty.wasRecentlyCreated;  // Remove recently created flag
    delete dirty.original;  // Remove original tracking
    delete dirty.relations;  // Remove relations (handled separately)

    const pk = this.constructor.primaryKey || 'id';
    
    // Use GuruORM's update
    await this.constructor.where(pk, this.getKey()).update(dirty);

    this.syncOriginal();
    return true;
  }

  /**
   * Update timestamps
   */
  updateTimestamps() {
    const time = new Date();

    if (this.constructor.updatedAt && !this.isDirty(this.constructor.updatedAt)) {
      this.attributes[this.constructor.updatedAt] = time;
    }

    if (!this.exists && this.constructor.createdAt && !this.isDirty(this.constructor.createdAt)) {
      this.attributes[this.constructor.createdAt] = time;
    }
  }

  /**
   * Delete model
   */
  async delete() {
    if (!this.exists) {
      return false;
    }

    // Fire deleting event
    if (await this.fireModelEvent('deleting') === false) {
      return false;
    }

    // Soft delete
    if (this.constructor.softDeletes) {
      return await this.runSoftDelete();
    }

    // Hard delete - use GuruORM's delete
    const pk = this.constructor.primaryKey || 'id';
    await this.constructor.where(pk, this.getKey()).delete();

    this.exists = false;

    await this.fireModelEvent('deleted', false);

    return true;
  }

  /**
   * Soft delete
   */
  async runSoftDelete() {
    const time = new Date();
    
    this.setAttribute(this.constructor.deletedAt, time);

    const updates = {
      [this.constructor.deletedAt]: time
    };

    if (this.constructor.timestamps && this.constructor.updatedAt) {
      this.setAttribute(this.constructor.updatedAt, time);
      updates[this.constructor.updatedAt] = time;
    }

    const pk = this.constructor.primaryKey || 'id';
    await this.constructor.where(pk, this.getKey()).update(updates);

    this.syncOriginal();
    await this.fireModelEvent('deleted', false);

    return true;
  }

  /**
   * Force delete (hard delete even with soft deletes)
   */
  async forceDelete() {
    const pk = this.constructor.primaryKey || 'id';
    await this.constructor.where(pk, this.getKey()).delete();

    this.exists = false;
    await this.fireModelEvent('forceDeleted', false);

    return true;
  }

  /**
   * Restore soft deleted model
   */
  async restore() {
    if (!this.constructor.softDeletes) {
      return false;
    }

    if (await this.fireModelEvent('restoring') === false) {
      return false;
    }

    this.setAttribute(this.constructor.deletedAt, null);

    const result = await this.save();

    if (result) {
      await this.fireModelEvent('restored', false);
    }

    return result;
  }

  /**
   * Check if model is soft deleted
   */
  trashed() {
    return this.constructor.softDeletes && this.getAttribute(this.constructor.deletedAt) !== null;
  }

  /**
   * Get primary key value
   */
  getKey() {
    const pk = this.constructor.primaryKey || 'id';
    return this.getAttribute(pk);
  }

  /**
   * Set primary key value
   */
  setKey(value) {
    const pk = this.constructor.primaryKey || 'id';
    return this.setAttribute(pk, value);
  }

  /**
   * Fire model event
   */
  async fireModelEvent(event, halt = true) {
    if (!this.constructor.dispatcher) {
      return true;
    }

    // Event name: eloquent.{event}: {ModelName}
    const eventName = `eloquent.${event}: ${this.constructor.name}`;

    const method = halt ? 'until' : 'dispatch';
    const result = await this.constructor.dispatcher[method](eventName, this);

    if (halt) {
      return result !== false;
    }

    return true;
  }

  /**
   * Convert to array
   */
  toArray() {
    const array = { ...this.attributes };

    // Remove internal tracking properties that GuruORM Proxy incorrectly puts in attributes
    // (These should be on the instance, but Proxy's set trap redirects them to attributes)
    delete array.isDirtyFlag;
    delete array.pendingMutators;
    delete array.isHydrating;

    // Add relations
    for (const [key, value] of Object.entries(this.relations)) {
      if (value && typeof value.toArray === 'function') {
        array[key] = value.toArray();
      } else if (Array.isArray(value)) {
        array[key] = value.map(v => v.toArray ? v.toArray() : v);
      } else {
        array[key] = value;
      }
    }

    // Add appends
    for (const key of this.constructor.appends) {
      const value = this.getAttribute(key);
      if (value !== undefined) {
        array[key] = value;
      }
    }

    // Get hidden/visible arrays (merge static and instance)
    const hidden = [...new Set([...this.constructor.hidden, ...(this.hidden || [])])];
    const visible = [...new Set([...this.constructor.visible, ...(this.visible || [])])];

    // Remove hidden
    for (const key of hidden) {
      delete array[key];
    }

    // Only visible (if specified)
    if (visible.length > 0) {
      const visibleObj = {};
      for (const key of visible) {
        if (array[key] !== undefined) {
          visibleObj[key] = array[key];
        }
      }
      return visibleObj;
    }

    return array;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return this.toArray();
  }

  /**
   * Convert string to StudlyCase
   */
  studly(str) {
    return str.replace(/_(.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (_, char) => char.toUpperCase());
  }

  /**
   * Create new instance and save
   */
  static async create(attributes = {}) {
    try {
      const instance = new this(attributes);
      await instance.save();
      return instance;
    } catch (error) {
      // Log database error if logger is available
      if (this.logger) {
        logDatabaseError(error, this.logger);
      }
      // Enhance and re-throw
      throw enhanceDatabaseError(error);
    }
  }

  /**
   * Insert new record (static method for performInsert)
   * Returns the insert result from query builder
   */
  static async insert(attributes) {
    try {
      // Use query builder - must use column quoting for reserved words like "password"
      const query = this.query();
      
      const result = await query.insert(attributes);
      return result;
    } catch (error) {
      // Log database error if logger is available
      if (this.logger) {
        logDatabaseError(error, this.logger);
      }
      // Enhance and re-throw
      throw enhanceDatabaseError(error);
    }
  }

  /**
   * Update records matching conditions (static method for performUpdate)
   */
  static async updateWhere(conditions, attributes) {
    try {
      const query = this.query();
      
      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        query.where(key, value);
      }
      
      return await query.update(attributes);
    } catch (error) {
      // Log database error if logger is available
      if (this.logger) {
        logDatabaseError(error, this.logger);
      }
      // Enhance and re-throw
      throw enhanceDatabaseError(error);
    }
  }

  /**
   * Delete records by primary key (static method)
   */
  static async destroy(id) {
    try {
      const pk = this.primaryKey || 'id';
      const query = this.query();
    
      if (this.softDeletes) {
        // Soft delete
        return await query.where(pk, id).update({
          [this.deletedAt]: new Date()
        });
      } else {
        // Hard delete
        return await query.where(pk, id).delete();
      }
    } catch (error) {
      // Log database error if logger is available
      if (this.logger) {
        logDatabaseError(error, this.logger);
      }
      // Enhance and re-throw
      throw enhanceDatabaseError(error);
    }
  }

  /**
   * Find by primary key (override GuruORM's find)
   */
  static async find(id) {
    try {
      const pk = this.primaryKey || 'id';
      let query = this.where(pk, id);
      
      // Apply soft deletes
      if (this.softDeletes) {
        query = query.whereNull(this.deletedAt);
      }

      const result = await query.first();

      if (!result) {
        return null;
      }

      return this.newFromBuilder(result);
    } catch (error) {
      // Log database error if logger is available
      if (this.logger) {
        logDatabaseError(error, this.logger);
      }
      // Enhance and re-throw
      throw enhanceDatabaseError(error);
    }
  }

  /**
   * Find or fail
   */
  static async findOrFail(id) {
    const model = await this.find(id);

    if (!model) {
      const pk = this.primaryKey || 'id';
      throw new Error(`Model not found with ${pk} = ${id}`);
    }

    return model;
  }

  /**
   * Get all records (override GuruORM's all)
   */
  static async all() {
    let query = this.query();
    
    // Apply soft deletes
    if (this.softDeletes) {
      query = query.whereNull(this.deletedAt);
    }

    const results = await query.get();
    return results.map(result => this.newFromBuilder(result));
  }

  /**
   * Get first record
   */
  static async first() {
    let query = this.query();
    
    // Apply soft deletes
    if (this.softDeletes) {
      query = query.whereNull(this.deletedAt);
    }

    const result = await query.first();
    
    if (!result) {
      return null;
    }

    return this.newFromBuilder(result);
  }

  /**
   * Paginate results
   */
  static async paginate(perPage = null, page = 1) {
    perPage = perPage || this.perPage;
    
    const offset = (page - 1) * perPage;
    
    let query = this.query();
    
    // Apply soft deletes
    if (this.softDeletes) {
      query = query.whereNull(this.deletedAt);
    }

    const countResult = await query.count('* as count');
    const totalCount = countResult[0]?.count || 0;
    
    const results = await query.limit(perPage).offset(offset).get();

    const items = results.map(result => this.newFromBuilder(result));

    return {
      data: items,
      total: totalCount,
      perPage,
      currentPage: page,
      lastPage: Math.ceil(totalCount / perPage),
      from: offset + 1,
      to: offset + items.length
    };
  }

  /**
   * Create model instance from query builder result
   */
  static newFromBuilder(attributes = {}) {
    const instance = new this();
    instance.exists = true;
    instance.forceFill(attributes);
    instance.syncOriginal();
    return instance;
  }

  /**
   * Query builder with soft deletes
   */
  static query() {
    let query = super.query();

    // Apply soft deletes global scope with table qualification
    // This prevents "column reference is ambiguous" errors when JOINs are present
    if (this.softDeletes && !query._skipSoftDeletes) {
      // Support both 'table' and 'tableName' properties
      const tableName = this.table || this.tableName;
      const qualifiedColumn = `${tableName}.${this.deletedAt}`;
      query = query.whereNull(qualifiedColumn);
    }

    // Monkey-patch the update method to add timestamps
    const modelClass = this;
    const originalUpdate = query.update;
    
    query.update = async function(data) {
      // Add updated_at if timestamps are enabled
      if (modelClass.timestamps && modelClass.updatedAt && data[modelClass.updatedAt] === undefined) {
        data[modelClass.updatedAt] = new Date();
      }
      return await originalUpdate.call(this, data);
    };

    return query;
  }

  /**
   * Override where() to pass through model context
   */
  static where(...args) {
    const query = this.query();
    return query.where(...args);
  }

  /**
   * Static update method with timestamps
   * Override to add updated_at automatically
   */
  static async update(id, attributes) {
    // Add updated_at if timestamps are enabled
    if (this.timestamps && this.updatedAt && attributes[this.updatedAt] === undefined) {
      attributes[this.updatedAt] = new Date();
    }

    const pk = this.primaryKey || 'id';
    const query = this.query();
    return await query.where(pk, id).update(attributes);
  }

  /**
   * Query builder with soft deleted records
   */
  static withTrashed() {
    const query = super.query();
    query._skipSoftDeletes = true;
    return query;
  }

  /**
   * Query builder for only soft deleted records
   */
  static onlyTrashed() {
    return super.query().whereNotNull(this.deletedAt);
  }
}

export default Model;
