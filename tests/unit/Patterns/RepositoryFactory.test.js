/**
 * RepositoryFactory and BaseRepository Tests
 */

import {
  BaseRepository,
  RepositoryFactory,
  createRepositoryFactory,
  repositoryFactory
} from '../../../framework/Patterns/RepositoryFactory.js';

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
    this.results = [];
  }

  where(field, value) {
    this.wheres.push({ field, value });
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

  async get() {
    return this.results;
  }

  async first() {
    return this.results[0] || null;
  }

  async count() {
    return this.results.length;
  }
}

describe('BaseRepository', () => {
  let repository;
  let model;

  beforeEach(() => {
    model = MockModel;
    repository = new BaseRepository(model);
  });

  describe('constructor', () => {
    test('initializes with model', () => {
      expect(repository.model).toBe(model);
    });
  });

  describe('findAll', () => {
    test('returns all records without options', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [{ id: 1 }, { id: 2 }];
      model.query = () => queryBuilder;

      const results = await repository.findAll();

      expect(results).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('applies where criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await repository.findAll({ where: { status: 'active', type: 'user' } });

      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
      expect(queryBuilder.wheres).toContainEqual({ field: 'type', value: 'user' });
    });

    test('applies orderBy with default direction', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await repository.findAll({ orderBy: { field: 'created_at' } });

      expect(queryBuilder.orders).toContainEqual({ field: 'created_at', direction: 'ASC' });
    });

    test('applies orderBy with custom direction', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await repository.findAll({ orderBy: { field: 'name', direction: 'DESC' } });

      expect(queryBuilder.orders).toContainEqual({ field: 'name', direction: 'DESC' });
    });

    test('applies limit', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await repository.findAll({ limit: 10 });

      expect(queryBuilder.limitValue).toBe(10);
    });

    test('applies offset', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await repository.findAll({ offset: 20 });

      expect(queryBuilder.offsetValue).toBe(20);
    });

    test('applies all options together', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [{ id: 1 }];
      model.query = () => queryBuilder;

      await repository.findAll({
        where: { status: 'active' },
        orderBy: { field: 'created_at', direction: 'DESC' },
        limit: 10,
        offset: 5
      });

      expect(queryBuilder.wheres.length).toBeGreaterThan(0);
      expect(queryBuilder.orders.length).toBeGreaterThan(0);
      expect(queryBuilder.limitValue).toBe(10);
      expect(queryBuilder.offsetValue).toBe(5);
    });
  });

  describe('findById', () => {
    test('returns record when found', async () => {
      const record = await repository.findById(1);

      expect(record).toBeDefined();
      expect(record.data.id).toBe(1);
    });

    test('returns null when not found', async () => {
      const record = await repository.findById(999);

      expect(record).toBeNull();
    });

    test('handles string ID', async () => {
      const record = await repository.findById('1');

      expect(record).toBeDefined();
      expect(record.data.id).toBe(1);
    });
  });

  describe('findOne', () => {
    test('returns first matching record', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [{ id: 1, name: 'Test' }];
      model.query = () => queryBuilder;

      const record = await repository.findOne({ name: 'Test' });

      expect(record).toBeDefined();
      expect(record.name).toBe('Test');
    });

    test('returns null when not found', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      const record = await repository.findOne({ name: 'NotExists' });

      expect(record).toBeNull();
    });

    test('applies multiple criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      await repository.findOne({ status: 'active', type: 'user' });

      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
      expect(queryBuilder.wheres).toContainEqual({ field: 'type', value: 'user' });
    });
  });

  describe('create', () => {
    test('creates new record', async () => {
      const data = { name: 'New Record', status: 'active' };
      const record = await repository.create(data);

      expect(record).toBeDefined();
      expect(record.data.name).toBe('New Record');
      expect(record.data.status).toBe('active');
    });

    test('returns record with generated ID', async () => {
      const record = await repository.create({ name: 'Test' });

      expect(record.data.id).toBeDefined();
    });
  });

  describe('update', () => {
    test('updates existing record', async () => {
      const updated = await repository.update(1, { name: 'Updated' });

      expect(updated).toBeDefined();
      expect(updated.data.name).toBe('Updated');
    });

    test('throws error when record not found', async () => {
      await expect(repository.update(999, { name: 'Updated' }))
        .rejects
        .toThrow('Record not found');
    });

    test('preserves unchanged fields', async () => {
      const updated = await repository.update(1, { status: 'inactive' });

      expect(updated.data.name).toBe('Test');
      expect(updated.data.status).toBe('inactive');
    });
  });

  describe('delete', () => {
    test('deletes existing record', async () => {
      const result = await repository.delete(1);

      expect(result).toBe(true);
    });

    test('throws error when record not found', async () => {
      await expect(repository.delete(999))
        .rejects
        .toThrow('Record not found');
    });
  });

  describe('count', () => {
    test('counts all records without criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [1, 2, 3, 4, 5];
      model.query = () => queryBuilder;

      const count = await repository.count();

      expect(count).toBe(5);
    });

    test('counts records with criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [1, 2, 3];
      model.query = () => queryBuilder;

      const count = await repository.count({ status: 'active' });

      expect(count).toBe(3);
      expect(queryBuilder.wheres).toContainEqual({ field: 'status', value: 'active' });
    });

    test('applies multiple criteria', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [1];
      model.query = () => queryBuilder;

      await repository.count({ status: 'active', type: 'user' });

      expect(queryBuilder.wheres.length).toBe(2);
    });
  });

  describe('exists', () => {
    test('returns true when records exist', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [1, 2];
      model.query = () => queryBuilder;

      const exists = await repository.exists({ status: 'active' });

      expect(exists).toBe(true);
    });

    test('returns false when no records exist', async () => {
      const queryBuilder = new MockQueryBuilder();
      queryBuilder.results = [];
      model.query = () => queryBuilder;

      const exists = await repository.exists({ status: 'inactive' });

      expect(exists).toBe(false);
    });
  });

  describe('getModel', () => {
    test('returns the model instance', () => {
      const returnedModel = repository.getModel();

      expect(returnedModel).toBe(model);
    });
  });
});

