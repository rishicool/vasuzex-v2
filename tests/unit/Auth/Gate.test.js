/**
 * Gate Tests
 * Comprehensive tests for Laravel-inspired authorization gate
 */

import { describe, expect, it, beforeEach, jest } from '@jest/globals';

describe('Gate', () => {
  let Gate;
  let mockApp;
  let mockUserResolver;
  let gate;
  let mockUser;

  beforeEach(async () => {
    // Import Gate
    const gateModule = await import('../../../framework/Auth/Access/Gate.js');
    Gate = gateModule.Gate;

    mockUser = {
      id: 1,
      name: 'John Doe',
      role: 'admin'
    };

    mockUserResolver = jest.fn(async () => mockUser);

    mockApp = {
      make: jest.fn()
    };

    gate = new Gate(mockApp, mockUserResolver);
  });

  describe('Constructor', () => {
    it('should initialize with app and user resolver', () => {
      expect(gate.app).toBe(mockApp);
      expect(gate.userResolver).toBe(mockUserResolver);
      expect(gate.abilities).toBeInstanceOf(Map);
      expect(gate.policies).toBeInstanceOf(Map);
      expect(gate.beforeCallbacks).toEqual([]);
      expect(gate.afterCallbacks).toEqual([]);
    });
  });

  describe('Ability Definition', () => {
    it('should define an ability', () => {
      const callback = jest.fn(() => true);
      gate.define('create-post', callback);

      expect(gate.has('create-post')).toBe(true);
      expect(gate.abilities.get('create-post')).toBe(callback);
    });

    it('should check if ability exists', () => {
      gate.define('edit-post', () => true);

      expect(gate.has('edit-post')).toBe(true);
      expect(gate.has('delete-post')).toBe(false);
    });

    it('should check multiple abilities at once', () => {
      gate.define('view', () => true);
      gate.define('edit', () => true);

      expect(gate.has(['view', 'edit'])).toBe(true);
      expect(gate.has(['view', 'delete'])).toBe(false);
    });

    it('should return gate instance for chaining', () => {
      const result = gate.define('create', () => true);

      expect(result).toBe(gate);
    });
  });

  describe('Resource Abilities', () => {
    it('should define resource abilities with default methods', () => {
      class PostPolicy {
        viewAny(user) { return user.role === 'admin'; }
        view(user, post) { return user.id === post.userId; }
        create(user) { return true; }
        update(user, post) { return user.id === post.userId; }
        delete(user, post) { return user.role === 'admin'; }
      }

      gate.resource('post', PostPolicy);

      expect(gate.has('post.viewAny')).toBe(true);
      expect(gate.has('post.view')).toBe(true);
      expect(gate.has('post.create')).toBe(true);
      expect(gate.has('post.update')).toBe(true);
      expect(gate.has('post.delete')).toBe(true);
    });

    it('should define resource abilities with custom methods', () => {
      class CommentPolicy {
        list(user) { return true; }
        approve(user, comment) { return user.role === 'moderator'; }
      }

      gate.resource('comment', CommentPolicy, {
        list: 'list',
        approve: 'approve'
      });

      expect(gate.has('comment.list')).toBe(true);
      expect(gate.has('comment.approve')).toBe(true);
    });
  });

  describe('Policy Definition', () => {
    it('should define a policy for a model', () => {
      class PostPolicy {}
      const result = gate.policy('Post', PostPolicy);

      expect(gate.policies.get('Post')).toBe(PostPolicy);
      expect(result).toBe(gate);
    });

    it('should define multiple policies', () => {
      class PostPolicy {}
      class CommentPolicy {}

      gate.policy('Post', PostPolicy);
      gate.policy('Comment', CommentPolicy);

      expect(gate.policies.get('Post')).toBe(PostPolicy);
      expect(gate.policies.get('Comment')).toBe(CommentPolicy);
    });
  });

  describe('Before and After Callbacks', () => {
    it('should register before callback', () => {
      const callback = jest.fn();
      const result = gate.before(callback);

      expect(gate.beforeCallbacks).toContain(callback);
      expect(result).toBe(gate);
    });

    it('should register after callback', () => {
      const callback = jest.fn();
      const result = gate.after(callback);

      expect(gate.afterCallbacks).toContain(callback);
      expect(result).toBe(gate);
    });

    it('should execute before callbacks before ability check', async () => {
      const beforeCallback = jest.fn(() => true);
      const abilityCallback = jest.fn(() => false);

      gate.before(beforeCallback);
      gate.define('test', abilityCallback);

      const result = await gate.check('test');

      expect(beforeCallback).toHaveBeenCalledWith(mockUser, 'test', []);
      expect(abilityCallback).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should execute after callbacks after ability check', async () => {
      const abilityCallback = jest.fn(() => true);
      const afterCallback = jest.fn((user, ability, result) => result);

      gate.define('test', abilityCallback);
      gate.after(afterCallback);

      const result = await gate.check('test');

      expect(afterCallback).toHaveBeenCalledWith(mockUser, 'test', true, []);
      expect(result).toBe(true);
    });

    it('should allow after callback to override result', async () => {
      const abilityCallback = jest.fn(() => true);
      const afterCallback = jest.fn(() => false);

      gate.define('test', abilityCallback);
      gate.after(afterCallback);

      const result = await gate.check('test');

      expect(result).toBe(false);
    });

    it('should skip ability check if before callback returns non-null', async () => {
      const beforeCallback = jest.fn(() => false);
      const abilityCallback = jest.fn(() => true);

      gate.before(beforeCallback);
      gate.define('test', abilityCallback);

      const result = await gate.check('test');

      expect(result).toBe(false);
      expect(abilityCallback).not.toHaveBeenCalled();
    });

    it('should continue if before callback returns null', async () => {
      const beforeCallback1 = jest.fn(() => null);
      const beforeCallback2 = jest.fn(() => undefined);
      const abilityCallback = jest.fn(() => true);

      gate.before(beforeCallback1);
      gate.before(beforeCallback2);
      gate.define('test', abilityCallback);

      const result = await gate.check('test');

      expect(result).toBe(true);
      expect(abilityCallback).toHaveBeenCalled();
    });
  });

  describe('Ability Checks', () => {
    it('should check ability with allows()', async () => {
      gate.define('edit-post', (user) => user.role === 'admin');

      const result = await gate.allows('edit-post');

      expect(result).toBe(true);
    });

    it('should check ability with denies()', async () => {
      gate.define('delete-post', (user) => user.role === 'super-admin');

      const result = await gate.denies('delete-post');

      expect(result).toBe(true);
    });

    it('should pass arguments to ability callback', async () => {
      const post = { id: 1, userId: 1 };
      gate.define('update-post', (user, post) => user.id === post.userId);

      const result = await gate.allows('update-post', [post]);

      expect(result).toBe(true);
    });

    it('should return false for undefined ability', async () => {
      const result = await gate.check('undefined-ability');

      expect(result).toBe(false);
    });

    it('should resolve user from resolver', async () => {
      gate.define('test', (user) => user.id === 1);

      await gate.check('test');

      expect(mockUserResolver).toHaveBeenCalled();
    });
  });

  describe('Policy-based Authorization', () => {
    it('should check policy method', async () => {
      class PostPolicy {
        view(user, post) {
          return user.id === post.userId;
        }
      }

      gate.policy('Post', PostPolicy);

      const post = { userId: 1, constructor: { name: 'Post' } };
      const result = await gate.check('view', [post]);

      expect(result).toBe(true);
    });

    it('should call policy before method if exists', async () => {
      class PostPolicy {
        before(user, ability) {
          if (user.role === 'admin') return true;
          return null;
        }
        view(user, post) {
          return false;
        }
      }

      gate.policy('Post', PostPolicy);

      const post = { userId: 2, constructor: { name: 'Post' } };
      const result = await gate.check('view', [post]);

      expect(result).toBe(true);
    });

    it('should find policy by model class', async () => {
      class Post {}
      class PostPolicy {
        create(user) {
          return user.role === 'admin';
        }
      }

      gate.policy(Post, PostPolicy);

      const result = await gate.check('create', [new Post()]);

      expect(result).toBe(true);
    });

    it('should find policy by model name', async () => {
      class PostPolicy {
        update(user, post) {
          return user.id === post.userId;
        }
      }

      gate.policy('Post', PostPolicy);

      const post = { userId: 1, constructor: { name: 'Post' } };
      const result = await gate.check('update', [post]);

      expect(result).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should authorize and return true', async () => {
      gate.define('create-post', () => true);

      const result = await gate.authorize('create-post');

      expect(result).toBe(true);
    });

    it('should throw error when not authorized', async () => {
      gate.define('delete-post', () => false);

      await expect(gate.authorize('delete-post')).rejects.toThrow('This action is unauthorized');
    });
  });

  describe('Any and Every', () => {
    it('should check any ability', async () => {
      gate.define('view', () => false);
      gate.define('edit', () => true);
      gate.define('delete', () => false);

      const result = await gate.any(['view', 'edit', 'delete']);

      expect(result).toBe(true);
    });

    it('should return false if no abilities match', async () => {
      gate.define('view', () => false);
      gate.define('edit', () => false);

      const result = await gate.any(['view', 'edit']);

      expect(result).toBe(false);
    });

    it('should check every ability', async () => {
      gate.define('view', () => true);
      gate.define('edit', () => true);
      gate.define('delete', () => true);

      const result = await gate.every(['view', 'edit', 'delete']);

      expect(result).toBe(true);
    });

    it('should return false if any ability fails', async () => {
      gate.define('view', () => true);
      gate.define('edit', () => false);
      gate.define('delete', () => true);

      const result = await gate.every(['view', 'edit', 'delete']);

      expect(result).toBe(false);
    });
  });

  describe('For User', () => {
    it('should create gate for specific user', async () => {
      const otherUser = { id: 2, name: 'Jane', role: 'user' };
      gate.define('admin-action', (user) => user.role === 'admin');

      const userGate = gate.forUser(otherUser);

      const result1 = await gate.allows('admin-action');
      const result2 = await userGate.allows('admin-action');

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should copy abilities to new gate', async () => {
      gate.define('test', () => true);

      const userGate = gate.forUser({ id: 2 });

      expect(userGate.has('test')).toBe(true);
    });

    it('should copy policies to new gate', () => {
      class PostPolicy {}
      gate.policy('Post', PostPolicy);

      const userGate = gate.forUser({ id: 2 });

      expect(userGate.policies.get('Post')).toBe(PostPolicy);
    });

    it('should copy callbacks to new gate', () => {
      const beforeCb = jest.fn();
      const afterCb = jest.fn();

      gate.before(beforeCb);
      gate.after(afterCb);

      const userGate = gate.forUser({ id: 2 });

      expect(userGate.beforeCallbacks).toContain(beforeCb);
      expect(userGate.afterCallbacks).toContain(afterCb);
    });
  });

  describe('Edge Cases', () => {
    it('should handle async ability callbacks', async () => {
      gate.define('async-check', async (user) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return user.role === 'admin';
      });

      const result = await gate.allows('async-check');

      expect(result).toBe(true);
    });

    it('should handle multiple arguments in ability', async () => {
      gate.define('complex-check', (user, arg1, arg2, arg3) => {
        return user.role === 'admin' && arg1 && arg2 && arg3;
      });

      const result = await gate.allows('complex-check', [true, true, true]);

      expect(result).toBe(true);
    });

    it('should handle policy with string class path', async () => {
      // Mock require to return policy class
      const originalRequire = global.require;
      global.require = jest.fn((path) => {
        if (path.includes('PostPolicy')) {
          return {
            default: class {
              view() { return true; }
            }
          };
        }
        return originalRequire(path);
      });

      gate.policy('Post', './PostPolicy.js');

      const post = { constructor: { name: 'Post' } };
      const result = await gate.check('view', [post]);

      global.require = originalRequire;

      expect(result).toBe(true);
    });

    it('should handle policy instance directly', async () => {
      const policyInstance = {
        view: (user) => user.role === 'admin'
      };

      gate.policy('Post', policyInstance);

      const post = { constructor: { name: 'Post' } };
      const result = await gate.check('view', [post]);

      expect(result).toBe(true);
    });

    it('should handle empty abilities array', async () => {
      const result1 = await gate.any([]);
      const result2 = await gate.every([]);

      expect(result1).toBe(false);
      expect(result2).toBe(true);
    });

    it('should handle null user from resolver', async () => {
      const nullGate = new Gate(mockApp, async () => null);
      nullGate.define('test', (user) => user !== null);

      const result = await nullGate.check('test');

      expect(result).toBe(false);
    });

    it('should handle multiple before callbacks', async () => {
      const before1 = jest.fn(() => null);
      const before2 = jest.fn(() => null);
      const before3 = jest.fn(() => true);
      const ability = jest.fn(() => false);

      gate.before(before1);
      gate.before(before2);
      gate.before(before3);
      gate.define('test', ability);

      const result = await gate.check('test');

      expect(before1).toHaveBeenCalled();
      expect(before2).toHaveBeenCalled();
      expect(before3).toHaveBeenCalled();
      expect(ability).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle multiple after callbacks', async () => {
      const after1 = jest.fn((user, ability, result) => result);
      const after2 = jest.fn(() => null);
      const after3 = jest.fn(() => false);

      gate.define('test', () => true);
      gate.after(after1);
      gate.after(after2);
      gate.after(after3);

      const result = await gate.check('test');

      expect(after1).toHaveBeenCalled();
      expect(after2).toHaveBeenCalled();
      expect(after3).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle policy method with arguments', async () => {
      class PostPolicy {
        before(user, ability, ...args) {
          return null;
        }
        update(user, post, data) {
          return user.id === post.userId && data.title;
        }
      }

      gate.policy('Post', PostPolicy);

      const post = { userId: 1, constructor: { name: 'Post' } };
      const data = { title: 'New Title' };
      
      const result = await gate.check('update', [post, data]);

      expect(result).toBe(true);
    });

    it('should handle denies as opposite of allows', async () => {
      gate.define('test-true', () => true);
      gate.define('test-false', () => false);

      const allows1 = await gate.allows('test-true');
      const denies1 = await gate.denies('test-true');
      const allows2 = await gate.allows('test-false');
      const denies2 = await gate.denies('test-false');

      expect(allows1).toBe(true);
      expect(denies1).toBe(false);
      expect(allows2).toBe(false);
      expect(denies2).toBe(true);
    });
  });
});
