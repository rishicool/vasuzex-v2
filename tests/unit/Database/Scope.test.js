/**
 * Scope Tests
 * Comprehensive tests for Global and Local Scopes
 */

import { 
  Scope, 
  SoftDeletingScope, 
  ActiveScope, 
  PublishedScope, 
  VerifiedScope,
  LocalScope 
} from '../../../framework/Database/Scope.js';

describe('Scope', () => {
  describe('Base Scope', () => {
    test('can be instantiated', () => {
      const scope = new Scope();
      expect(scope).toBeInstanceOf(Scope);
    });

    test('has apply method', () => {
      const scope = new Scope();
      expect(typeof scope.apply).toBe('function');
    });

    test('apply method can be called', () => {
      const scope = new Scope();
      const mockQuery = {};
      const mockModel = {};
      
      scope.apply(mockQuery, mockModel);
    });

    test('can be extended with custom logic', () => {
      class CustomScope extends Scope {
        apply(query, model) {
          return query.where('custom', 'value');
        }
      }

      const scope = new CustomScope();
      let called = false;
      const mockQuery = {
        where: (col, val) => {
          called = true;
          expect(col).toBe('custom');
          expect(val).toBe('value');
          return mockQuery;
        }
      };

      scope.apply(mockQuery, {});
      expect(called).toBe(true);
    });
  });

  describe('SoftDeletingScope', () => {
    let scope;
    let mockQuery;
    let mockModel;

    beforeEach(() => {
      scope = new SoftDeletingScope();
      mockQuery = {
        _whereNull: null,
        whereNull: function(column) {
          this._whereNull = column;
          return this;
        },
        whereNotNull: function(column) {
          this._whereNotNull = column;
          return this;
        },
        update: async function(data) {
          this._updateData = data;
          return 1;
        }
      };
      mockModel = {
        deletedAt: 'deleted_at'
      };
    });

    test('apply() adds whereNull constraint for deleted_at', () => {
      scope.apply(mockQuery, mockModel);
      
      expect(mockQuery._whereNull).toBe('deleted_at');
    });

    test('apply() uses custom deletedAt column', () => {
      mockModel.deletedAt = 'removed_at';
      scope.apply(mockQuery, mockModel);
      
      expect(mockQuery._whereNull).toBe('removed_at');
    });

    test('apply() returns query for chaining', () => {
      const result = scope.apply(mockQuery, mockModel);
      
      expect(result).toBe(mockQuery);
    });

    test('extend() adds withTrashed method', () => {
      scope.extend(mockQuery, mockModel);
      
      expect(typeof mockQuery.withTrashed).toBe('function');
    });

    test('extend() adds onlyTrashed method', () => {
      scope.extend(mockQuery, mockModel);
      
      expect(typeof mockQuery.onlyTrashed).toBe('function');
    });

    test('extend() adds restore method', () => {
      scope.extend(mockQuery, mockModel);
      
      expect(typeof mockQuery.restore).toBe('function');
    });

    test('withTrashed() returns query without soft delete filter', () => {
      scope.extend(mockQuery, mockModel);
      const result = mockQuery.withTrashed();
      
      expect(result).toBe(mockQuery);
    });

    test('onlyTrashed() adds whereNotNull constraint', () => {
      scope.extend(mockQuery, mockModel);
      mockQuery.onlyTrashed();
      
      expect(mockQuery._whereNotNull).toBe('deleted_at');
    });

    test('onlyTrashed() uses custom deletedAt column', () => {
      mockModel.deletedAt = 'removed_at';
      scope.extend(mockQuery, mockModel);
      mockQuery.onlyTrashed();
      
      expect(mockQuery._whereNotNull).toBe('removed_at');
    });

    test('restore() updates deleted_at to null', async () => {
      scope.extend(mockQuery, mockModel);
      await mockQuery.restore();
      
      expect(mockQuery._updateData).toEqual({ deleted_at: null });
    });

    test('restore() uses custom deletedAt column', async () => {
      mockModel.deletedAt = 'removed_at';
      scope.extend(mockQuery, mockModel);
      await mockQuery.restore();
      
      expect(mockQuery._updateData).toEqual({ removed_at: null });
    });

    test('extend() returns query', () => {
      const result = scope.extend(mockQuery, mockModel);
      
      expect(result).toBe(mockQuery);
    });
  });

  describe('ActiveScope', () => {
    test('applies where clause for active status', () => {
      const scope = new ActiveScope();
      let called = false;
      
      const mockQuery = {
        where: (column, value) => {
          called = true;
          expect(column).toBe('status');
          expect(value).toBe('active');
          return mockQuery;
        }
      };

      scope.apply(mockQuery, {});
      expect(called).toBe(true);
    });

    test('returns query for chaining', () => {
      const scope = new ActiveScope();
      const mockQuery = {
        where: () => mockQuery
      };

      const result = scope.apply(mockQuery, {});
      expect(result).toBe(mockQuery);
    });
  });

  describe('PublishedScope', () => {
    test('applies where clause for published status', () => {
      const scope = new PublishedScope();
      let called = false;
      
      const mockQuery = {
        where: (column, value) => {
          called = true;
          expect(column).toBe('status');
          expect(value).toBe('published');
          return mockQuery;
        }
      };

      scope.apply(mockQuery, {});
      expect(called).toBe(true);
    });

    test('returns query for chaining', () => {
      const scope = new PublishedScope();
      const mockQuery = {
        where: () => mockQuery
      };

      const result = scope.apply(mockQuery, {});
      expect(result).toBe(mockQuery);
    });
  });

  describe('VerifiedScope', () => {
    test('applies whereNotNull clause for email_verified_at', () => {
      const scope = new VerifiedScope();
      let called = false;
      
      const mockQuery = {
        whereNotNull: (column) => {
          called = true;
          expect(column).toBe('email_verified_at');
          return mockQuery;
        }
      };

      scope.apply(mockQuery, {});
      expect(called).toBe(true);
    });

    test('returns query for chaining', () => {
      const scope = new VerifiedScope();
      const mockQuery = {
        whereNotNull: () => mockQuery
      };

      const result = scope.apply(mockQuery, {});
      expect(result).toBe(mockQuery);
    });
  });

  describe('LocalScope', () => {
    test('has create static method', () => {
      expect(typeof LocalScope.create).toBe('function');
    });

    test('create() returns a function', () => {
      const scopeFunc = LocalScope.create('test', (query) => query);
      
      expect(typeof scopeFunc).toBe('function');
    });

    test('create() function executes callback with query', () => {
      let called = false;
      const callback = (query, arg) => {
        called = true;
        expect(arg).toBe('test-arg');
        return query;
      };

      const scopeFunc = LocalScope.create('test', callback);
      scopeFunc('test-arg');
      
      expect(called).toBe(true);
    });

    test('create() passes arguments to callback', () => {
      const callback = (query, a, b, c) => {
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
        return query;
      };

      const scopeFunc = LocalScope.create('test', callback);
      scopeFunc(1, 2, 3);
    });

    test('active() scope filters by active status', () => {
      let called = false;
      const mockQuery = {
        where: (column, value) => {
          called = true;
          expect(column).toBe('status');
          expect(value).toBe('active');
          return mockQuery;
        }
      };

      LocalScope.active(mockQuery);
      expect(called).toBe(true);
    });

    test('active() returns query for chaining', () => {
      const mockQuery = {
        where: () => mockQuery
      };

      const result = LocalScope.active(mockQuery);
      expect(result).toBe(mockQuery);
    });
  });

  describe('Scope Composition', () => {
    test('multiple scopes can be applied to same query', () => {
      const scope1 = new ActiveScope();
      const scope2 = new PublishedScope();
      
      const conditions = [];
      const mockQuery = {
        where: (column, value) => {
          conditions.push({ column, value });
          return mockQuery;
        }
      };

      scope1.apply(mockQuery, {});
      scope2.apply(mockQuery, {});

      expect(conditions).toHaveLength(2);
      expect(conditions[0]).toEqual({ column: 'status', value: 'active' });
      expect(conditions[1]).toEqual({ column: 'status', value: 'published' });
    });

    test('soft delete scope can be combined with other scopes', () => {
      const softScope = new SoftDeletingScope();
      const activeScope = new ActiveScope();
      
      const conditions = [];
      const mockQuery = {
        whereNull: (column) => {
          conditions.push({ type: 'whereNull', column });
          return mockQuery;
        },
        where: (column, value) => {
          conditions.push({ type: 'where', column, value });
          return mockQuery;
        }
      };

      softScope.apply(mockQuery, { deletedAt: 'deleted_at' });
      activeScope.apply(mockQuery, {});

      expect(conditions).toHaveLength(2);
      expect(conditions[0].type).toBe('whereNull');
      expect(conditions[1].type).toBe('where');
    });

    test('scopes maintain query chain', () => {
      const scope1 = new ActiveScope();
      const scope2 = new VerifiedScope();
      
      const mockQuery = {
        where: function() { return this; },
        whereNotNull: function() { return this; },
        limit: function(n) { this._limit = n; return this; }
      };

      scope1.apply(mockQuery, {});
      scope2.apply(mockQuery, {});
      mockQuery.limit(10);

      expect(mockQuery._limit).toBe(10);
    });
  });

  describe('Custom Scope Patterns', () => {
    test('can create date-based scope', () => {
      class RecentScope extends Scope {
        apply(query, model) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return query.where('created_at', '>', thirtyDaysAgo);
        }
      }

      const scope = new RecentScope();
      let whereArgs = null;
      
      const mockQuery = {
        where: function(...args) {
          whereArgs = args;
          return this;
        }
      };

      scope.apply(mockQuery, {});
      
      expect(whereArgs[0]).toBe('created_at');
      expect(whereArgs[1]).toBe('>');
      expect(whereArgs[2]).toBeInstanceOf(Date);
    });

    test('can create user-specific scope', () => {
      class OwnedByScope extends Scope {
        constructor(userId) {
          super();
          this.userId = userId;
        }

        apply(query, model) {
          return query.where('user_id', this.userId);
        }
      }

      const scope = new OwnedByScope(123);
      let called = false;
      
      const mockQuery = {
        where: (column, value) => {
          called = true;
          expect(column).toBe('user_id');
          expect(value).toBe(123);
          return mockQuery;
        }
      };

      scope.apply(mockQuery, {});
      expect(called).toBe(true);
    });

    test('can create complex filtering scope', () => {
      class PremiumActiveScope extends Scope {
        apply(query, model) {
          return query
            .where('status', 'active')
            .where('tier', 'premium')
            .whereNotNull('subscription_ends_at');
        }
      }

      const scope = new PremiumActiveScope();
      const conditions = [];
      
      const mockQuery = {
        where: function(column, value) {
          conditions.push({ type: 'where', column, value });
          return this;
        },
        whereNotNull: function(column) {
          conditions.push({ type: 'whereNotNull', column });
          return this;
        }
      };

      scope.apply(mockQuery, {});
      
      expect(conditions).toHaveLength(3);
      expect(conditions[0]).toEqual({ type: 'where', column: 'status', value: 'active' });
      expect(conditions[1]).toEqual({ type: 'where', column: 'tier', value: 'premium' });
      expect(conditions[2]).toEqual({ type: 'whereNotNull', column: 'subscription_ends_at' });
    });
  });
});
