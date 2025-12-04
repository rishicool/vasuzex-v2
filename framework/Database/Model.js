/**
 * Base Model
 * Laravel Eloquent-inspired base model extending GuruORM
 */

import { Model as GuruORMModel } from 'guruorm';

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

  // Instance properties
  exists = false;
  wasRecentlyCreated = false;
  isDirtyFlag = false;
  original = {};
  attributes = {};
  relations = {};

  /**
   * Constructor
   */
  constructor(attributes = {}) {
    super();
    this.bootIfNotBooted();
    this.syncOriginal();
    this.fill(attributes);
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
    for (const [key, value] of Object.entries(attributes)) {
      this.setAttribute(key, value);
    }
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
    // Check if mutator exists (setXxxAttribute method)
    const mutator = `set${this.studly(key)}Attribute`;
    if (typeof this[mutator] === 'function') {
      this[mutator](value);
      this.isDirtyFlag = true;
      return this;
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
   * Get attribute with accessor support
   */
  getAttribute(key) {
    // Check if accessor exists (getXxxAttribute method)
    const accessor = `get${this.studly(key)}Attribute`;
    if (typeof this[accessor] === 'function') {
      return this[accessor](this.attributes[key]);
    }

    // Check if relation exists
    if (this.relations[key] !== undefined) {
      return this.relations[key];
    }

    // Check if appended
    if (this.constructor.appends.includes(key)) {
      return this[accessor] ? this[accessor]() : null;
    }

    // Cast attribute for retrieval
    if (this.constructor.casts[key] && this.attributes[key] !== undefined) {
      return this.castAttribute(key, this.attributes[key]);
    }

    return this.attributes[key];
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
  }

  /**
   * Perform insert
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

    const attributes = { ...this.attributes };
    
    // Use GuruORM's insert
    const result = await this.constructor.insert(attributes);

    // Set primary key if auto-incrementing
    if (this.constructor.incrementing !== false) {
      const pk = this.constructor.primaryKey || 'id';
      this.setAttribute(pk, result.insertId || result[0] || attributes[pk]);
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
    const instance = new this(attributes);
    await instance.save();
    return instance;
  }

  /**
   * Find by primary key (override GuruORM's find)
   */
  static async find(id) {
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

    // Apply soft deletes global scope
    if (this.softDeletes && !query._skipSoftDeletes) {
      query = query.whereNull(this.deletedAt);
    }

    return query;
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
