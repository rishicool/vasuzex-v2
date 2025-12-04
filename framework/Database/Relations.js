/**
 * Relationships
 * Laravel Eloquent-style relationships for models
 */

export class Relationship {
  constructor(query, parent, foreignKey, localKey) {
    this.query = query;
    this.parent = parent;
    this.foreignKey = foreignKey;
    this.localKey = localKey;
  }

  /**
   * Get results
   */
  async get() {
    return await this.query.get();
  }

  /**
   * Get first result
   */
  async first() {
    return await this.query.first();
  }
}

/**
 * Has One Relationship
 */
export class HasOne extends Relationship {
  constructor(query, parent, foreignKey, localKey) {
    super(query, parent, foreignKey, localKey);
    this.addConstraints();
  }

  /**
   * Add constraints
   */
  addConstraints() {
    if (this.parent.exists) {
      this.query.where(this.foreignKey, this.parent.getAttribute(this.localKey));
    }
  }

  /**
   * Get results
   */
  async getResults() {
    return await this.first();
  }
}

/**
 * Has Many Relationship
 */
export class HasMany extends Relationship {
  constructor(query, parent, foreignKey, localKey) {
    super(query, parent, foreignKey, localKey);
    this.addConstraints();
  }

  /**
   * Add constraints
   */
  addConstraints() {
    if (this.parent.exists) {
      this.query.where(this.foreignKey, this.parent.getAttribute(this.localKey));
    }
  }

  /**
   * Get results
   */
  async getResults() {
    return await this.get();
  }

  /**
   * Create new related model
   */
  async create(attributes = {}) {
    const relatedModel = this.query.model;
    const instance = new relatedModel({
      ...attributes,
      [this.foreignKey]: this.parent.getAttribute(this.localKey)
    });
    await instance.save();
    return instance;
  }
}

/**
 * Belongs To Relationship
 */
export class BelongsTo extends Relationship {
  constructor(query, parent, foreignKey, ownerKey) {
    super(query, parent, foreignKey, ownerKey);
    this.addConstraints();
  }

  /**
   * Add constraints
   */
  addConstraints() {
    if (this.parent.exists) {
      const foreignKeyValue = this.parent.getAttribute(this.foreignKey);
      if (foreignKeyValue) {
        this.query.where(this.localKey, foreignKeyValue);
      }
    }
  }

  /**
   * Get results
   */
  async getResults() {
    return await this.first();
  }

  /**
   * Associate model
   */
  associate(model) {
    this.parent.setAttribute(this.foreignKey, model.getAttribute(this.localKey));
    return this.parent;
  }

  /**
   * Dissociate model
   */
  dissociate() {
    this.parent.setAttribute(this.foreignKey, null);
    return this.parent;
  }
}

/**
 * Belongs To Many Relationship
 */
export class BelongsToMany extends Relationship {
  constructor(query, parent, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey) {
    super(query, parent, foreignPivotKey, parentKey);
    this.table = table;
    this.foreignPivotKey = foreignPivotKey;
    this.relatedPivotKey = relatedPivotKey;
    this.parentKey = parentKey;
    this.relatedKey = relatedKey;
  }

  /**
   * Get results
   */
  async getResults() {
    const parentId = this.parent.getAttribute(this.parentKey);
    
    // Get pivot records
    const pivots = await this.parent.constructor.connection
      .table(this.table)
      .where(this.foreignPivotKey, parentId)
      .get();

    if (!pivots || pivots.length === 0) {
      return [];
    }

    // Get related IDs
    const relatedIds = pivots.map(pivot => pivot[this.relatedPivotKey]);

    // Get related models
    const results = await this.query
      .whereIn(this.relatedKey, relatedIds)
      .get();

    return results;
  }

  /**
   * Attach model(s)
   */
  async attach(id, attributes = {}) {
    const ids = Array.isArray(id) ? id : [id];
    const parentId = this.parent.getAttribute(this.parentKey);

    const records = ids.map(relatedId => ({
      [this.foreignPivotKey]: parentId,
      [this.relatedPivotKey]: relatedId,
      ...attributes
    }));

    await this.parent.constructor.connection
      .table(this.table)
      .insert(records);

    return this;
  }

  /**
   * Detach model(s)
   */
  async detach(id = null) {
    const parentId = this.parent.getAttribute(this.parentKey);
    
    let query = this.parent.constructor.connection
      .table(this.table)
      .where(this.foreignPivotKey, parentId);

    if (id !== null) {
      const ids = Array.isArray(id) ? id : [id];
      query = query.whereIn(this.relatedPivotKey, ids);
    }

    await query.delete();

    return this;
  }

