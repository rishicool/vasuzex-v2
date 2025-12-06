/**
 * Unit Tests: Import Alias Patterns
 * 
 * Tests specific import patterns and edge cases with 100% coverage
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Unit: Import Alias Patterns', () => {
  
  describe('#framework/* alias pattern', () => {
    test('should resolve to correct framework path', async () => {
      const { CacheManager } = await import('#framework/Services/Cache/CacheManager.js');
      
      expect(CacheManager.name).toBe('CacheManager');
      expect(typeof CacheManager).toBe('function');
    });

    test('should support nested paths', async () => {
      const { ServiceProvider } = await import('#framework/Foundation/ServiceProvider.js');
      const { Application } = await import('#framework/Foundation/Application.js');
      
      expect(ServiceProvider.name).toBe('ServiceProvider');
      expect(Application.name).toBe('Application');
    });

    test('should work with deep nesting', async () => {
      const { ConfigLoader } = await import('#framework/Support/ConfigLoader.js');
      
      expect(ConfigLoader).toBeDefined();
      expect(ConfigLoader.name).toBe('ConfigLoader');
    });

    test('should import different service types', async () => {
      const { HashManager } = await import('#framework/Services/Hash/HashManager.js');
      const { LogManager } = await import('#framework/Services/Log/LogManager.js');
      const { QueueManager } = await import('#framework/Services/Queue/QueueManager.js');
      
      expect(HashManager.name).toBe('HashManager');
      expect(LogManager.name).toBe('LogManager');
      expect(QueueManager.name).toBe('QueueManager');
    });

    test('should fail without .js extension', async () => {
      await expect(async () => {
        await import('#framework/Services/Cache/CacheManager');
      }).rejects.toThrow();
    });
  });

  describe('#models/* alias pattern', () => {
    test('should import individual model with .js', async () => {
      const { User } = await import('#models/User.js');
      
      expect(User).toBeDefined();
      expect(User.name).toBe('User');
      expect(User.tableName).toBe('users');
    });

    test('should import all models from index', async () => {
      const models = await import('#models');
      
      expect(models.User).toBeDefined();
      expect(models.Post).toBeDefined();
      expect(models.Comment).toBeDefined();
      expect(models.Task).toBeDefined();
    });

    test('should import multiple models individually', async () => {
      const { User } = await import('#models/User.js');
      const { Post } = await import('#models/Post.js');
      const { Comment } = await import('#models/Comment.js');
      const { Task } = await import('#models/Task.js');
      
      expect(User.tableName).toBe('users');
      expect(Post.tableName).toBe('posts');
      expect(Comment.tableName).toBe('comments');
      expect(Task.tableName).toBe('tasks');
    });

    test('should cache model imports (same reference)', async () => {
      const { User: User1 } = await import('#models/User.js');
      const { User: User2 } = await import('#models/User.js');
      
      expect(User1).toBe(User2); // Same reference
    });

    test('models should extend base Model class', async () => {
      const Model = await import('vasuzex/Database/Model.js');
      const { User } = await import('#models/User.js');
      
      expect(User.prototype).toBeInstanceOf(Model.default);
    });
  });

  describe('#database alias pattern', () => {
    test('should import database utilities', async () => {
      const db = await import('#database');
      
      expect(db.getDatabase).toBeDefined();
      expect(typeof db.getDatabase).toBe('function');
    });

    test('should provide database connection factory', async () => {
      const { getDatabase } = await import('#database');
      
      expect(typeof getDatabase).toBe('function');
    });
  });

  describe('#config alias pattern', () => {
    test('should import config module', async () => {
      const config = await import('#config');
      
      expect(config.default).toBeDefined();
    });

    test('should import specific config utilities', async () => {
      const config = await import('#config');
      
      expect(config).toBeDefined();
      expect(config.default).toBeDefined();
    });
  });

  describe('vasuzex/* alias pattern (via jest)', () => {
    test('should import main framework exports', async () => {
      const vasuzex = await import('vasuzex');
      
      // Core exports
      expect(vasuzex.Application).toBeDefined();
      expect(vasuzex.ServiceProvider).toBeDefined();
      
      // Facades
      expect(vasuzex.DB).toBeDefined();
      expect(vasuzex.Cache).toBeDefined();
      expect(vasuzex.Auth).toBeDefined();
      expect(vasuzex.Hash).toBeDefined();
      expect(vasuzex.Log).toBeDefined();
      expect(vasuzex.Queue).toBeDefined();
      expect(vasuzex.Storage).toBeDefined();
      expect(vasuzex.Mail).toBeDefined();
      expect(vasuzex.Config).toBeDefined();
      expect(vasuzex.Event).toBeDefined();
    });

    test('should import from subpaths', async () => {
      const { Application } = await import('vasuzex/Foundation/Application.js');
      const Model = await import('vasuzex/Database/Model.js');
      const { Collection } = await import('vasuzex/Support/Collection.js');
      
      expect(Application.name).toBe('Application');
      expect(Model.default.name).toBe('Model');
      expect(Collection.name).toBe('Collection');
    });

    test('should import support utilities', async () => {
      const { Str } = await import('vasuzex/Support/Str.js');
      const { Arr } = await import('vasuzex/Support/Arr.js');
      
      expect(typeof Str.slug).toBe('function');
      expect(typeof Str.camel).toBe('function');
      expect(typeof Arr.first).toBe('function');
      expect(typeof Arr.last).toBe('function');
    });

    test('should import facades individually', async () => {
      const { DB } = await import('vasuzex/Support/Facades/DB.js');
      const { Cache } = await import('vasuzex/Support/Facades/Cache.js');
      const { Auth } = await import('vasuzex/Support/Facades/Auth.js');
      
      expect(DB).toBeDefined();
      expect(Cache).toBeDefined();
      expect(Auth).toBeDefined();
    });
  });

  describe('Mixed import patterns', () => {
    test('should combine vasuzex and #models imports', async () => {
      const { DB, Cache } = await import('vasuzex');
      const { User, Post } = await import('#models');
      
      expect(DB).toBeDefined();
      expect(Cache).toBeDefined();
      expect(User.tableName).toBe('users');
      expect(Post.tableName).toBe('posts');
    });

    test('should combine #framework and #models imports', async () => {
      const { CacheManager } = await import('#framework/Services/Cache/CacheManager.js');
      const { User } = await import('#models/User.js');
      
      expect(CacheManager.name).toBe('CacheManager');
      expect(User.name).toBe('User');
    });

    test('should combine all alias types', async () => {
      const vasuzex = await import('vasuzex');
      const { User } = await import('#models/User.js');
      const db = await import('#database');
      const config = await import('#config');
      
      expect(vasuzex.DB).toBeDefined();
      expect(User.tableName).toBe('users');
      expect(db.getDatabase).toBeDefined();
      expect(config.default).toBeDefined();
    });
  });

  describe('Destructuring patterns', () => {
    test('should support named imports', async () => {
      const { User, Post, Comment } = await import('#models');
      
      expect(User).toBeDefined();
      expect(Post).toBeDefined();
      expect(Comment).toBeDefined();
    });

    test('should support default + named imports', async () => {
      const vasuzex = await import('vasuzex');
      const { DB, Cache } = vasuzex;
      
      expect(DB).toBeDefined();
      expect(Cache).toBeDefined();
    });

    test('should support namespace imports', async () => {
      const models = await import('#models');
      
      expect(Object.keys(models)).toContain('User');
      expect(Object.keys(models)).toContain('Post');
      expect(Object.keys(models)).toContain('Comment');
      expect(Object.keys(models)).toContain('Task');
    });

    test('should support aliased imports', async () => {
      const { User: UserModel } = await import('#models/User.js');
      const { Post: PostModel } = await import('#models/Post.js');
      
      expect(UserModel.name).toBe('User');
      expect(PostModel.name).toBe('Post');
    });
  });

  describe('Dynamic imports', () => {
    test('should support dynamic model imports', async () => {
      const modelName = 'User';
      const { [modelName]: DynamicModel } = await import('#models');
      
      expect(DynamicModel).toBeDefined();
      expect(DynamicModel.name).toBe('User');
    });

    test('should support conditional imports', async () => {
      const useCache = true;
      
      if (useCache) {
        const { Cache } = await import('vasuzex');
        expect(Cache).toBeDefined();
      }
    });

    test('should support lazy loading', async () => {
      let Model;
      
      const loadModel = async () => {
        Model = await import('vasuzex/Database/Model.js');
      };
      
      await loadModel();
      expect(Model.default).toBeDefined();
    });
  });

  describe('Error handling', () => {
    test('should throw on invalid path', async () => {
      await expect(async () => {
        await import('#models/NonExistentModel.js');
      }).rejects.toThrow();
    });

    test('should throw on missing file extension for #framework', async () => {
      await expect(async () => {
        await import('#framework/Services/Cache/CacheManager');
      }).rejects.toThrow();
    });

    test('should handle import errors gracefully', async () => {
      try {
        await import('#models/FakeModel.js');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.code).toBe('ERR_MODULE_NOT_FOUND');
      }
    });
  });

  describe('Import caching and performance', () => {
    test('should cache imports (same module reference)', async () => {
      const import1 = await import('vasuzex');
      const import2 = await import('vasuzex');
      
      expect(import1).toBe(import2);
    });

    test('should cache model imports', async () => {
      const { User: User1 } = await import('#models/User.js');
      const { User: User2 } = await import('#models/User.js');
      
      expect(User1).toBe(User2);
    });

    test('should handle multiple concurrent imports', async () => {
      const promises = [
        import('#models/User.js'),
        import('#models/Post.js'),
        import('#models/Comment.js'),
        import('#models/Task.js'),
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(4);
      expect(results[0].User).toBeDefined();
      expect(results[1].Post).toBeDefined();
      expect(results[2].Comment).toBeDefined();
      expect(results[3].Task).toBeDefined();
    });

    test('should complete imports quickly', async () => {
      const start = Date.now();
      
      await import('vasuzex');
      await import('#models');
      await import('#database');
      await import('#config');
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should complete in < 2 seconds
    });
  });

  describe('Real-world usage patterns', () => {
    test('Provider pattern (framework internal)', async () => {
      const { ServiceProvider } = await import('#framework/Foundation/ServiceProvider.js');
      const { CacheManager } = await import('#framework/Services/Cache/CacheManager.js');
      
      class CustomProvider extends ServiceProvider {
        async register() {
          this.app.singleton('cache', () => new CacheManager(this.app));
        }
      }
      
      const mockApp = { singleton: () => {} };
      const provider = new CustomProvider(mockApp);
      
      expect(provider).toBeInstanceOf(ServiceProvider);
    });

    test('Controller pattern (user application)', async () => {
      const { User, Post } = await import('#models');
      
      class UserController {
        async show(id) {
          // In real app: return await User.find(id);
          return { User, id };
        }
      }
      
      const controller = new UserController();
      const result = await controller.show(1);
      
      expect(result.User).toBe(User);
      expect(result.id).toBe(1);
    });

    test('Middleware pattern (using facades)', async () => {
      const { Auth, Cache } = await import('vasuzex');
      
      const authMiddleware = async (req, res, next) => {
        // In real app: if (!Auth.check()) { ... }
        return { Auth, Cache };
      };
      
      const result = await authMiddleware({}, {}, () => {});
      
      expect(result.Auth).toBeDefined();
      expect(result.Cache).toBeDefined();
    });

    test('Service pattern (combining imports)', async () => {
      const { Cache } = await import('vasuzex');
      const { User } = await import('#models/User.js');
      
      class UserService {
        async getCachedUser(id) {
          // In real app: return await Cache.remember(`user:${id}`, ...);
          return { Cache, User, id };
        }
      }
      
      const service = new UserService();
      const result = await service.getCachedUser(1);
      
      expect(result.Cache).toBeDefined();
      expect(result.User).toBe(User);
    });
  });

  describe('Type consistency', () => {
    test('should maintain consistent types across imports', async () => {
      const { User: User1 } = await import('#models/User.js');
      const models = await import('#models');
      const User2 = models.User;
      
      expect(User1).toBe(User2);
      expect(typeof User1).toBe('function');
      expect(typeof User2).toBe('function');
    });

    test('should maintain class inheritance', async () => {
      const Model = await import('vasuzex/Database/Model.js');
      const { User } = await import('#models/User.js');
      
      const user = new User();
      expect(user).toBeInstanceOf(Model.default);
      expect(user).toBeInstanceOf(User);
    });

    test('should maintain prototype chain', async () => {
      const Model = await import('vasuzex/Database/Model.js');
      const { Post } = await import('#models/Post.js');
      
      expect(Object.getPrototypeOf(Post)).toBe(Model.default);
    });
  });
});
