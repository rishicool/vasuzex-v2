/**
 * Model Tests
 * Comprehensive tests for Laravel Eloquent-inspired Model
 */

import { Model } from '../../../framework/Database/Model.js';

// Test model class
class TestModel extends Model {
  static tableName = 'test_models';
  static fillable = ['name', 'email', 'age'];
  static hidden = ['password'];
  static casts = {
    age: 'integer',
    is_active: 'boolean',
    metadata: 'json',
    created_at: 'date'
  };
}

// Test model with guarded
class GuardedModel extends Model {
  static tableName = 'guarded_models';
  static guarded = ['id', 'created_at'];
}

// Test model with timestamps
class TimestampModel extends Model {
  static tableName = 'timestamp_models';
  static timestamps = true;
  static fillable = ['name'];
}

// Test model with soft deletes
class SoftDeleteModel extends Model {
  static tableName = 'soft_delete_models';
  static softDeletes = true;
  static fillable = ['name'];
}

describe('Model', () => {
  let model;

  beforeEach(() => {
    model = new TestModel();
    TestModel.booted = false;
  });

  describe('Constructor and Boot', () => {
    test('creates instance with empty attributes', () => {
      expect(model.attributes).toBeDefined();
      expect(model.exists).toBe(false);
      expect(model.wasRecentlyCreated).toBe(false);
    });

    test('creates instance with initial attributes', () => {
      const instance = new TestModel({ name: 'John', email: 'john@test.com' });
      
      expect(instance.attributes.name).toBe('John');
      expect(instance.attributes.email).toBe('john@test.com');
    });

    test('boots model only once', () => {
      expect(TestModel.booted).toBe(false);
      
      new TestModel();
      expect(TestModel.booted).toBe(true);
      
      new TestModel();
      expect(TestModel.booted).toBe(true);
    });

    test('syncs original attributes on construction', () => {
      const instance = new TestModel({ name: 'Jane' });
      
      expect(instance.original).toBeDefined();
      expect(instance.attributes.name).toBe('Jane');
    });
  });

  describe('Fill and Fillable', () => {
    test('fill() sets fillable attributes', () => {
      model.fill({ name: 'Alice', email: 'alice@test.com' });
      
      expect(model.attributes.name).toBe('Alice');
      expect(model.attributes.email).toBe('alice@test.com');
    });

    test('fill() ignores non-fillable attributes', () => {
      model.fill({ name: 'Bob', password: 'secret' });
      
      expect(model.attributes.name).toBe('Bob');
      expect(model.attributes.password).toBeUndefined();
    });

    test('forceFill() bypasses fillable restrictions', () => {
      model.forceFill({ name: 'Charlie', password: 'secret' });
      
      expect(model.attributes.name).toBe('Charlie');
      expect(model.attributes.password).toBe('secret');
    });

    test('isFillable() returns true for fillable attributes', () => {
      expect(model.isFillable('name')).toBe(true);
      expect(model.isFillable('email')).toBe(true);
      expect(model.isFillable('age')).toBe(true);
    });

    test('isFillable() returns false for non-fillable attributes', () => {
      expect(model.isFillable('password')).toBe(false);
      expect(model.isFillable('admin')).toBe(false);
    });

    test('guarded model allows all except guarded', () => {
      const instance = new GuardedModel();
      
      expect(instance.isFillable('name')).toBe(true);
      expect(instance.isFillable('email')).toBe(true);
      expect(instance.isFillable('id')).toBe(false);
      expect(instance.isFillable('created_at')).toBe(false);
    });

    test('fill() returns this for chaining', () => {
      const result = model.fill({ name: 'Test' });
      
      expect(result).toBe(model);
    });
  });

  describe('Attributes', () => {
    test('setAttribute() stores attribute value', () => {
      model.setAttribute('name', 'David');
      
      expect(model.attributes.name).toBe('David');
    });

    test('setAttribute() marks model as dirty', () => {
      model.syncOriginal();
      expect(model.isDirtyFlag).toBe(false);
      
      model.setAttribute('name', 'Emma');
      expect(model.isDirtyFlag).toBe(true);
    });

    test('getAttribute() retrieves attribute value', () => {
      model.attributes.name = 'Frank';
      
      expect(model.getAttribute('name')).toBe('Frank');
    });

    test('getAttribute() returns undefined for missing attribute', () => {
      expect(model.getAttribute('nonexistent')).toBeUndefined();
    });

    test('setAttribute() with mutator calls mutator method', () => {
      model.setNameAttribute = (value) => {
        model.attributes.name = value.toUpperCase();
      };
      
      model.setAttribute('name', 'grace');
      expect(model.attributes.name).toBe('GRACE');
    });

    test('getAttribute() with accessor calls accessor method', () => {
      model.attributes.name = 'henry';
      model.getNameAttribute = (value) => value.toUpperCase();
      
      expect(model.getAttribute('name')).toBe('HENRY');
    });

    test('studly() converts snake_case to StudlyCase', () => {
      expect(model.studly('first_name')).toBe('FirstName');
      expect(model.studly('email_address')).toBe('EmailAddress');
      expect(model.studly('is_active')).toBe('IsActive');
    });
  });

  describe('Casting', () => {
    test('castAttribute() casts to integer', () => {
      const result = model.castAttribute('age', '25');
      expect(result).toBe(25);
      expect(typeof result).toBe('number');
    });

    test('castAttribute() casts to boolean', () => {
      expect(model.castAttribute('is_active', 1)).toBe(true);
      expect(model.castAttribute('is_active', 0)).toBe(false);
      expect(model.castAttribute('is_active', 'yes')).toBe(true);
    });

    test('castAttribute() casts to JSON', () => {
      const result = model.castAttribute('metadata', '{"key":"value"}');
      expect(result).toEqual({ key: 'value' });
    });

    test('castAttribute() handles array casting', () => {
      const result = model.castAttribute('metadata', '[1,2,3]');
      expect(result).toEqual([1, 2, 3]);
    });

    test('castAttribute() casts to date', () => {
      const result = model.castAttribute('created_at', '2023-01-15');
      expect(result instanceof Date).toBe(true);
    });

    test('castAttribute() returns null for null values', () => {
      expect(model.castAttribute('age', null)).toBeNull();
      expect(model.castAttribute('is_active', null)).toBeNull();
    });

    test('castAttributeForStorage() serializes JSON', () => {
      const result = model.castAttributeForStorage('metadata', { key: 'value' });
      expect(result).toBe('{"key":"value"}');
    });

    test('castAttributeForStorage() handles dates', () => {
      const date = new Date('2023-01-15');
      const result = model.castAttributeForStorage('created_at', date);
      expect(result instanceof Date).toBe(true);
    });

    test('getAttribute() applies casting automatically', () => {
      model.attributes.age = '30';
      expect(model.getAttribute('age')).toBe(30);
    });
  });

  describe('Dirty Tracking', () => {
    test('syncOriginal() copies current attributes to original', () => {
      model.attributes = { name: 'Ivy', email: 'ivy@test.com' };
      model.syncOriginal();
      
      expect(model.original.name).toBe('Ivy');
      expect(model.original.email).toBe('ivy@test.com');
      expect(model.isDirtyFlag).toBe(false);
    });

    test('isDirty() returns true when attributes changed', () => {
      model.attributes = { name: 'Jack' };
      model.syncOriginal();
      
      model.setAttribute('name', 'Jake');
      expect(model.isDirty()).toBe(true);
    });

    test('isDirty() with specific attribute', () => {
      model.attributes = { name: 'Kate', email: 'kate@test.com' };
      model.syncOriginal();
      
      model.setAttribute('name', 'Katie');
      
      expect(model.isDirty('name')).toBe(true);
      expect(model.isDirty('email')).toBe(false);
    });

    test('isDirty() with array of attributes', () => {
      model.attributes = { name: 'Leo', email: 'leo@test.com', age: 25 };
      model.syncOriginal();
      
      model.setAttribute('name', 'Leon');
      
      expect(model.isDirty(['name', 'email'])).toBe(true);
      expect(model.isDirty(['email', 'age'])).toBe(false);
    });

    test('getDirty() returns only changed attributes', () => {
      model.attributes = { name: 'Mia', email: 'mia@test.com' };
      model.syncOriginal();
      
      model.setAttribute('name', 'Maya');
      
      const dirty = model.getDirty();
      expect(dirty.name).toBe('Maya');
      expect(dirty.email).toBeUndefined();
    });

    test('getOriginal() returns all original values', () => {
      model.attributes = { name: 'Nina' };
      model.syncOriginal();
      model.setAttribute('name', 'Nancy');
      
      expect(model.getOriginal()).toEqual({ name: 'Nina' });
    });

    test('getOriginal() with key returns specific original value', () => {
      model.attributes = { name: 'Oscar', email: 'oscar@test.com' };
      model.syncOriginal();
      model.setAttribute('name', 'Otto');
      
      expect(model.getOriginal('name')).toBe('Oscar');
    });
  });

  describe('Primary Key', () => {
    test('getKey() returns primary key value', () => {
      model.attributes.id = 42;
      expect(model.getKey()).toBe(42);
    });

    test('setKey() sets primary key value', () => {
      const result = model.setKey(99);
      
      expect(model.attributes.id).toBe(99);
      expect(result).toBe(model);
    });

    test('uses custom primary key if defined', () => {
      TestModel.primaryKey = 'uuid';
      model.attributes.uuid = 'abc-123';
      
      expect(model.getKey()).toBe('abc-123');
      
      TestModel.primaryKey = undefined;
    });
  });

  describe('Serialization', () => {
    test('toArray() converts to plain object', () => {
      model.attributes = { name: 'Paul', email: 'paul@test.com', password: 'secret' };
      
      const array = model.toArray();
      
      expect(array.name).toBe('Paul');
      expect(array.email).toBe('paul@test.com');
    });

    test('toArray() respects hidden attributes', () => {
      model.attributes = { name: 'Quinn', password: 'secret' };
      
      const array = model.toArray();
      
      expect(array.name).toBe('Quinn');
      expect(array.password).toBeUndefined();
    });

    test('toArray() respects visible attributes', () => {
      model.attributes = { name: 'Rachel', email: 'rachel@test.com', age: 30 };
      model.constructor.visible = ['name', 'email'];
      
      const array = model.toArray();
      
      expect(array.name).toBe('Rachel');
      expect(array.email).toBe('rachel@test.com');
      expect(array.age).toBeUndefined();
      
      model.constructor.visible = [];
    });

    test('toArray() includes appended attributes', () => {
      model.attributes = { name: 'Sam' };
      model.constructor.appends = ['full_name'];
      model.getFullNameAttribute = () => 'Sam Smith';
      
      const array = model.toArray();
      
      expect(array.full_name).toBe('Sam Smith');
      
      model.constructor.appends = [];
    });

    test('toJSON() returns same as toArray()', () => {
      model.attributes = { name: 'Tina' };
      
      expect(model.toJSON()).toEqual(model.toArray());
    });

    test('toArray() handles relations', () => {
      model.attributes = { name: 'Uma' };
      model.relations = { posts: [{ title: 'Post 1' }] };
      
      const array = model.toArray();
      
      expect(array.posts).toEqual([{ title: 'Post 1' }]);
    });
  });

  describe('Timestamps', () => {
    test('updateTimestamps() sets created_at on new model', () => {
      const timestampModel = new TimestampModel();
      timestampModel.exists = false;
      
      timestampModel.updateTimestamps();
      
      expect(timestampModel.attributes.created_at).toBeInstanceOf(Date);
      expect(timestampModel.attributes.updated_at).toBeInstanceOf(Date);
    });

    test('updateTimestamps() sets only updated_at on existing model', () => {
      const timestampModel = new TimestampModel();
      timestampModel.exists = true;
      timestampModel.attributes.created_at = new Date('2023-01-01');
      
      const oldCreatedAt = timestampModel.attributes.created_at;
      timestampModel.updateTimestamps();
      
      expect(timestampModel.attributes.created_at).toBe(oldCreatedAt);
      expect(timestampModel.attributes.updated_at).toBeInstanceOf(Date);
    });

    test('updateTimestamps() respects custom timestamp columns', () => {
      TimestampModel.createdAt = 'created';
      TimestampModel.updatedAt = 'updated';
      
      const timestampModel = new TimestampModel();
      timestampModel.exists = false;
      timestampModel.updateTimestamps();
      
      expect(timestampModel.attributes.created).toBeInstanceOf(Date);
      expect(timestampModel.attributes.updated).toBeInstanceOf(Date);
      
      TimestampModel.createdAt = 'created_at';
      TimestampModel.updatedAt = 'updated_at';
    });
  });

  describe('Soft Deletes', () => {
    test('trashed() returns false for non-deleted model', () => {
      const softModel = new SoftDeleteModel();
      softModel.attributes = { name: 'Victor', deleted_at: null };
      
      expect(softModel.trashed()).toBe(false);
    });

    test('trashed() returns true for soft deleted model', () => {
      const softModel = new SoftDeleteModel();
      softModel.attributes = { name: 'Wendy', deleted_at: new Date() };
      
      expect(softModel.trashed()).toBe(true);
    });

    test('trashed() returns false if soft deletes disabled', () => {
      model.attributes = { deleted_at: new Date() };
      
      expect(model.trashed()).toBe(false);
    });

    test('trashed() uses custom deletedAt column', () => {
      SoftDeleteModel.deletedAt = 'removed_at';
      
      const softModel = new SoftDeleteModel();
      softModel.attributes = { removed_at: new Date() };
      
      expect(softModel.trashed()).toBe(true);
      
      SoftDeleteModel.deletedAt = 'deleted_at';
    });
  });

  describe('Event Dispatcher', () => {
    test('fireModelEvent() returns true when no dispatcher set', async () => {
      const result = await model.fireModelEvent('created');
      expect(result).toBe(true);
    });

    test('setEventDispatcher() sets dispatcher', () => {
      const mockDispatcher = { until: async () => true };
      TestModel.setEventDispatcher(mockDispatcher);
      
      expect(TestModel.getEventDispatcher()).toBe(mockDispatcher);
      
      TestModel.dispatcher = null;
    });

    test('fireModelEvent() calls dispatcher until method', async () => {
      let called = false;
      const mockDispatcher = {
        until: async (event, data) => {
          called = true;
          return true;
        }
      };
      
      TestModel.setEventDispatcher(mockDispatcher);
      await model.fireModelEvent('saving');
      
      expect(called).toBe(true);
      
      TestModel.dispatcher = null;
    });

    test('fireModelEvent() with halt=false uses dispatch', async () => {
      let called = false;
      const mockDispatcher = {
        dispatch: async (event, data) => {
          called = true;
        }
      };
      
      TestModel.setEventDispatcher(mockDispatcher);
      await model.fireModelEvent('created', false);
      
      expect(called).toBe(true);
      
      TestModel.dispatcher = null;
    });
  });

  describe('Static Factory Methods', () => {
    test('newFromBuilder() creates instance from database result', () => {
      const data = { id: 1, name: 'Xander', email: 'xander@test.com' };
      const instance = TestModel.newFromBuilder(data);
      
      expect(instance.exists).toBe(true);
      expect(instance.attributes.id).toBe(1);
      expect(instance.attributes.name).toBe('Xander');
      expect(instance.original.id).toBe(1);
      expect(instance.original.name).toBe('Xander');
    });

    test('newFromBuilder() bypasses fillable restrictions', () => {
      const data = { id: 1, name: 'Yara', password: 'secret' };
      const instance = TestModel.newFromBuilder(data);
      
      expect(instance.attributes.password).toBe('secret');
    });
  });

  describe('Relations', () => {
    test('getAttribute() returns relation if set', () => {
      const posts = [{ id: 1, title: 'Post 1' }];
      model.relations.posts = posts;
      
      expect(model.getAttribute('posts')).toBe(posts);
    });

    test('relations property initializes as empty object', () => {
      expect(model.relations).toEqual({});
    });

    test('toArray() serializes relations with toArray method', () => {
      const relatedModel = new TestModel({ name: 'Related' });
      model.relations.author = relatedModel;
      
      const array = model.toArray();
      
      expect(array.author).toEqual(relatedModel.toArray());
    });

    test('toArray() serializes array of relations', () => {
      const related1 = new TestModel({ name: 'First' });
      const related2 = new TestModel({ name: 'Second' });
      model.relations.items = [related1, related2];
      
      const array = model.toArray();
      
      expect(array.items).toHaveLength(2);
      expect(array.items[0].name).toBe('First');
      expect(array.items[1].name).toBe('Second');
    });
  });

  describe('Model State', () => {
    test('exists flag tracks if model is persisted', () => {
      expect(model.exists).toBe(false);
      
      model.exists = true;
      expect(model.exists).toBe(true);
    });

    test('wasRecentlyCreated flag tracks new records', () => {
      expect(model.wasRecentlyCreated).toBe(false);
      
      model.wasRecentlyCreated = true;
      expect(model.wasRecentlyCreated).toBe(true);
    });
  });

  describe('Chaining', () => {
    test('fill() returns this for chaining', () => {
      const result = model.fill({ name: 'Chain' });
      expect(result).toBe(model);
    });

    test('setAttribute() returns this for chaining', () => {
      const result = model.setAttribute('name', 'Test');
      expect(result).toBe(model);
    });

    test('setKey() returns this for chaining', () => {
      const result = model.setKey(1);
      expect(result).toBe(model);
    });

    test('syncOriginal() returns this for chaining', () => {
      const result = model.syncOriginal();
      expect(result).toBe(model);
    });

    test('can chain multiple operations', () => {
      const result = model
        .fill({ name: 'Test' })
        .setAttribute('email', 'test@test.com')
        .syncOriginal();
      
      expect(result).toBe(model);
      expect(model.attributes.name).toBe('Test');
      expect(model.attributes.email).toBe('test@test.com');
    });
  });
});
