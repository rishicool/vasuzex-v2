/**
 * QueryBuilder Tests
 * Comprehensive tests for fluent query builder
 */

import { QueryBuilder } from '../../../framework/Database/QueryBuilder.js';

describe('QueryBuilder', () => {
  let connection;
  let mockQuery;
  let queryBuilder;

  beforeEach(() => {
    // Mock query object
    mockQuery = {
      select: function(...args) { this._select = args; return this; },
      where: function(...args) { this._where = args; return this; },
      orWhere: function(...args) { this._orWhere = args; return this; },
      whereIn: function(...args) { this._whereIn = args; return this; },
      whereNotIn: function(...args) { this._whereNotIn = args; return this; },
      whereNull: function(...args) { this._whereNull = args; return this; },
      whereNotNull: function(...args) { this._whereNotNull = args; return this; },
      orderBy: function(...args) { this._orderBy = args; return this; },
      limit: function(...args) { this._limit = args; return this; },
      offset: function(...args) { this._offset = args; return this; },
      join: function(...args) { this._join = args; return this; },
      leftJoin: function(...args) { this._leftJoin = args; return this; },
      groupBy: function(...args) { this._groupBy = args; return this; },
      having: function(...args) { this._having = args; return this; },
      get: async function() { return [{ id: 1 }, { id: 2 }]; },
      first: async function() { return { id: 1 }; },
      count: async function() { return 10; },
      insert: async function(data) { return { insertId: 123 }; },
      update: async function(data) { return 1; },
      delete: async function() { return 1; }
    };

    connection = {
      table: (name) => ({ ...mockQuery })
    };

    queryBuilder = new QueryBuilder(connection, 'users');
  });

  describe('Constructor', () => {
    test('initializes with connection and table name', () => {
      expect(queryBuilder.connection).toBe(connection);
      expect(queryBuilder.query).toBeDefined();
    });
  });

  describe('Select Methods', () => {
    test('select() adds columns to query', () => {
      const result = queryBuilder.select('id', 'name', 'email');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._select).toEqual(['id', 'name', 'email']);
    });

    test('select() with single column', () => {
      queryBuilder.select('id');
      
      expect(queryBuilder.query._select).toEqual(['id']);
    });

    test('select() supports chaining', () => {
      const result = queryBuilder
        .select('id')
        .select('name');
      
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Where Clauses', () => {
    test('where() with operator and value', () => {
      const result = queryBuilder.where('status', '=', 'active');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._where).toEqual(['status', '=', 'active']);
    });

    test('where() with value only (assumes equality)', () => {
      queryBuilder.where('status', 'active');
      
      expect(queryBuilder.query._where).toEqual(['status', 'active']);
    });

    test('orWhere() adds OR condition', () => {
      const result = queryBuilder.orWhere('status', 'inactive');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._orWhere).toEqual(['status', 'inactive']);
    });

    test('orWhere() with operator', () => {
      queryBuilder.orWhere('age', '>', 18);
      
      expect(queryBuilder.query._orWhere).toEqual(['age', '>', 18]);
    });

    test('whereIn() filters by array values', () => {
      const result = queryBuilder.whereIn('id', [1, 2, 3]);
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._whereIn).toEqual(['id', [1, 2, 3]]);
    });

    test('whereNotIn() excludes array values', () => {
      const result = queryBuilder.whereNotIn('status', ['banned', 'suspended']);
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._whereNotIn).toEqual(['status', ['banned', 'suspended']]);
    });

    test('whereNull() checks for null values', () => {
      const result = queryBuilder.whereNull('deleted_at');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._whereNull).toEqual(['deleted_at']);
    });

    test('whereNotNull() checks for non-null values', () => {
      const result = queryBuilder.whereNotNull('email_verified_at');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._whereNotNull).toEqual(['email_verified_at']);
    });

    test('chains multiple where clauses', () => {
      queryBuilder
        .where('status', 'active')
        .whereIn('role', ['admin', 'user'])
        .whereNotNull('email');
      
      expect(queryBuilder.query._where).toBeDefined();
      expect(queryBuilder.query._whereIn).toBeDefined();
      expect(queryBuilder.query._whereNotNull).toBeDefined();
    });
  });

  describe('Ordering and Limiting', () => {
    test('orderBy() sorts ascending by default', () => {
      const result = queryBuilder.orderBy('created_at');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._orderBy).toEqual(['created_at', 'asc']);
    });

    test('orderBy() with descending direction', () => {
      queryBuilder.orderBy('created_at', 'desc');
      
      expect(queryBuilder.query._orderBy).toEqual(['created_at', 'desc']);
    });

    test('limit() restricts result count', () => {
      const result = queryBuilder.limit(10);
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._limit).toEqual([10]);
    });

    test('offset() skips records', () => {
      const result = queryBuilder.offset(20);
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._offset).toEqual([20]);
    });

    test('chains order, limit, and offset', () => {
      queryBuilder
        .orderBy('created_at', 'desc')
        .limit(10)
        .offset(20);
      
      expect(queryBuilder.query._orderBy).toEqual(['created_at', 'desc']);
      expect(queryBuilder.query._limit).toEqual([10]);
      expect(queryBuilder.query._offset).toEqual([20]);
    });
  });

  describe('Joins', () => {
    test('join() performs inner join', () => {
      const result = queryBuilder.join('posts', 'users.id', '=', 'posts.user_id');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._join).toEqual(['posts', 'users.id', '=', 'posts.user_id']);
    });

    test('leftJoin() performs left outer join', () => {
      const result = queryBuilder.leftJoin('profiles', 'users.id', '=', 'profiles.user_id');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._leftJoin).toEqual(['profiles', 'users.id', '=', 'profiles.user_id']);
    });

    test('chains multiple joins', () => {
      queryBuilder
        .join('posts', 'users.id', '=', 'posts.user_id')
        .leftJoin('profiles', 'users.id', '=', 'profiles.user_id');
      
      expect(queryBuilder.query._join).toBeDefined();
      expect(queryBuilder.query._leftJoin).toBeDefined();
    });
  });

  describe('Grouping and Having', () => {
    test('groupBy() with single column', () => {
      const result = queryBuilder.groupBy('status');
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._groupBy).toEqual(['status']);
    });

    test('groupBy() with multiple columns', () => {
      queryBuilder.groupBy('status', 'role');
      
      expect(queryBuilder.query._groupBy).toEqual(['status', 'role']);
    });

    test('having() with operator and value', () => {
      const result = queryBuilder.having('count', '>', 5);
      
      expect(result).toBe(queryBuilder);
      expect(queryBuilder.query._having).toEqual(['count', '>', 5]);
    });

    test('having() with value only', () => {
      queryBuilder.having('total', 100);
      
      expect(queryBuilder.query._having).toEqual(['total', 100]);
    });

    test('chains groupBy and having', () => {
      queryBuilder
        .groupBy('status')
        .having('count', '>', 5);
      
      expect(queryBuilder.query._groupBy).toBeDefined();
      expect(queryBuilder.query._having).toBeDefined();
    });
  });

  describe('Retrieval Methods', () => {
    test('get() returns all results', async () => {
      const results = await queryBuilder.get();
      
      expect(results).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('first() returns single result', async () => {
      const result = await queryBuilder.first();
      
      expect(result).toEqual({ id: 1 });
    });

    test('find() retrieves by ID', async () => {
      const result = await queryBuilder.find(123);
      
      expect(queryBuilder.query._where).toEqual(['id', 123]);
      expect(result).toEqual({ id: 1 });
    });

    test('count() returns total records', async () => {
      const total = await queryBuilder.count();
      
      expect(total).toBe(10);
    });

    test('count() with specific column', async () => {
      const total = await queryBuilder.count('email');
      
      expect(total).toBe(10);
    });
  });

  describe('Modification Methods', () => {
    test('insert() creates new record', async () => {
      const data = { name: 'John', email: 'john@test.com' };
      const result = await queryBuilder.insert(data);
      
      expect(result).toEqual({ insertId: 123 });
    });

    test('update() modifies records', async () => {
      const result = await queryBuilder
        .where('id', 1)
        .update({ status: 'inactive' });
      
      expect(result).toBe(1);
    });

    test('delete() removes records', async () => {
      const result = await queryBuilder
        .where('id', 1)
        .delete();
      
      expect(result).toBe(1);
    });
  });

  describe('Pagination', () => {
    test('paginate() with default page and perPage', async () => {
      const result = await queryBuilder.paginate();
      
      expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result.pagination).toMatchObject({
        total: 10,
        perPage: 15,
        currentPage: 1,
        lastPage: 1,
        from: 1,
        to: 10
      });
    });

    test('paginate() with custom page', async () => {
      const result = await queryBuilder.paginate(2, 5);
      
      expect(queryBuilder.query._limit).toEqual([5]);
      expect(queryBuilder.query._offset).toEqual([5]);
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.perPage).toBe(5);
    });

    test('paginate() calculates correct pagination metadata', async () => {
      const result = await queryBuilder.paginate(3, 3);
      
      expect(result.pagination).toMatchObject({
        total: 10,
        perPage: 3,
        currentPage: 3,
        lastPage: 4,
        from: 7,
        to: 9
      });
    });

    test('paginate() handles last page correctly', async () => {
      const result = await queryBuilder.paginate(4, 3);
      
      expect(result.pagination).toMatchObject({
        from: 10,
        to: 10
      });
    });
  });

  describe('Complex Queries', () => {
    test('builds complex query with multiple clauses', async () => {
      await queryBuilder
        .select('id', 'name', 'email')
        .where('status', 'active')
        .whereIn('role', ['admin', 'moderator'])
        .whereNotNull('email_verified_at')
        .orderBy('created_at', 'desc')
        .limit(10)
        .offset(20)
        .get();
      
      expect(queryBuilder.query._select).toBeDefined();
      expect(queryBuilder.query._where).toBeDefined();
      expect(queryBuilder.query._whereIn).toBeDefined();
      expect(queryBuilder.query._whereNotNull).toBeDefined();
      expect(queryBuilder.query._orderBy).toBeDefined();
      expect(queryBuilder.query._limit).toBeDefined();
      expect(queryBuilder.query._offset).toBeDefined();
    });

    test('builds query with joins and grouping', async () => {
      await queryBuilder
        .select('users.id', 'users.name')
        .join('posts', 'users.id', '=', 'posts.user_id')
        .groupBy('users.id')
        .having('count', '>', 5)
        .get();
      
      expect(queryBuilder.query._join).toBeDefined();
      expect(queryBuilder.query._groupBy).toBeDefined();
      expect(queryBuilder.query._having).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    test('getRawQuery() returns underlying query object', () => {
      const raw = queryBuilder.getRawQuery();
      
      expect(raw).toBe(queryBuilder.query);
    });

    test('maintains fluent interface throughout chain', () => {
      const result = queryBuilder
        .select('id')
        .where('status', 'active')
        .orderBy('created_at')
        .limit(10);
      
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty where values', () => {
      queryBuilder.where('status', '');
      expect(queryBuilder.query._where).toEqual(['status', '']);
    });

    test('handles zero values', () => {
      queryBuilder.where('count', 0);
      expect(queryBuilder.query._where).toEqual(['count', 0]);
    });

    test('handles empty array in whereIn', () => {
      queryBuilder.whereIn('id', []);
      expect(queryBuilder.query._whereIn).toEqual(['id', []]);
    });

    test('handles limit(0)', () => {
      queryBuilder.limit(0);
      expect(queryBuilder.query._limit).toEqual([0]);
    });

    test('handles offset(0)', () => {
      queryBuilder.offset(0);
      expect(queryBuilder.query._offset).toEqual([0]);
    });

    test('paginate with page 1 has correct from value', async () => {
      const result = await queryBuilder.paginate(1, 10);
      expect(result.pagination.from).toBe(1);
    });
  });
});
