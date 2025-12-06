/**
 * BaseApp Unit Tests
 * Tests for framework/Foundation/BaseApp.js
 * 
 * Coverage:
 * - Constructor and inheritance from Application
 * - App metadata (setAppInfo)
 * - Build process orchestration
 * - Middleware setup lifecycle
 * - Route registration and setup
 * - Error handlers integration
 * - getExpress() method
 * - Boot process with service providers
 * - Build state management (middleware/routes setup flags)
 */

import { jest } from '@jest/globals';
import { BaseApp } from '../../../framework/Foundation/BaseApp.js';

describe('BaseApp', () => {
  let app;

  beforeEach(() => {
    // Silence console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      app = new BaseApp();

      expect(app.serviceName).toBe('app');
      expect(app.appName).toBeUndefined();
      expect(app.appType).toBeUndefined();
      expect(app.middlewareSetup).toBe(false);
      expect(app.routesSetup).toBe(false);
    });

    it('should initialize with custom options using serviceName', () => {
      app = new BaseApp({
        serviceName: 'my-service',
        appType: 'api',
      });

      expect(app.serviceName).toBe('my-service');
      expect(app.appType).toBe('api');
    });

    it('should initialize with custom options using appName', () => {
      app = new BaseApp({
        appName: 'my-app',
        appType: 'web',
      });

      expect(app.serviceName).toBe('my-app');
      expect(app.appName).toBe('my-app');
      expect(app.appType).toBe('web');
    });

    it('should prioritize serviceName over appName for serviceName property', () => {
      app = new BaseApp({
        serviceName: 'service-name',
        appName: 'app-name',
      });

      expect(app.serviceName).toBe('service-name');
      expect(app.appName).toBe('app-name');
    });

    it('should inherit from Application and have express instance', () => {
      app = new BaseApp();

      expect(app.express).toBeDefined();
      expect(app.providers).toEqual([]);
      expect(app.booted).toBe(false);
      expect(app.bootstrapped).toBe(false);
    });

    it('should use rootDir option when provided', () => {
      app = new BaseApp({ rootDir: '/custom/root' });

      expect(app.rootDir).toBe('/custom/root');
    });

    it('should use projectRoot as fallback for rootDir', () => {
      app = new BaseApp({ projectRoot: '/project/root' });

      expect(app.rootDir).toBe('/project/root');
    });
  });

  describe('setAppInfo()', () => {
    it('should set app name and type', () => {
      app = new BaseApp();
      const result = app.setAppInfo('test-app', 'api');

      expect(app.appName).toBe('test-app');
      expect(app.appType).toBe('api');
      expect(result).toBe(app); // Should return this for chaining
    });

    it('should allow method chaining', () => {
      app = new BaseApp();
      const result = app.setAppInfo('test-app', 'web');

      expect(result).toBeInstanceOf(BaseApp);
    });

    it('should update existing app info', () => {
      app = new BaseApp({ appName: 'old-name', appType: 'old-type' });
      app.setAppInfo('new-name', 'new-type');

      expect(app.appName).toBe('new-name');
      expect(app.appType).toBe('new-type');
    });
  });

  describe('build()', () => {
    it('should call setupCustomMiddleware on first build', () => {
      app = new BaseApp();
      const spy = jest.spyOn(app, 'setupCustomMiddleware');

      app.build();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(app.middlewareSetup).toBe(true);
    });

    it('should call setupRoutes on first build', () => {
      app = new BaseApp();
      const spy = jest.spyOn(app, 'setupRoutes');

      app.build();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(app.routesSetup).toBe(true);
    });

    it('should not call setupCustomMiddleware twice', () => {
      app = new BaseApp();
      const spy = jest.spyOn(app, 'setupCustomMiddleware');

      app.build();
      app.build();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not call setupRoutes twice', () => {
      app = new BaseApp();
      const spy = jest.spyOn(app, 'setupRoutes');

      app.build();
      app.build();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return express instance', () => {
      app = new BaseApp();
      const result = app.build();

      expect(result).toBe(app.express);
    });

    it('should setup error handlers when provided', () => {
      const notFoundHandler = jest.fn((req, res, next) => {});
      const errorHandler = jest.fn((err, req, res, next) => {});

      app = new BaseApp();
      app.getErrorHandlers = () => ({ notFoundHandler, errorHandler });
      
      const useSpy = jest.spyOn(app.express, 'use');
      app.build();

      expect(useSpy).toHaveBeenCalledWith(notFoundHandler);
      expect(useSpy).toHaveBeenCalledWith(errorHandler);
    });

    it('should handle only notFoundHandler when errorHandler not provided', () => {
      const notFoundHandler = jest.fn();

      app = new BaseApp();
      app.getErrorHandlers = () => ({ notFoundHandler });
      
      const useSpy = jest.spyOn(app.express, 'use');
      app.build();

      expect(useSpy).toHaveBeenCalledWith(notFoundHandler);
    });

    it('should handle only errorHandler when notFoundHandler not provided', () => {
      const errorHandler = jest.fn();

      app = new BaseApp();
      app.getErrorHandlers = () => ({ errorHandler });
      
      const useSpy = jest.spyOn(app.express, 'use');
      app.build();

      expect(useSpy).toHaveBeenCalledWith(errorHandler);
    });

    it('should not setup error handlers when getErrorHandlers returns null', () => {
      app = new BaseApp();
      const useSpy = jest.spyOn(app.express, 'use');
      
      app.build();

      // use() should not be called for error handlers
      expect(useSpy).not.toHaveBeenCalled();
    });

    it('should execute in correct order: middleware -> routes -> error handlers', () => {
      const callOrder = [];

      app = new BaseApp();
      app.setupCustomMiddleware = () => callOrder.push('middleware');
      app.setupRoutes = () => callOrder.push('routes');
      app.getErrorHandlers = () => {
        callOrder.push('errorHandlers');
        return { errorHandler: jest.fn() };
      };

      app.build();

      expect(callOrder).toEqual(['middleware', 'routes', 'errorHandlers']);
    });
  });

  describe('registerRoute()', () => {
    it('should register route with express', () => {
      app = new BaseApp();
      const mockRouter = jest.fn((req, res, next) => next());
      const useSpy = jest.spyOn(app.express, 'use');

      app.registerRoute('/api', mockRouter);

      expect(useSpy).toHaveBeenCalledWith('/api', mockRouter);
    });

    it('should allow multiple route registrations', () => {
      app = new BaseApp();
      const useSpy = jest.spyOn(app.express, 'use');
      const router1 = jest.fn((req, res, next) => next());
      const router2 = jest.fn((req, res, next) => next());

      app.registerRoute('/api/v1', router1);
      app.registerRoute('/api/v2', router2);

      expect(useSpy).toHaveBeenCalledWith('/api/v1', router1);
      expect(useSpy).toHaveBeenCalledWith('/api/v2', router2);
    });
  });

  describe('setupCustomMiddleware()', () => {
    it('should be a no-op by default', () => {
      app = new BaseApp();

      expect(() => app.setupCustomMiddleware()).not.toThrow();
    });

    it('should be overridable in subclass', () => {
      class CustomApp extends BaseApp {
        setupCustomMiddleware() {
          this.customMiddlewareCalled = true;
        }
      }

      const customApp = new CustomApp();
      customApp.setupCustomMiddleware();

      expect(customApp.customMiddlewareCalled).toBe(true);
    });
  });

  describe('setupRoutes()', () => {
    it('should be a no-op by default', () => {
      app = new BaseApp();

      expect(() => app.setupRoutes()).not.toThrow();
    });

    it('should be overridable in subclass', () => {
      class CustomApp extends BaseApp {
        setupRoutes() {
          this.routesSetupCalled = true;
        }
      }

      const customApp = new CustomApp();
      customApp.setupRoutes();

      expect(customApp.routesSetupCalled).toBe(true);
    });
  });

  describe('getErrorHandlers()', () => {
    it('should return null by default', () => {
      app = new BaseApp();

      expect(app.getErrorHandlers()).toBeNull();
    });

    it('should be overridable in subclass', () => {
      const customHandlers = {
        notFoundHandler: jest.fn(),
        errorHandler: jest.fn(),
      };

      class CustomApp extends BaseApp {
        getErrorHandlers() {
          return customHandlers;
        }
      }

      const customApp = new CustomApp();

      expect(customApp.getErrorHandlers()).toEqual(customHandlers);
    });
  });

  describe('getExpress()', () => {
    it('should return express instance', () => {
      app = new BaseApp();
      const express = app.getExpress();

      expect(express).toBe(app.express);
    });

    it('should return same instance across multiple calls', () => {
      app = new BaseApp();
      const express1 = app.getExpress();
      const express2 = app.getExpress();

      expect(express1).toBe(express2);
    });
  });

  describe('boot()', () => {
    it('should set booted flag to true', async () => {
      app = new BaseApp();

      expect(app.booted).toBe(false);
      await app.boot();
      expect(app.booted).toBe(true);
    });

    it('should not boot twice', async () => {
      const mockProvider = {
        boot: jest.fn(),
      };

      app = new BaseApp();
      app.providers.push(mockProvider);

      await app.boot();
      await app.boot();

      expect(mockProvider.boot).toHaveBeenCalledTimes(1);
    });

    it('should call boot on all registered providers', async () => {
      const provider1 = { boot: jest.fn() };
      const provider2 = { boot: jest.fn() };
      const provider3 = { boot: jest.fn() };

      app = new BaseApp();
      app.providers.push(provider1, provider2, provider3);

      await app.boot();

      expect(provider1.boot).toHaveBeenCalledTimes(1);
      expect(provider2.boot).toHaveBeenCalledTimes(1);
      expect(provider3.boot).toHaveBeenCalledTimes(1);
    });

    it('should handle providers without boot method', async () => {
      const provider1 = { boot: jest.fn() };
      const provider2 = {}; // No boot method
      const provider3 = { boot: jest.fn() };

      app = new BaseApp();
      app.providers.push(provider1, provider2, provider3);

      await expect(app.boot()).resolves.toBeUndefined();
      expect(provider1.boot).toHaveBeenCalled();
      expect(provider3.boot).toHaveBeenCalled();
    });

    it('should boot providers in order', async () => {
      const callOrder = [];

      const provider1 = {
        boot: async () => {
          callOrder.push(1);
        },
      };
      const provider2 = {
        boot: async () => {
          callOrder.push(2);
        },
      };
      const provider3 = {
        boot: async () => {
          callOrder.push(3);
        },
      };

      app = new BaseApp();
      app.providers.push(provider1, provider2, provider3);

      await app.boot();

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });

  describe('Integration scenarios', () => {
    it('should build and setup complete app with middleware, routes, and error handlers', () => {
      const middlewareMock = jest.fn();
      const routeMock = jest.fn();
      const errorMock = jest.fn();

      class TestApp extends BaseApp {
        setupCustomMiddleware() {
          middlewareMock();
        }
        setupRoutes() {
          routeMock();
        }
        getErrorHandlers() {
          errorMock();
          return { errorHandler: jest.fn() };
        }
      }

      const testApp = new TestApp({ appName: 'test', appType: 'api' });
      testApp.build();

      expect(middlewareMock).toHaveBeenCalled();
      expect(routeMock).toHaveBeenCalled();
      expect(errorMock).toHaveBeenCalled();
    });

    it('should support chaining setAppInfo and build', () => {
      app = new BaseApp();
      const result = app.setAppInfo('chained-app', 'api').build();

      expect(app.appName).toBe('chained-app');
      expect(app.appType).toBe('api');
      expect(result).toBe(app.express);
    });

    it('should maintain state correctly after multiple builds', () => {
      const middlewareMock = jest.fn();
      const routeMock = jest.fn();

      class TestApp extends BaseApp {
        setupCustomMiddleware() {
          middlewareMock();
        }
        setupRoutes() {
          routeMock();
        }
      }

      const testApp = new TestApp();
      
      testApp.build();
      expect(middlewareMock).toHaveBeenCalledTimes(1);
      expect(routeMock).toHaveBeenCalledTimes(1);

      testApp.build();
      expect(middlewareMock).toHaveBeenCalledTimes(1); // Should not be called again
      expect(routeMock).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });
});
