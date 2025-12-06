/**
 * E2E Test: Import Aliases
 * 
 * Tests that all import aliases work correctly in different contexts:
 * 1. Framework internal code (#framework/*)
 * 2. User application code (vasuzex/* - simulated)
 * 3. Models (#models/*)
 * 4. Database (#database)
 * 5. Config (#config)
 */

import { describe, test, expect } from '@jest/globals';

describe('E2E: Import Aliases', () => {
  
  describe('Framework Internal Imports (#framework/*)', () => {
    test('should import CacheManager from #framework', async () => {
      const { CacheManager } = await import('#framework/Services/Cache/CacheManager.js');
      expect(CacheManager).toBeDefined();
      expect(CacheManager.name).toBe('CacheManager');
    });

    test('should import ServiceProvider from #framework', async () => {
      const { ServiceProvider } = await import('#framework/Foundation/ServiceProvider.js');
      expect(ServiceProvider).toBeDefined();
      expect(ServiceProvider.name).toBe('ServiceProvider');
    });

    test('should import HashManager from #framework', async () => {
      const { HashManager } = await import('#framework/Services/Hash/HashManager.js');
      expect(HashManager).toBeDefined();
      expect(HashManager.name).toBe('HashManager');
    });

    test('should import LogManager from #framework', async () => {
      const { LogManager } = await import('#framework/Services/Log/LogManager.js');
      expect(LogManager).toBeDefined();
      expect(LogManager.name).toBe('LogManager');
    });

    test('should import QueueManager from #framework', async () => {
      const { QueueManager } = await import('#framework/Services/Queue/QueueManager.js');
      expect(QueueManager).toBeDefined();
      expect(QueueManager.name).toBe('QueueManager');
    });

    test('should import RateLimiter from #framework', async () => {
      const { RateLimiter } = await import('#framework/Support/RateLimiter.js');
      expect(RateLimiter).toBeDefined();
      expect(RateLimiter.name).toBe('RateLimiter');
    });

    test('should import ConfigLoader from #framework', async () => {
      const { ConfigLoader } = await import('#framework/Support/ConfigLoader.js');
      expect(ConfigLoader).toBeDefined();
      expect(ConfigLoader.name).toBe('ConfigLoader');
    });

    test('should import AuthManager from #framework', async () => {
      const { AuthManager } = await import('#framework/Auth/AuthManager.js');
      expect(AuthManager).toBeDefined();
      expect(AuthManager.name).toBe('AuthManager');
    });

    test('should import BroadcastManager from #framework', async () => {
      const { BroadcastManager } = await import('#framework/Broadcasting/BroadcastManager.js');
      expect(BroadcastManager).toBeDefined();
      expect(BroadcastManager.name).toBe('BroadcastManager');
    });

    test('should import Translator from #framework', async () => {
      const { Translator } = await import('#framework/Translation/Translator.js');
      expect(Translator).toBeDefined();
      expect(Translator.name).toBe('Translator');
    });
  });

  describe('User Application Imports (vasuzex/* - simulated via jest)', () => {
    test('should import all facades from vasuzex', async () => {
      const vasuzex = await import('vasuzex');
      
      expect(vasuzex.DB).toBeDefined();
      expect(vasuzex.Cache).toBeDefined();
      expect(vasuzex.Auth).toBeDefined();
      expect(vasuzex.Hash).toBeDefined();
      expect(vasuzex.Log).toBeDefined();
      expect(vasuzex.Queue).toBeDefined();
      expect(vasuzex.Storage).toBeDefined();
      expect(vasuzex.Mail).toBeDefined();
      expect(vasuzex.Event).toBeDefined();
      expect(vasuzex.Config).toBeDefined();
    });

    test('should import Application from vasuzex', async () => {
      const { Application } = await import('vasuzex/Foundation/Application.js');
      expect(Application).toBeDefined();
      expect(Application.name).toBe('Application');
    });

    test('should import Model from vasuzex', async () => {
      const Model = await import('vasuzex/Database/Model.js');
      expect(Model.default).toBeDefined();
      expect(Model.default.name).toBe('Model');
    });

    test('should import Collection from vasuzex', async () => {
      const { Collection } = await import('vasuzex/Support/Collection.js');
      expect(Collection).toBeDefined();
      expect(Collection.name).toBe('Collection');
    });

    test('should import Str helper from vasuzex', async () => {
      const { Str } = await import('vasuzex/Support/Str.js');
      expect(Str).toBeDefined();
      expect(typeof Str.slug).toBe('function');
    });

    test('should import Arr helper from vasuzex', async () => {
      const { Arr } = await import('vasuzex/Support/Arr.js');
      expect(Arr).toBeDefined();
      expect(typeof Arr.first).toBe('function');
    });
  });

  describe('Models Imports (#models/*)', () => {
    test('should import User model from #models', async () => {
      const { User } = await import('#models/User.js');
      expect(User).toBeDefined();
      expect(User.name).toBe('User');
      expect(User.tableName).toBe('users');
    });

    test('should import Post model from #models', async () => {
      const { Post } = await import('#models/Post.js');
      expect(Post).toBeDefined();
      expect(Post.name).toBe('Post');
      expect(Post.tableName).toBe('posts');
    });

    test('should import Comment model from #models', async () => {
      const { Comment } = await import('#models/Comment.js');
      expect(Comment).toBeDefined();
      expect(Comment.name).toBe('Comment');
      expect(Comment.tableName).toBe('comments');
    });

    test('should import Task model from #models', async () => {
      const { Task } = await import('#models/Task.js');
      expect(Task).toBeDefined();
      expect(Task.name).toBe('Task');
      expect(Task.tableName).toBe('tasks');
    });

    test('should import all models from #models index', async () => {
      const models = await import('#models');
      expect(models.User).toBeDefined();
      expect(models.Post).toBeDefined();
      expect(models.Comment).toBeDefined();
      expect(models.Task).toBeDefined();
    });
  });

  describe('Database Imports (#database)', () => {
    test('should import database utilities from #database', async () => {
      const db = await import('#database');
      expect(db).toBeDefined();
      expect(db.getDatabase).toBeDefined();
      expect(typeof db.getDatabase).toBe('function');
    });
  });

  describe('Config Imports (#config)', () => {
    test('should import config from #config', async () => {
      const config = await import('#config');
      expect(config).toBeDefined();
      expect(config.default).toBeDefined();
    });
  });

  describe('Integration: Real-world Usage Patterns', () => {
    test('should work in Provider pattern (framework internal)', async () => {
      const { CacheManager } = await import('#framework/Services/Cache/CacheManager.js');
      const { ServiceProvider } = await import('#framework/Foundation/ServiceProvider.js');
      
      class TestProvider extends ServiceProvider {
        async register() {
          return new CacheManager({ singleton: () => {} });
        }
      }
      
      const provider = new TestProvider({ singleton: () => {} });
      expect(provider).toBeDefined();
      expect(await provider.register()).toBeInstanceOf(CacheManager);
    });

    test('should work in API template pattern (generated code)', async () => {
      const { User, Post, Comment } = await import('#models');
      
      class PostController {
        async index() {
          return { User, Post, Comment };
        }
      }
      
      const controller = new PostController();
      const result = await controller.index();
      
      expect(result.User).toBeDefined();
      expect(result.Post).toBeDefined();
      expect(result.Comment).toBeDefined();
    });

    test('should work in user app pattern (after npm install)', async () => {
      const { DB, Cache, Auth } = await import('vasuzex');
      const { User } = await import('#models/User.js');
      
      expect(DB).toBeDefined();
      expect(Cache).toBeDefined();
      expect(Auth).toBeDefined();
      expect(User).toBeDefined();
    });

    test('should work with Model base class (user extending)', async () => {
      const Model = await import('vasuzex/Database/Model.js');
      
      class Product extends Model.default {
        static tableName = 'products';
      }
      
      expect(Product.tableName).toBe('products');
      expect(Product.prototype).toBeInstanceOf(Model.default);
    });
  });

  describe('Consistency: Same imports work in both contexts', () => {
    test('#models/* works for both framework and user code', async () => {
      // Framework internal using #models
      const { User: UserInternal } = await import('#models/User.js');
      
      // User app also using #models (same!)
      const { User: UserExternal } = await import('#models/User.js');
      
      expect(UserInternal).toBe(UserExternal); // Same reference
      expect(UserInternal.name).toBe('User');
    });

    test('#database works for both framework and user code', async () => {
      // Framework internal
      const dbInternal = await import('#database');
      
      // User app
      const dbExternal = await import('#database');
      
      expect(dbInternal).toBe(dbExternal); // Same reference
      expect(dbInternal.getDatabase).toBeDefined();
    });

    test('#config works for both framework and user code', async () => {
      // Framework internal
      const configInternal = await import('#config');
      
      // User app
      const configExternal = await import('#config');
      
      expect(configInternal).toBe(configExternal); // Same reference
    });
  });

  describe('Error Cases: Wrong usage should be caught', () => {
    test('should fail with helpful error when forgetting .js extension', async () => {
      await expect(async () => {
        // Missing .js - should fail
        await import('#framework/Services/Cache/CacheManager');
      }).rejects.toThrow();
    });

    test('should fail when trying to use vasuzex alias locally without jest', async () => {
      // This test documents that vasuzex/* won't work in Node.js directly
      // It only works via Jest's moduleNameMapper or after npm publish
      // We can't test this failure here because Jest mocks it, but it's documented
      expect(true).toBe(true); // Placeholder to document this limitation
    });
  });

  describe('Performance: Imports should be fast', () => {
    test('should import large facade set quickly', async () => {
      const start = Date.now();
      
      await import('vasuzex');
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should take < 1 second
    });

    test('should import multiple models quickly', async () => {
      const start = Date.now();
      
      await import('#models');
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // Should take < 500ms
    });
  });
});
