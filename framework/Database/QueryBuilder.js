/**
 * QueryBuilder - Fluent query builder
 * GuruORM compatible query building helpers
 */
export class QueryBuilder {
  constructor(connection, tableName) {
    this.connection = connection;
    this.query = connection.table(tableName);
  }

  /**
   * Select columns
   */
  select(...columns) {
    this.query = this.query.select(...columns);
    return this;
  }

  /**
   * Where clause
   */
  where(column, operator, value = undefined) {
    if (value === undefined) {
      this.query = this.query.where(column, operator);
    } else {
      this.query = this.query.where(column, operator, value);
    }
    return this;
  }

  /**
   * Or where clause
   */
  orWhere(column, operator, value = undefined) {
    if (value === undefined) {
      this.query = this.query.orWhere(column, operator);
    } else {
      this.query = this.query.orWhere(column, operator, value);
    }
    return this;
  }

  /**
   * Where in clause
   */
  whereIn(column, values) {
    this.query = this.query.whereIn(column, values);
    return this;
  }

  /**
   * Where not in clause
   */
  whereNotIn(column, values) {
    this.query = this.query.whereNotIn(column, values);
    return this;
  }

  /**
   * Where null clause
   */
  whereNull(column) {
    this.query = this.query.whereNull(column);
    return this;
  }

  /**
   * Where not null clause
   */
  whereNotNull(column) {
    this.query = this.query.whereNotNull(column);
    return this;
  }

  /**
   * Order by clause
   */
  orderBy(column, direction = 'asc') {
    this.query = this.query.orderBy(column, direction);
    return this;
  }

  /**
   * Limit clause
   */
  limit(count) {
    this.query = this.query.limit(count);
    return this;
  }

  /**
   * Offset clause
   */
  offset(count) {
    this.query = this.query.offset(count);
    return this;
  }

  /**
   * Join clause
   */
  join(table, first, operator, second) {
    this.query = this.query.join(table, first, operator, second);
    return this;
  }

  /**
   * Left join clause
   */
  leftJoin(table, first, operator, second) {
    this.query = this.query.leftJoin(table, first, operator, second);
    return this;
  }

  /**
   * Group by clause
   */
  groupBy(...columns) {
    this.query = this.query.groupBy(...columns);
    return this;
  }

  /**
   * Having clause
   */
  having(column, operator, value = undefined) {
    if (value === undefined) {
      this.query = this.query.having(column, operator);
    } else {
      this.query = this.query.having(column, operator, value);
    }
    return this;
  }

  /**
   * Get all results
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

  /**
   * Find by ID
   */
  async find(id) {
    return await this.query.where('id', id).first();
  }

  /**
   * Count results
   */
  async count(column = '*') {
    return await this.query.count(column);
  }

  /**
   * Insert record
   */
  async insert(data) {
    return await this.query.insert(data);
  }

  /**
   * Update records
   */
  async update(data) {
    return await this.query.update(data);
  }

  /**
   * Delete records
   */
  async delete() {
    return await this.query.delete();
  }

  /**
   * Paginate results
   */
  async paginate(page = 1, perPage = 15) {
    const offset = (page - 1) * perPage;
    const data = await this.query.limit(perPage).offset(offset).get();
    const total = await this.count();

    return {
      data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        lastPage: Math.ceil(total / perPage),
        from: offset + 1,
        to: Math.min(offset + perPage, total),
      },
    };
  }

  /**
   * Get raw query
   */
  getRawQuery() {
    return this.query;
  }
}

export default QueryBuilder;