describe('RepositoryFactory', () => {
  let factory;

  beforeEach(() => {
    factory = new RepositoryFactory();
  });

  describe('constructor', () => {
    test('initializes empty containers', () => {
      expect(factory.repositories.size).toBe(0);
      expect(factory.creators.size).toBe(0);
    });
  });

  describe('register', () => {
    test('registers repository creator', () => {
      const creator = () => new BaseRepository(MockModel);
      factory.register('user', creator);

      expect(factory.creators.has('user')).toBe(true);
    });

    test('overwrites existing registration', () => {
      const creator1 = () => ({ version: 1 });
      const creator2 = () => ({ version: 2 });

      factory.register('user', creator1);
      factory.register('user', creator2);

      const repo = factory.make('user');
      expect(repo.version).toBe(2);
    });
  });

  describe('make', () => {
    test('creates repository instance', () => {
      const creator = () => new BaseRepository(MockModel);
      factory.register('user', creator);

      const repo = factory.make('user');

      expect(repo).toBeInstanceOf(BaseRepository);
    });

    test('caches repository instance', () => {
      const creator = () => new BaseRepository(MockModel);
      factory.register('user', creator);

      const repo1 = factory.make('user');
      const repo2 = factory.make('user');

      expect(repo1).toBe(repo2);
    });

    test('throws error for unregistered repository', () => {
      expect(() => factory.make('nonexistent'))
        .toThrow('Repository [nonexistent] not registered');
    });

    test('creates different instances for different repositories', () => {
      factory.register('user', () => new BaseRepository(MockModel));
      factory.register('post', () => new BaseRepository(MockModel));

      const userRepo = factory.make('user');
      const postRepo = factory.make('post');

      expect(userRepo).not.toBe(postRepo);
    });
  });

  describe('has', () => {
    test('returns true for registered repository', () => {
      factory.register('user', () => new BaseRepository(MockModel));

      expect(factory.has('user')).toBe(true);
    });

    test('returns false for unregistered repository', () => {
      expect(factory.has('nonexistent')).toBe(false);
    });
  });

  describe('forget', () => {
    test('removes repository creator', () => {
      factory.register('user', () => new BaseRepository(MockModel));
      factory.forget('user');

      expect(factory.has('user')).toBe(false);
    });

    test('removes cached instance', () => {
      factory.register('user', () => new BaseRepository(MockModel));
      const repo = factory.make('user');
      
      expect(factory.repositories.has('user')).toBe(true);
      
      factory.forget('user');
      
      expect(factory.repositories.has('user')).toBe(false);
    });

    test('does not throw for non-existent repository', () => {
      expect(() => factory.forget('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    test('removes all repositories and creators', () => {
      factory.register('user', () => new BaseRepository(MockModel));
      factory.register('post', () => new BaseRepository(MockModel));
      factory.make('user'); // Create instance

      factory.clear();

      expect(factory.repositories.size).toBe(0);
      expect(factory.creators.size).toBe(0);
    });

    test('can register repositories after clear', () => {
      factory.register('user', () => new BaseRepository(MockModel));
      factory.clear();
      factory.register('post', () => new BaseRepository(MockModel));

      expect(factory.has('user')).toBe(false);
      expect(factory.has('post')).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    test('supports custom repository classes', () => {
      class UserRepository extends BaseRepository {
        async findByEmail(email) {
          return await this.findOne({ email });
        }
      }

      factory.register('user', () => new UserRepository(MockModel));

      const repo = factory.make('user');
      expect(repo).toBeInstanceOf(UserRepository);
      expect(repo.findByEmail).toBeInstanceOf(Function);
    });

    test('supports dependency injection', () => {
      class UserRepository extends BaseRepository {
        constructor(model, logger) {
          super(model);
          this.logger = logger;
        }

        async create(data) {
          this.logger.log('Creating user');
          return super.create(data);
        }
      }

      const logger = { log: mockFn() };
      factory.register('user', () => new UserRepository(MockModel, logger));

      const repo = factory.make('user');
      expect(repo.logger).toBe(logger);
    });

    test('supports multiple model repositories', () => {
      class UserModel {}
      class PostModel {}
      class CommentModel {}

      factory.register('user', () => new BaseRepository(UserModel));
      factory.register('post', () => new BaseRepository(PostModel));
      factory.register('comment', () => new BaseRepository(CommentModel));

      expect(factory.make('user').model).toBe(UserModel);
      expect(factory.make('post').model).toBe(PostModel);
      expect(factory.make('comment').model).toBe(CommentModel);
    });
  });
});

describe('createRepositoryFactory', () => {
  test('creates new factory instance', () => {
    const factory = createRepositoryFactory();

    expect(factory).toBeInstanceOf(RepositoryFactory);
    expect(factory.repositories.size).toBe(0);
  });

  test('creates independent instances', () => {
    const factory1 = createRepositoryFactory();
    const factory2 = createRepositoryFactory();

    factory1.register('user', () => new BaseRepository(MockModel));

    expect(factory1.has('user')).toBe(true);
    expect(factory2.has('user')).toBe(false);
  });
});

describe('repositoryFactory (global instance)', () => {
  beforeEach(() => {
    repositoryFactory.clear();
  });

  test('is a RepositoryFactory instance', () => {
    expect(repositoryFactory).toBeInstanceOf(RepositoryFactory);
  });

  test('can be used as global container', () => {
    repositoryFactory.register('user', () => new BaseRepository(MockModel));

    expect(repositoryFactory.has('user')).toBe(true);
  });

  test('persists across imports', () => {
    repositoryFactory.register('user', () => new BaseRepository(MockModel));

    // In real scenario, this would be tested across different modules
    expect(repositoryFactory.has('user')).toBe(true);
  });
});
