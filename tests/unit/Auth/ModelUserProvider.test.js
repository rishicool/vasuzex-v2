/**
 * ModelUserProvider Tests
 * Comprehensive tests for GuruORM model user provider
 */

import { describe, expect, it, beforeEach, jest } from '@jest/globals';

describe('ModelUserProvider', () => {
  let ModelUserProvider;
  let mockHasher;
  let provider;
  let MockUserModel;

  beforeEach(async () => {
    // Import ModelUserProvider
    const providerModule = await import('../../../framework/Auth/UserProviders/ModelUserProvider.js');
    ModelUserProvider = providerModule.ModelUserProvider;

    // Mock hasher
    mockHasher = {
      check: jest.fn(async (plain, hashed) => plain === 'correct-password'),
      make: jest.fn(async (value) => `hashed_${value}`)
    };

    // Mock User Model with both static and instance methods
    MockUserModel = class User {
      constructor(data = {}) {
        Object.assign(this, data);
      }

      static where(field, value) {
        const instance = new User();
        instance.queryField = field;
        instance.queryValue = value;
        return instance;
      }

      where(field, value) {
        this.queryField = field;
        this.queryValue = value;
        return this;
      }

      whereIn(field, values) {
        this.queryField = field;
        this.queryValues = values;
        return this;
      }

      static async first() {
        // Return mock user data
        if (this.queryField === 'id' && this.queryValue === 1) {
          return new User({
            id: 1,
            email: 'john@example.com',
            password: 'hashed_password',
            remember_token: 'token123'
          });
        }
        if (this.queryField === 'email' && this.queryValue === 'john@example.com') {
          return new User({
            id: 1,
            email: 'john@example.com',
            password: 'hashed_password'
          });
        }
        return null;
      }

      async first() {
        // Instance method
        if (this.queryField === 'id' && this.queryValue === 1) {
          return new MockUserModel({
            id: 1,
            email: 'john@example.com',
            password: 'hashed_password',
            remember_token: 'token123'
          });
        }
        if (this.queryField === 'email' && this.queryValue === 'john@example.com') {
          return new MockUserModel({
            id: 1,
            email: 'john@example.com',
            password: 'hashed_password'
          });
        }
        return null;
      }

      getAuthIdentifierName() {
        return 'id';
      }

      getRememberToken() {
        return this.remember_token;
      }

      setRememberToken(token) {
        this.remember_token = token;
      }

      getAuthPassword() {
        return this.password;
      }

      async save() {
        return true;
      }
    };

    // Mock require for model loading
    const originalRequire = global.require;
    global.require = jest.fn((path) => {
      if (path.includes('User')) {
        return { default: MockUserModel };
      }
      return originalRequire(path);
    });

    provider = new ModelUserProvider(mockHasher, '../models/User.js');
  });

  describe('Constructor', () => {
    it('should initialize with hasher and model path', () => {
      expect(provider.hasher).toBe(mockHasher);
      expect(provider.model).toBe('../models/User.js');
    });
  });

  describe('Retrieve By ID', () => {
    it('should retrieve user by id', async () => {
      const user = await provider.retrieveById(1);

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.email).toBe('john@example.com');
    });

    it('should return null for non-existent user', async () => {
      const user = await provider.retrieveById(999);

      expect(user).toBeNull();
    });

    it('should use getAuthIdentifierName if available', async () => {
      const user = await provider.retrieveById(1);

      expect(user).toBeDefined();
    });
  });

  describe('Retrieve By Token', () => {
    it('should retrieve user by id and token', async () => {
      const user = await provider.retrieveByToken(1, 'token123');

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.getRememberToken()).toBe('token123');
    });

    it('should return null if user not found', async () => {
      const user = await provider.retrieveByToken(999, 'token123');

      expect(user).toBeNull();
    });

    it('should return null if token does not match', async () => {
      const user = await provider.retrieveByToken(1, 'wrong-token');

      expect(user).toBeNull();
    });

    it('should handle user without getRememberToken method', async () => {
      // Create user without method
      MockUserModel.first = jest.fn(async () => ({
        id: 1,
        remember_token: 'token123'
      }));

      const user = await provider.retrieveByToken(1, 'token123');

      expect(user).toBeDefined();
    });
  });

  describe('Update Remember Token', () => {
    it('should update remember token using setRememberToken', async () => {
      const user = new MockUserModel({
        id: 1,
        email: 'john@example.com'
      });

      const saveSpy = jest.spyOn(user, 'save');

      await provider.updateRememberToken(user, 'new-token');

      expect(user.getRememberToken()).toBe('new-token');
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should update remember token directly if no method', async () => {
      const user = {
        id: 1,
        email: 'john@example.com',
        save: jest.fn()
      };

      await provider.updateRememberToken(user, 'new-token');

      expect(user.remember_token).toBe('new-token');
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('Retrieve By Credentials', () => {
    it('should retrieve user by email', async () => {
      // Override createModel to return a proper query builder
      provider.createModel = jest.fn(() => {
        const queryBuilder = {
          where: jest.fn().mockReturnThis(),
          whereIn: jest.fn().mockReturnThis(),
          first: jest.fn(async () => new MockUserModel({
            id: 1,
            email: 'john@example.com',
            password: 'hashed_password'
          }))
        };
        return queryBuilder;
      });

      const user = await provider.retrieveByCredentials({
        email: 'john@example.com',
        password: 'secret'
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('john@example.com');
    });

    it('should ignore password field in query', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => new MockUserModel({ id: 1, email: 'john@example.com' }))
      };

      provider.createModel = jest.fn(() => queryBuilder);

      await provider.retrieveByCredentials({
        email: 'john@example.com',
        password: 'secret'
      });

      expect(queryBuilder.where).toHaveBeenCalledWith('email', 'john@example.com');
      expect(queryBuilder.where).not.toHaveBeenCalledWith('password', expect.anything());
    });

    it('should return null for empty credentials', async () => {
      const user = await provider.retrieveByCredentials({});

      expect(user).toBeNull();
    });

    it('should return null for null credentials', async () => {
      const user = await provider.retrieveByCredentials(null);

      expect(user).toBeNull();
    });

    it('should handle array values with whereIn', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null)
      };

      provider.createModel = jest.fn(() => queryBuilder);

      await provider.retrieveByCredentials({
        status: ['active', 'pending']
      });

      expect(queryBuilder.whereIn).toHaveBeenCalledWith('status', ['active', 'pending']);
    });

    it('should handle multiple credentials', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null)
      };

      provider.createModel = jest.fn(() => queryBuilder);

      await provider.retrieveByCredentials({
        email: 'john@example.com',
        status: 'active',
        password: 'ignored'
      });

      expect(queryBuilder.where).toHaveBeenCalledWith('email', 'john@example.com');
      expect(queryBuilder.where).toHaveBeenCalledWith('status', 'active');
    });

    it('should return null if only password provided', async () => {
      const user = await provider.retrieveByCredentials({
        password: 'secret'
      });

      expect(user).toBeNull();
    });
  });

  describe('Validate Credentials', () => {
    it('should validate correct credentials', async () => {
      const user = new MockUserModel({
        id: 1,
        email: 'john@example.com',
        password: 'hashed_password'
      });

      const result = await provider.validateCredentials(user, {
        password: 'correct-password'
      });

      expect(mockHasher.check).toHaveBeenCalledWith('correct-password', 'hashed_password');
      expect(result).toBe(true);
    });

    it('should reject incorrect credentials', async () => {
      mockHasher.check = jest.fn(async () => false);

      const user = new MockUserModel({
        id: 1,
        password: 'hashed_password'
      });

      const result = await provider.validateCredentials(user, {
        password: 'wrong-password'
      });

      expect(result).toBe(false);
    });

    it('should use getAuthPassword if available', async () => {
      const user = new MockUserModel({
        id: 1,
        password: 'hashed_password'
      });

      await provider.validateCredentials(user, {
        password: 'test'
      });

      expect(mockHasher.check).toHaveBeenCalledWith('test', 'hashed_password');
    });

    it('should fallback to password property', async () => {
      const user = {
        id: 1,
        password: 'hashed_password'
      };

      await provider.validateCredentials(user, {
        password: 'test'
      });

      expect(mockHasher.check).toHaveBeenCalledWith('test', 'hashed_password');
    });
  });

  describe('Model Management', () => {
    it('should create model instance', () => {
      const model = provider.createModel();

      expect(model).toBeInstanceOf(MockUserModel);
    });

    it('should get model path', () => {
      expect(provider.getModel()).toBe('../models/User.js');
    });

    it('should set model path', () => {
      const result = provider.setModel('../models/Admin.js');

      expect(provider.model).toBe('../models/Admin.js');
      expect(result).toBe(provider);
    });
  });

  describe('Hasher Management', () => {
    it('should get hasher', () => {
      expect(provider.getHasher()).toBe(mockHasher);
    });

    it('should set hasher', () => {
      const newHasher = { check: jest.fn(), make: jest.fn() };
      const result = provider.setHasher(newHasher);

      expect(provider.hasher).toBe(newHasher);
      expect(result).toBe(provider);
    });
  });

  describe('Edge Cases', () => {
    it('should handle model without getAuthIdentifierName', async () => {
      // Create model without getAuthIdentifierName
      const SimpleModel = class {
        static where(field, value) {
          const instance = new SimpleModel();
          instance.queryField = field;
          instance.queryValue = value;
          return instance;
        }

        async first() {
          if (this.queryField === 'id' && this.queryValue === 1) {
            return { id: 1, email: 'test@test.com' };
          }
          return null;
        }
      };

      global.require = jest.fn(() => ({ default: SimpleModel }));

      const user = await provider.retrieveById(1);

      expect(user).toBeDefined();
    });

    it('should handle credentials with special characters', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null)
      };

      provider.createModel = jest.fn(() => queryBuilder);

      await provider.retrieveByCredentials({
        email: "test'email@example.com"
      });

      expect(queryBuilder.where).toHaveBeenCalledWith('email', "test'email@example.com");
    });

    it('should handle empty array in credentials', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null)
      };

      provider.createModel = jest.fn(() => queryBuilder);

      await provider.retrieveByCredentials({
        roles: []
      });

      expect(queryBuilder.whereIn).toHaveBeenCalledWith('roles', []);
    });

    it('should handle undefined password in credentials', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => new MockUserModel({
          id: 1,
          email: 'john@example.com'
        }))
      };

      provider.createModel = jest.fn(() => queryBuilder);

      const user = await provider.retrieveByCredentials({
        email: 'john@example.com',
        password: undefined
      });

      expect(user).toBeDefined();
    });

    it('should handle null password in validation', async () => {
      const user = new MockUserModel({
        id: 1,
        password: 'hashed_password'
      });

      await provider.validateCredentials(user, {
        password: null
      });

      expect(mockHasher.check).toHaveBeenCalledWith(null, 'hashed_password');
    });

    it('should handle user with null remember_token', async () => {
      const SimpleModel = class {
        static where(field, value) {
          const instance = new SimpleModel();
          instance.queryField = field;
          instance.queryValue = value;
          return instance;
        }

        async first() {
          if (this.queryField === 'id' && this.queryValue === 1) {
            return {
              id: 1,
              remember_token: null,
              getRememberToken: () => null
            };
          }
          return null;
        }
      };

      global.require = jest.fn(() => ({ default: SimpleModel }));

      const user = await provider.retrieveByToken(1, 'token123');

      expect(user).toBeNull();
    });

    it('should handle credentials with password in field name', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        first: jest.fn(async () => null)
      };

      provider.createModel = jest.fn(() => queryBuilder);

      await provider.retrieveByCredentials({
        email: 'john@example.com',
        password: 'secret',
        password_reset_token: 'token123'
      });

      expect(queryBuilder.where).not.toHaveBeenCalledWith('password', expect.anything());
      expect(queryBuilder.where).not.toHaveBeenCalledWith('password_reset_token', expect.anything());
    });

    it('should handle model loading without default export', () => {
      global.require = jest.fn((path) => {
        if (path.includes('User')) {
          return MockUserModel;
        }
      });

      const model = provider.createModel();

      expect(model).toBeInstanceOf(MockUserModel);
    });

    it('should handle async model methods', async () => {
      const AsyncModel = class {
        static where(field, value) {
          const instance = new AsyncModel();
          instance.queryField = field;
          instance.queryValue = value;
          return instance;
        }

        async first() {
          await new Promise(resolve => setTimeout(resolve, 10));
          if (this.queryField === 'id' && this.queryValue === 1) {
            return new AsyncModel({ id: 1 });
          }
          return null;
        }
      };

      global.require = jest.fn(() => ({ default: AsyncModel }));

      const user = await provider.retrieveById(1);

      expect(user).toBeDefined();
    });

    it('should chain method calls for fluent interface', () => {
      const result = provider
        .setHasher({ check: jest.fn() })
        .setModel('../models/Admin.js');

      expect(result).toBe(provider);
    });
  });
});