  /**
   * Sync model(s)
   */
  async sync(ids, detaching = true) {
    const idsArray = Array.isArray(ids) ? ids : [ids];

    // Get current IDs
    const parentId = this.parent.getAttribute(this.parentKey);
    const current = await this.parent.constructor.connection
      .table(this.table)
      .where(this.foreignPivotKey, parentId)
      .get();

    const currentIds = current.map(pivot => pivot[this.relatedPivotKey]);

    // Determine changes
    const toAttach = idsArray.filter(id => !currentIds.includes(id));
    const toDetach = detaching ? currentIds.filter(id => !idsArray.includes(id)) : [];

    // Apply changes
    if (toDetach.length > 0) {
      await this.detach(toDetach);
    }

    if (toAttach.length > 0) {
      await this.attach(toAttach);
    }

    return {
      attached: toAttach,
      detached: toDetach,
      updated: []
    };
  }

  /**
   * Toggle model(s)
   */
  async toggle(ids) {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    const parentId = this.parent.getAttribute(this.parentKey);

    // Get current IDs
    const current = await this.parent.constructor.connection
      .table(this.table)
      .where(this.foreignPivotKey, parentId)
      .get();

    const currentIds = current.map(pivot => pivot[this.relatedPivotKey]);

    const toAttach = idsArray.filter(id => !currentIds.includes(id));
    const toDetach = idsArray.filter(id => currentIds.includes(id));

    if (toDetach.length > 0) {
      await this.detach(toDetach);
    }

    if (toAttach.length > 0) {
      await this.attach(toAttach);
    }

    return {
      attached: toAttach,
      detached: toDetach
    };
  }
}

/**
 * Has Many Through Relationship
 */
export class HasManyThrough extends Relationship {
  constructor(query, parent, through, firstKey, secondKey, localKey, secondLocalKey) {
    super(query, parent, firstKey, localKey);
    this.through = through;
    this.firstKey = firstKey;
    this.secondKey = secondKey;
    this.localKey = localKey;
    this.secondLocalKey = secondLocalKey;
  }

  /**
   * Get results
   */
  async getResults() {
    const parentId = this.parent.getAttribute(this.localKey);

    // Get intermediate records
    const throughTable = this.through.getTableName();
    const intermediates = await this.parent.constructor.connection
      .table(throughTable)
      .where(this.firstKey, parentId)
      .get();

    if (!intermediates || intermediates.length === 0) {
      return [];
    }

    // Get intermediate IDs
    const intermediateIds = intermediates.map(intermediate => 
      intermediate[this.secondLocalKey]
    );

    // Get final results
    const results = await this.query
      .whereIn(this.secondKey, intermediateIds)
      .get();

    return results;
  }
}

/**
 * Relationship helper methods
 */
export class Relations {
  /**
   * Has One relationship
   */
  static hasOne(parent, related, foreignKey = null, localKey = null) {
    const instance = new related();
    foreignKey = foreignKey || parent.constructor.name.toLowerCase() + '_id';
    localKey = localKey || parent.constructor.primaryKey;

    const query = related.query();
    query.model = related;

    return new HasOne(query, parent, foreignKey, localKey);
  }

  /**
   * Has Many relationship
   */
  static hasMany(parent, related, foreignKey = null, localKey = null) {
    const instance = new related();
    foreignKey = foreignKey || parent.constructor.name.toLowerCase() + '_id';
    localKey = localKey || parent.constructor.primaryKey;

    const query = related.query();
    query.model = related;

    return new HasMany(query, parent, foreignKey, localKey);
  }

  /**
   * Belongs To relationship
   */
  static belongsTo(parent, related, foreignKey = null, ownerKey = null) {
    const instance = new related();
    foreignKey = foreignKey || related.name.toLowerCase() + '_id';
    ownerKey = ownerKey || related.primaryKey;

    const query = related.query();
    query.model = related;

    return new BelongsTo(query, parent, foreignKey, ownerKey);
  }

  /**
   * Belongs To Many relationship
   */
  static belongsToMany(parent, related, table = null, foreignPivotKey = null, relatedPivotKey = null, parentKey = null, relatedKey = null) {
    const instance = new related();
    
    table = table || [parent.constructor.name, related.name].sort().join('_').toLowerCase();
    foreignPivotKey = foreignPivotKey || parent.constructor.name.toLowerCase() + '_id';
    relatedPivotKey = relatedPivotKey || related.name.toLowerCase() + '_id';
    parentKey = parentKey || parent.constructor.primaryKey;
    relatedKey = relatedKey || related.primaryKey;

    const query = related.query();
    query.model = related;

    return new BelongsToMany(query, parent, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey);
  }

  /**
   * Has Many Through relationship
   */
  static hasManyThrough(parent, related, through, firstKey = null, secondKey = null, localKey = null, secondLocalKey = null) {
    firstKey = firstKey || parent.constructor.name.toLowerCase() + '_id';
    secondKey = secondKey || through.name.toLowerCase() + '_id';
    localKey = localKey || parent.constructor.primaryKey;
    secondLocalKey = secondLocalKey || through.primaryKey;

    const query = related.query();
    query.model = related;

    return new HasManyThrough(query, parent, through, firstKey, secondKey, localKey, secondLocalKey);
  }
}

export default Relations;
