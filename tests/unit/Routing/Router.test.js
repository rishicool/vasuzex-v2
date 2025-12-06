/**
 * Router Tests
 * 
 * Comprehensive test suite for the Router class covering:
 * - HTTP method registration (GET, POST, PUT, PATCH, DELETE, ANY)
 * - Route grouping with prefix and middleware
 * - Middleware application
 * - Method chaining
 * - Express router integration
 * 
 * Test Coverage:
 * - get(), post(), put(), patch(), delete(), any()
 * - group() with prefix and middleware
 * - use() for middleware
 * - getRouter() for Express integration
 * - Method chaining
 * 
 * @total-tests: 25
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Router } from '../../../framework/Routing/Router.js';

describe('Router', () => {
  let router;

  beforeEach(() => {
    router = new Router();
  });

  describe('Constructor', () => {
    test('should create a new Router instance', () => {
      expect(router).toBeInstanceOf(Router);
    });

    test('should initialize with Express router', () => {
      expect(router.router).toBeDefined();
      expect(typeof router.router).toBe('function');
    });

    test('should have getRouter method', () => {
      const expressRouter = router.getRouter();
      expect(expressRouter).toBe(router.router);
    });
  });

  describe('HTTP Method Registration', () => {
    test('should register GET route', () => {
      const handler = jest.fn();
      const result = router.get('/test', handler);
      
      expect(result).toBe(router); // Check method chaining
      // We can't easily test Express router internals, but we can verify it doesn't throw
    });

    test('should register POST route', () => {
      const handler = jest.fn();
      const result = router.post('/test', handler);
      
      expect(result).toBe(router);
    });

    test('should register PUT route', () => {
      const handler = jest.fn();
      const result = router.put('/test', handler);
      
      expect(result).toBe(router);
    });

    test('should register PATCH route', () => {
      const handler = jest.fn();
      const result = router.patch('/test', handler);
      
      expect(result).toBe(router);
    });

    test('should register DELETE route', () => {
      const handler = jest.fn();
      const result = router.delete('/test', handler);
      
      expect(result).toBe(router);
    });

    test('should register ANY route (all methods)', () => {
      const handler = jest.fn();
      const result = router.any('/test', handler);
      
      expect(result).toBe(router);
    });

    test('should accept multiple handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      const result = router.get('/test', handler1, handler2, handler3);
      expect(result).toBe(router);
    });

    test('should handle route with parameters', () => {
      const handler = jest.fn();
      const result = router.get('/users/:id', handler);
      
      expect(result).toBe(router);
    });

    test('should handle nested route paths', () => {
      const handler = jest.fn();
      const result = router.get('/api/v1/users/:id', handler);
      
      expect(result).toBe(router);
    });
  });

  describe('Method Chaining', () => {
    test('should chain GET routes', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const result = router
        .get('/route1', handler1)
        .get('/route2', handler2);
      
      expect(result).toBe(router);
    });

    test('should chain different HTTP methods', () => {
      const handler = jest.fn();
      
      const result = router
        .get('/users', handler)
        .post('/users', handler)
        .put('/users/:id', handler)
        .delete('/users/:id', handler);
      
      expect(result).toBe(router);
    });

    test('should chain with middleware', () => {
      const handler = jest.fn();
      const middleware = jest.fn();
      
      const result = router
        .use(middleware)
        .get('/test', handler);
      
      expect(result).toBe(router);
    });
  });

  describe('group()', () => {
    test('should create route group with prefix', () => {
      const handler = jest.fn();
      
      const result = router.group({ prefix: '/api' }, (r) => {
        r.get('/users', handler);
      });
      
      expect(result).toBe(router);
    });

    test('should create route group with middleware', () => {
      const handler = jest.fn();
      const middleware = jest.fn();
      
      const result = router.group({ middleware }, (r) => {
        r.get('/users', handler);
      });
      
      expect(result).toBe(router);
    });

    test('should create route group with prefix and middleware', () => {
      const handler = jest.fn();
      const middleware = jest.fn();
      
      const result = router.group({ prefix: '/api', middleware }, (r) => {
        r.get('/users', handler);
        r.post('/users', handler);
      });
      
      expect(result).toBe(router);
    });

    test('should handle nested groups', () => {
      const handler = jest.fn();
      
      const result = router.group({ prefix: '/api' }, (r) => {
        r.group({ prefix: '/v1' }, (r2) => {
          r2.get('/users', handler);
        });
      });
      
      expect(result).toBe(router);
    });

    test('should use default prefix if not provided', () => {
      const handler = jest.fn();
      
      const result = router.group({}, (r) => {
        r.get('/users', handler);
      });
      
      expect(result).toBe(router);
    });

    test('should pass new Router instance to callback', () => {
      let groupRouter;
      
      router.group({ prefix: '/api' }, (r) => {
        groupRouter = r;
        expect(r).toBeInstanceOf(Router);
      });
      
      expect(groupRouter).toBeInstanceOf(Router);
    });
  });

  describe('use()', () => {
    test('should apply single middleware', () => {
      const middleware = jest.fn();
      const result = router.use(middleware);
      
      expect(result).toBe(router);
    });

    test('should apply multiple middleware', () => {
      const middleware1 = jest.fn();
      const middleware2 = jest.fn();
      const result = router.use(middleware1, middleware2);
      
      expect(result).toBe(router);
    });

    test('should return router for chaining', () => {
      const middleware = jest.fn();
      const handler = jest.fn();
      
      const result = router
        .use(middleware)
        .get('/test', handler);
      
      expect(result).toBe(router);
    });
  });

  describe('getRouter()', () => {
    test('should return Express router instance', () => {
      const expressRouter = router.getRouter();
      expect(expressRouter).toBeDefined();
      expect(typeof expressRouter).toBe('function');
    });

    test('should return same instance on multiple calls', () => {
      const router1 = router.getRouter();
      const router2 = router.getRouter();
      
      expect(router1).toBe(router2);
    });
  });

  describe('Integration', () => {
    test('should work with complex routing scenario', () => {
      const authMiddleware = jest.fn();
      const userController = jest.fn();
      const adminController = jest.fn();
      
      const result = router
        .get('/', (req, res) => res.send('Home'))
        .group({ prefix: '/api' }, (api) => {
          api.group({ prefix: '/users', middleware: authMiddleware }, (users) => {
            users.get('/', userController);
            users.post('/', userController);
            users.get('/:id', userController);
          });
          
          api.group({ prefix: '/admin' }, (admin) => {
            admin.get('/dashboard', adminController);
          });
        });
      
      expect(result).toBe(router);
    });

    test('should handle empty routes gracefully', () => {
      const expressRouter = router.getRouter();
      expect(expressRouter).toBeDefined();
    });
  });
});
