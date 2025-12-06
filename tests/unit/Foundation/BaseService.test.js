/**
 * BaseService Tests
 */

import { BaseService } from '../../../framework/Foundation/BaseService.js';
import { NotFoundError } from '../../../framework/Exceptions/index.js';

// Simple mock function helper
const mockFn = (returnValue) => {
  const fn = function(...args) {
    fn.calls.push(args);
    fn.called = true;
    return returnValue !== undefined ? returnValue : undefined;
  };
  fn.calls = [];
  fn.called = false;
  return fn;
};

// Mock model for testing
class MockModel {
  constructor(data = {}) {
    this.data = data;
    this.name = 'MockModel';
  }

  static query() {
    return new MockQueryBuilder();
  }

  static async find(id) {
    if (id === 1 || id === '1') {
      return new MockModel({ id: 1, name: 'Test' });
    }
    return null;
  }

  static async create(data) {
    return new MockModel({ id: Date.now(), ...data });
  }

  async update(data) {
    this.data = { ...this.data, ...data };
    return this;
  }

  async delete() {
    return true;
  }
}

class MockQueryBuilder {
  constructor() {
    this.wheres = [];
    this.orders = [];
    this.limitValue = null;
    this.offsetValue = null;
    this.countValue = 100;
    this.results = [];
  }

  where(field, operator, value) {
    if (value === undefined && typeof operator !== 'function') {
      this.wheres.push({ field, value: operator });
    } else if (typeof operator === 'function') {
      operator(this);
    } else {
      this.wheres.push({ field, operator, value });
    }
    return this;
  }

  orWhere(field, operator, value) {
    this.wheres.push({ field, operator, value, or: true });
    return this;
  }

  whereIn(field, values) {
    this.wheres.push({ field, operator: 'IN', value: values });
    return this;
  }

  orderBy(field, direction) {
    this.orders.push({ field, direction });
    return this;
  }

  limit(count) {
    this.limitValue = count;
    return this;
  }

  offset(count) {
    this.offsetValue = count;
    return this;
  }

  async count() {
    return this.countValue;
  }

  async get() {
    return this.results;
  }

  async first() {
    return this.results[0] || null;
  }

  async update(data) {
    return this.wheres.length; // Return number of affected rows
  }

  async delete() {
    return this.wheres.length; // Return number of deleted rows
  }
}

