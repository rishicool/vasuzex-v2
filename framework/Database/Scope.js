/**
 * Scope
 * Global and local query scopes for models
 */

export class Scope {
  /**
   * Apply scope to query
   */
  apply(query, model) {
    // Override in subclass
  }
}

/**
 * Soft Deleting Scope
 * Automatically filter soft deleted records
 */
export class SoftDeletingScope extends Scope {
  /**
   * Apply scope to query
   */
  apply(query, model) {
    const deletedAtColumn = model.deletedAt || 'deleted_at';
    return query.whereNull(deletedAtColumn);
  }

  /**
   * Extend query builder with soft delete methods
   */
  extend(query, model) {
    // withTrashed - include soft deleted
    query.withTrashed = function() {
      // Remove the whereNull constraint added by scope
      return this;
    };

    // onlyTrashed - only soft deleted
    query.onlyTrashed = function() {
      const deletedAtColumn = model.deletedAt || 'deleted_at';
      return this.whereNotNull(deletedAtColumn);
    };

    // restore - restore soft deleted
    query.restore = async function() {
      const deletedAtColumn = model.deletedAt || 'deleted_at';
      return await this.update({ [deletedAtColumn]: null });
    };

    return query;
  }
}

/**
 * Example custom scopes
 */

export class ActiveScope extends Scope {
  apply(query, model) {
    return query.where('status', 'active');
  }
}

export class PublishedScope extends Scope {
  apply(query, model) {
    return query.where('status', 'published');
  }
}

export class VerifiedScope extends Scope {
  apply(query, model) {
    return query.whereNotNull('email_verified_at');
  }
}

/**
 * Local Scopes
 * Chainable query methods on models
 */

export class LocalScope {
  /**
   * Create a local scope method
   */
  static create(name, callback) {
    return function(...args) {
      return callback(this, ...args);
    };
  }

  /**
   * Scope for active records
   */
  static active(query) {
    return query.where('status', 'active');
  }

  /**
   * Scope for inactive records
   */
  static inactive(query) {
    return query.where('status', 'inactive');
  }

  /**
   * Scope for published records
   */
  static published(query) {
    return query.where('status', 'published');
  }

  /**
   * Scope for draft records
   */
  static draft(query) {
    return query.where('status', 'draft');
  }

  /**
   * Scope for popular records
   */
  static popular(query, threshold = 100) {
    return query.where('views', '>=', threshold);
  }

  /**
   * Scope for recent records
   */
  static recent(query, days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return query.where('created_at', '>=', date);
  }

  /**
   * Scope for records by user
   */
  static ofUser(query, userId) {
    return query.where('user_id', userId);
  }

  /**
   * Scope for records by type
   */
  static ofType(query, type) {
    return query.where('type', type);
  }
}

export default Scope;