describe('BaseService', () => {
  let service;
  let model;

  beforeEach(() => {
    model = MockModel;
    service = new BaseService(model);
  });

  describe('constructor', () => {
    test('initializes with model', () => {
      expect(service.model).toBe(model);
    });

    test('sets default properties', () => {
      expect(service.searchableFields).toEqual([]);
      expect(service.filterableFields).toEqual([]);
      expect(service.sortableFields).toEqual(['id', 'created_at', 'updated_at']);
      expect(service.defaultPerPage).toBe(15);
      expect(service.maxPerPage).toBe(100);
    });
  });

  describe('findAll', () => {
    test('returns paginated results with defaults', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [{ id: 1 }, { id: 2 }];
      model.query = () => queryBuilder;

      const result = await service.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('links');
      expect(result.meta.total).toBe(100);
      expect(result.meta.perPage).toBe(15);
      expect(result.meta.currentPage).toBe(1);
    });

    test('applies custom page and limit', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [{ id: 1 }];
      model.query = () => queryBuilder;

      await service.findAll({ page: 2, limit: 10 });

      expect(queryBuilder.limitValue).toBe(10);
      expect(queryBuilder.offsetValue).toBe(10);
    });

    test('enforces maxPerPage', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await service.findAll({ limit: 200 });

      expect(queryBuilder.limitValue).toBe(100);
    });

    test('applies sorting when field is sortable', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await service.findAll({ sort: 'created_at', order: 'asc' });

      expect(queryBuilder.orders).toContainEqual({ field: 'created_at', direction: 'ASC' });
    });

    test('ignores sorting for non-sortable fields', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await service.findAll({ sort: 'invalid_field' });

      expect(queryBuilder.orders).toHaveLength(0);
    });

    test('applies filters when filterableFields configured', async () => {
      service.filterableFields = ['status', 'category'];
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await service.findAll({ filters: { status: 'active', category: 'tech' } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
      expect(queryBuilder.wheres).toContainEqual({ field: 'category', value: 'tech' });
    });

    test('applies search when searchableFields configured', async () => {
      service.searchableFields = ['name', 'email'];
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await service.findAll({ search: 'test' });

      expect(queryBuilder.wheres.length).toBeGreaterThan(0);
    });
  });

  describe('findById', () => {
    test('returns record when found', async () => {
      const record = await service.findById(1);

      expect(record).toBeDefined();
      expect(record.data.id).toBe(1);
    });

    test('throws NotFoundError when not found', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundError);
    });

    test('uses custom notFoundMessage', async () => {
      await expect(
        service.findById(999, { notFoundMessage: 'Custom not found' })
      ).rejects.toThrow('Custom not found');
    });
  });

  describe('findOne', () => {
    test('returns record when found', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [{ id: 1, name: 'Test' }];
      model.query = () => queryBuilder;

      const record = await service.findOne({ name: 'Test' });

      expect(record).toBeDefined();
      expect(record.name).toBe('Test');
    });

    test('returns null when not found', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      const record = await service.findOne({ name: 'NotExists' });

      expect(record).toBeNull();
    });

    test('throws when throwIfNotFound option is true', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await expect(
        service.findOne({ name: 'NotExists' }, { throwIfNotFound: true })
      ).rejects.toThrow(NotFoundError);
    });

    test('applies multiple criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await service.findOne({ status: 'active', type: 'user' });

      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
      expect(queryBuilder.wheres).toContainEqual({ field: 'type', value: 'user' });
    });
  });

  describe('create', () => {
    test('creates record', async () => {
      const data = { name: 'New Record' };
      const record = await service.create(data);

      expect(record).toBeDefined();
      expect(record.data.name).toBe('New Record');
    });

    test('calls beforeCreate hook if defined', async () => {
      let called = false;
      let calledWith = null;
      service.beforeCreate = (data) => {
        called = true;
        calledWith = data;
        return { ...data, enhanced: true };
      };
      
      await service.create({ name: 'Test' });

      expect(called).toBe(true);
      expect(calledWith).toEqual({ name: 'Test' });
    });

    test('calls afterCreate hook if defined', async () => {
      let called = false;
      service.afterCreate = () => { called = true; };
      
      await service.create({ name: 'Test' });

      expect(called).toBe(true);
    });
  });

  describe('update', () => {
    test('updates record by ID', async () => {
      const updated = await service.update(1, { name: 'Updated' });

      expect(updated).toBeDefined();
      expect(updated.data.name).toBe('Updated');
    });

    test('throws NotFoundError when record not found', async () => {
      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });

    test('calls beforeUpdate hook if defined', async () => {
      let called = false;
      service.beforeUpdate = (record, data) => {
        called = true;
        return data;
      };
      
      await service.update(1, { name: 'Updated' });

      expect(called).toBe(true);
    });

    test('calls afterUpdate hook if defined', async () => {
      let called = false;
      service.afterUpdate = () => { called = true; };
      
      await service.update(1, { name: 'Updated' });

      expect(called).toBe(true);
    });
  });

  describe('delete', () => {
    test('deletes record by ID', async () => {
      const result = await service.delete(1);

      expect(result).toBe(true);
    });

    test('throws NotFoundError when record not found', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
    });

    test('calls beforeDelete hook if defined', async () => {
      let called = false;
      service.beforeDelete = () => { called = true; };
      
      await service.delete(1);

      expect(called).toBe(true);
    });

    test('calls afterDelete hook if defined', async () => {
      let called = false;
      service.afterDelete = () => { called = true; };
      
      await service.delete(1);

      expect(called).toBe(true);
    });
  });

  describe('bulkCreate', () => {
    test('creates multiple records', async () => {
      const records = [{ name: 'Record 1' }, { name: 'Record 2' }];
      const created = await service.bulkCreate(records);

      expect(created).toHaveLength(2);
      expect(created[0].data.name).toBe('Record 1');
      expect(created[1].data.name).toBe('Record 2');
    });

    test('returns empty array for empty input', async () => {
      const created = await service.bulkCreate([]);

      expect(created).toEqual([]);
    });
  });

  describe('bulkUpdate', () => {
    test('updates multiple records', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.wheres = [{ field: 'status', value: 'pending' }];
      model.query = () => queryBuilder;

      const count = await service.bulkUpdate({ status: 'pending' }, { status: 'active' });

      expect(count).toBe(2); // Returns length of wheres array
    });
  });

  describe('bulkDelete', () => {
    test('deletes multiple records', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.wheres = [{ field: 'status', value: 'inactive' }];
      model.query = () => queryBuilder;

      const count = await service.bulkDelete({ status: 'inactive' });

      expect(count).toBe(2); // Returns length of wheres array
    });
  });

  describe('count', () => {
    test('counts all records without criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.countValue = 50;
      model.query = () => queryBuilder;

      const count = await service.count();

      expect(count).toBe(50);
    });

    test('counts records with criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.countValue = 10;
      model.query = () => queryBuilder;

      const count = await service.count({ status: 'active' });

      expect(count).toBe(10);
      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
    });
  });

  describe('exists', () => {
    test('returns true when records exist', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.countValue = 5;
      model.query = () => queryBuilder;

      const exists = await service.exists({ status: 'active' });

      expect(exists).toBe(true);
    });

    test('returns false when no records exist', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.countValue = 0;
      model.query = () => queryBuilder;

      const exists = await service.exists({ status: 'inactive' });

      expect(exists).toBe(false);
    });
  });

  describe('applyFilters', () => {
    let queryBuilder;

    beforeEach(() => {
      queryBuilder = new MockQueryBuilder();
      service.filterableFields = ['status', 'category', 'price', 'name'];
    });

    test('applies simple equality filter', () => {
      service.applyFilters(queryBuilder, { status: 'active' });

      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
    });

    test('applies array filter with whereIn', () => {
      service.applyFilters(queryBuilder, { category: ['tech', 'science'] });

      expect(queryBuilder.wheres).toContainEqual({ 
        field: 'category', 
        operator: 'IN', 
        value: ['tech', 'science'] 
      });
    });

    test('applies gt operator', () => {
      service.applyFilters(queryBuilder, { price: { gt: 100 } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'price', operator: '>', value: 100 });
    });

    test('applies gte operator', () => {
      service.applyFilters(queryBuilder, { price: { gte: 50 } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'price', operator: '>=', value: 50 });
    });

    test('applies lt operator', () => {
      service.applyFilters(queryBuilder, { price: { lt: 200 } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'price', operator: '<', value: 200 });
    });

    test('applies lte operator', () => {
      service.applyFilters(queryBuilder, { price: { lte: 150 } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'price', operator: '<=', value: 150 });
    });

    test('applies like operator', () => {
      service.applyFilters(queryBuilder, { name: { like: 'test' } });

      expect(queryBuilder.wheres).toContainEqual({ 
        field: 'name', 
        operator: 'LIKE', 
        value: '%test%' 
      });
    });

    test('applies ne (not equal) operator', () => {
      service.applyFilters(queryBuilder, { status: { ne: 'deleted' } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'status', operator: '!=', value: 'deleted' });
    });

    test('ignores non-filterable fields', () => {
      service.applyFilters(queryBuilder, { invalid_field: 'value' });

      expect(queryBuilder.wheres).toHaveLength(0);
    });

    test('applies multiple filters', () => {
      service.applyFilters(queryBuilder, { 
        status: 'active', 
        category: 'tech',
        price: { gte: 100 }
      });

      expect(queryBuilder.wheres.length).toBe(3);
    });
  });

  describe('applySearch', () => {
    let queryBuilder;

    beforeEach(() => {
      queryBuilder = new MockQueryBuilder();
    });

    test('applies search to multiple fields', () => {
      service.applySearch(queryBuilder, 'test', ['name', 'email', 'description']);

      expect(queryBuilder.wheres.length).toBeGreaterThan(0);
    });

    test('returns unchanged query when no search term', () => {
      const result = service.applySearch(queryBuilder, null, ['name']);

      expect(result).toBe(queryBuilder);
      expect(queryBuilder.wheres).toHaveLength(0);
    });

    test('returns unchanged query when no fields', () => {
      const result = service.applySearch(queryBuilder, 'test', []);

      expect(result).toBe(queryBuilder);
      expect(queryBuilder.wheres).toHaveLength(0);
    });
  });

  describe('paginatedResponse', () => {
    test('formats basic pagination response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const meta = { page: 1, perPage: 10, total: 50 };

      const response = service.paginatedResponse(data, meta);

      expect(response.data).toEqual(data);
      expect(response.meta.total).toBe(50);
      expect(response.meta.perPage).toBe(10);
      expect(response.meta.currentPage).toBe(1);
      expect(response.meta.lastPage).toBe(5);
      expect(response.meta.from).toBe(1);
      expect(response.meta.to).toBe(10);
    });

    test('calculates correct from and to for middle page', () => {
      const data = [];
      const meta = { page: 3, perPage: 10, total: 50 };

      const response = service.paginatedResponse(data, meta);

      expect(response.meta.from).toBe(21);
      expect(response.meta.to).toBe(30);
    });

    test('calculates correct to for last partial page', () => {
      const data = [];
      const meta = { page: 3, perPage: 10, total: 25 };

      const response = service.paginatedResponse(data, meta);

      expect(response.meta.to).toBe(25);
    });

    test('includes correct navigation links', () => {
      const data = [];
      const meta = { page: 3, perPage: 10, total: 50 };

      const response = service.paginatedResponse(data, meta);

      expect(response.links.first).toBe(1);
      expect(response.links.last).toBe(5);
      expect(response.links.prev).toBe(2);
      expect(response.links.next).toBe(4);
    });

    test('sets prev to null on first page', () => {
      const data = [];
      const meta = { page: 1, perPage: 10, total: 50 };

      const response = service.paginatedResponse(data, meta);

      expect(response.links.prev).toBeNull();
    });

    test('sets next to null on last page', () => {
      const data = [];
      const meta = { page: 5, perPage: 10, total: 50 };

      const response = service.paginatedResponse(data, meta);

      expect(response.links.next).toBeNull();
    });
  });

  describe('getModel', () => {
    test('returns the model instance', () => {
      const returnedModel = service.getModel();

      expect(returnedModel).toBe(model);
    });
  });
});
