/**
 * Application Unit Tests
 * Tests for framework/Foundation/Application.js
 * 
 * Coverage:
 * - Constructor and Container inheritance
 * - Express instance initialization
 * - Facade application binding
 * - bootstrap() method
 * - detectRootDir() fallback
 * - config() helper method
 * - register() service provider registration
 * - boot() lifecycle (register -> boot phases)
 * - getExpress() method
 * - use() middleware wrapper
 * - listen() server start
 * - handleError() error handler
 * - Integration with service providers
 */

import { jest } from '@jest/globals';
import { Application } from '../../../framework/Foundation/Application.js';
import { Facade } from '../../../framework/Support/Facades/Facade.js';

describe('Application', () => {
  let app;

  beforeEach(() => {
    // Silence console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with Container inheritance', () => {
      app = new Application();

      expect(app.bindings).toBeInstanceOf(Map);
      expect(app.instances).toBeInstanceOf(Map);
      expect(app.singletons).toBeInstanceOf(Set);
      expect(app.aliases).toBeInstanceOf(Map);
    });

    it('should create Express instance', () => {
      app = new Application();

      expect(app.express).toBeDefined();
      expect(typeof app.express.use).toBe('function');
      expect(typeof app.express.listen).toBe('function');
    });

    it('should initialize with empty providers array', () => {
      app = new Application();

      expect(app.providers).toEqual([]);
    });

    it('should initialize with booted and bootstrapped flags as false', () => {
      app = new Application();

      expect(app.booted).toBe(false);
      expect(app.bootstrapped).toBe(false);
    });

    it('should use provided rootDir', () => {
      app = new Application('/custom/root');

      expect(app.rootDir).toBe('/custom/root');
    });

    it('should set rootDir to null when not provided', () => {
      app = new Application();

      expect(app.rootDir).toBeNull();
    });

    it('should bind app instance to container', () => {
      app = new Application();

      const boundApp = app.make('app');
      expect(boundApp).toBe(app);
    });

    it('should bind express instance to container', () => {
      app = new Application();

      const boundExpress = app.make('express');
      expect(boundExpress).toBe(app.express);
    });

    it('should set Facade application', () => {
      app = new Application();

      const facadeApp = Facade.getFacadeApplication();
      expect(facadeApp).toBe(app);
    });
  });

  describe('detectRootDir()', () => {
    it('should return a valid path', () => {
      app = new Application();
      const rootDir = app.detectRootDir();

      expect(typeof rootDir).toBe('string');
      expect(rootDir.length).toBeGreaterThan(0);
    });

    it('should resolve to parent directory of framework', () => {
      app = new Application();
      const rootDir = app.detectRootDir();

      // Should contain the project structure
      expect(rootDir).toContain('vasuzex');
    });
  });

  describe('bootstrap()', () => {
    it('should set bootstrapped flag to true', async () => {
      app = new Application(process.cwd());

      expect(app.bootstrapped).toBe(false);
      await app.bootstrap();
      expect(app.bootstrapped).toBe(true);
    });

    it('should not bootstrap twice', async () => {
      app = new Application(process.cwd());

      await app.bootstrap();
      await app.bootstrap();

      expect(app.bootstrapped).toBe(true);
    });

    it('should use provided rootDir', async () => {
      const customRoot = '/custom/path';
      app = new Application(customRoot);

      await app.bootstrap();

      expect(app.bootstrapped).toBe(true);
    });

    it('should detect rootDir when not provided', async () => {
      app = new Application();

      await app.bootstrap();

      expect(app.bootstrapped).toBe(true);
    });

    it('should bind config to container after bootstrap', async () => {
      app = new Application(process.cwd());

      await app.bootstrap();

      expect(app.has('config')).toBe(true);
    });
  });

  describe('config()', () => {
    it('should throw error when config not bound', () => {
      app = new Application();

      expect(() => app.config('app.name', 'default-name')).toThrow(
        'No binding found for "config"'
      );
    });

    it('should return config value or default when config returns value', () => {
      const mockConfig = {
        get: jest.fn((key, defaultValue) => defaultValue), // Returns the default value
      };

      app = new Application();
      app.instance('config', mockConfig);

      const value = app.config('app.name', 'default-name');

      expect(value).toBe('default-name');
      expect(mockConfig.get).toHaveBeenCalledWith('app.name', 'default-name');
    });

    it('should retrieve config value from bound config', () => {
      const mockConfig = {
        get: jest.fn((key, defaultValue) => {
          if (key === 'app.name') return 'my-app';
          return defaultValue;
        }),
      };

      app = new Application();
      app.instance('config', mockConfig);

      const value = app.config('app.name');

      expect(value).toBe('my-app');
      expect(mockConfig.get).toHaveBeenCalledWith('app.name', null);
    });

    it('should support nested config keys', () => {
      const mockConfig = {
        get: jest.fn((key) => {
          if (key === 'database.connections.mysql.host') return 'localhost';
          return null;
        }),
      };

      app = new Application();
      app.instance('config', mockConfig);

      const value = app.config('database.connections.mysql.host');

      expect(value).toBe('localhost');
    });
  });

  describe('register()', () => {
    it('should register a service provider', () => {
      class TestProvider {
        constructor(app) {
          this.app = app;
        }
        async register() {}
        async boot() {}
      }

      app = new Application();
      app.register(TestProvider);

      expect(app.providers.length).toBe(1);
      expect(app.providers[0]).toBeInstanceOf(TestProvider);
    });

    it('should pass app instance to provider constructor', () => {
      class TestProvider {
        constructor(app) {
          this.app = app;
        }
      }

      app = new Application();
      app.register(TestProvider);

      expect(app.providers[0].app).toBe(app);
    });

    it('should bind provider options when provided', () => {
      class TestProvider {
        constructor(app) {
          this.app = app;
        }
      }

      const options = { key: 'value' };
      app = new Application();
      app.register(TestProvider, options);

      const boundOptions = app.make('TestProvider.options');
      expect(boundOptions).toEqual(options);
    });

    it('should not bind options when not provided', () => {
      class TestProvider {
        constructor(app) {
          this.app = app;
        }
      }

      app = new Application();
      app.register(TestProvider);

      expect(app.has('TestProvider.options')).toBe(false);
    });

    it('should allow method chaining', () => {
      class Provider1 {
        constructor(app) {
          this.app = app;
        }
      }
      class Provider2 {
        constructor(app) {
          this.app = app;
        }
      }

      app = new Application();
      const result = app.register(Provider1).register(Provider2);

      expect(result).toBe(app);
      expect(app.providers.length).toBe(2);
    });

    it('should register multiple providers', () => {
      class Provider1 {
        constructor(app) {}
      }
      class Provider2 {
        constructor(app) {}
      }
      class Provider3 {
        constructor(app) {}
      }

      app = new Application();
      app.register(Provider1)
        .register(Provider2)
        .register(Provider3);

      expect(app.providers.length).toBe(3);
    });
  });

  describe('boot()', () => {
    it('should set booted flag to true', async () => {
      app = new Application(process.cwd());

      expect(app.booted).toBe(false);
      await app.boot();
      expect(app.booted).toBe(true);
    });

    it('should not boot twice', async () => {
      const mockProvider = {
        register: jest.fn(async () => {}),
        boot: jest.fn(async () => {}),
      };

      app = new Application(process.cwd());
      app.providers.push(mockProvider);

      await app.boot();
      await app.boot();

      expect(mockProvider.register).toHaveBeenCalledTimes(1);
      expect(mockProvider.boot).toHaveBeenCalledTimes(1);
    });

    it('should bootstrap application before booting', async () => {
      app = new Application(process.cwd());

      await app.boot();

      expect(app.bootstrapped).toBe(true);
      expect(app.booted).toBe(true);
    });

    it('should call register on all providers before boot', async () => {
      const callOrder = [];

      const provider1 = {
        register: async () => callOrder.push('register1'),
        boot: async () => callOrder.push('boot1'),
      };
      const provider2 = {
        register: async () => callOrder.push('register2'),
        boot: async () => callOrder.push('boot2'),
      };

      app = new Application(process.cwd());
      app.providers.push(provider1, provider2);

      await app.boot();

      expect(callOrder).toEqual(['register1', 'register2', 'boot1', 'boot2']);
    });

    it('should call register and boot on all providers', async () => {
      const provider = {
        register: jest.fn(async () => {}),
        boot: jest.fn(async () => {}),
      };

      app = new Application(process.cwd());
      app.providers.push(provider);

      await app.boot();
      
      expect(provider.register).toHaveBeenCalled();
      expect(provider.boot).toHaveBeenCalled();
    });
  });

  describe('getExpress()', () => {
    it('should return express instance', () => {
      app = new Application();
      const express = app.getExpress();

      expect(express).toBe(app.express);
    });

    it('should return same instance across multiple calls', () => {
      app = new Application();
      const express1 = app.getExpress();
      const express2 = app.getExpress();

      expect(express1).toBe(express2);
    });
  });

  describe('use()', () => {
    it('should add middleware to express', () => {
      app = new Application();
      const middleware = jest.fn((req, res, next) => next());
      const useSpy = jest.spyOn(app.express, 'use');

      app.use(middleware);

      expect(useSpy).toHaveBeenCalledWith(middleware);
    });

    it('should allow method chaining', () => {
      app = new Application();
      const middleware = jest.fn((req, res, next) => next());

      const result = app.use(middleware);

      expect(result).toBe(app);
    });

    it('should support multiple arguments', () => {
      app = new Application();
      const middleware = jest.fn((req, res, next) => next());
      const useSpy = jest.spyOn(app.express, 'use');

      app.use('/api', middleware);

      expect(useSpy).toHaveBeenCalledWith('/api', middleware);
    });
  });

  describe('listen()', () => {
    it('should boot application before starting server', async () => {
      app = new Application(process.cwd());
      
      const listenSpy = jest.spyOn(app.express, 'listen').mockImplementation((port, cb) => {
        cb();
      });

      await app.listen(3000);

      expect(app.booted).toBe(true);
      expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function));
    });

    it('should start express server on specified port', async () => {
      app = new Application(process.cwd());
      
      const listenSpy = jest.spyOn(app.express, 'listen').mockImplementation((port, cb) => {
        cb();
      });

      await app.listen(4000);

      expect(listenSpy).toHaveBeenCalledWith(4000, expect.any(Function));
    });

    it('should log server start message', async () => {
      app = new Application(process.cwd());
      
      jest.spyOn(app.express, 'listen').mockImplementation((port, cb) => {
        cb();
      });

      await app.listen(5000);

      expect(console.log).toHaveBeenCalledWith('🚀 Server running on port 5000');
    });

    it('should call callback if provided', async () => {
      app = new Application(process.cwd());
      const callback = jest.fn();
      
      jest.spyOn(app.express, 'listen').mockImplementation((port, cb) => {
        cb();
      });

      await app.listen(3000, callback);

      expect(callback).toHaveBeenCalled();
    });

    it('should skip double boot when already booted', async () => {
      app = new Application(process.cwd());
      await app.boot();
      
      // Reset bootstrapped to false to test the skip logic
      const bootedBefore = app.booted;
      
      jest.spyOn(app.express, 'listen').mockImplementation((port, cb) => {
        cb();
      });

      await app.listen(3000);

      expect(bootedBefore).toBe(true);
      expect(app.booted).toBe(true);
    });
  });

  describe('handleError()', () => {
    it('should add error handler to express', () => {
      app = new Application();
      const errorHandler = jest.fn((err, req, res, next) => {});
      const useSpy = jest.spyOn(app.express, 'use');

      app.handleError(errorHandler);

      expect(useSpy).toHaveBeenCalledWith(errorHandler);
    });

    it('should allow method chaining', () => {
      app = new Application();
      const errorHandler = jest.fn((err, req, res, next) => {});

      const result = app.handleError(errorHandler);

      expect(result).toBe(app);
    });
  });

  describe('Integration scenarios', () => {
    it('should support full application lifecycle', async () => {
      class TestProvider {
        constructor(app) {
          this.app = app;
          this.registerCalled = false;
          this.bootCalled = false;
        }
        async register() {
          this.registerCalled = true;
          this.app.instance('testService', { value: 'test' });
        }
        async boot() {
          this.bootCalled = true;
        }
      }

      app = new Application(process.cwd());
      app.register(TestProvider);
      
      await app.boot();

      const provider = app.providers[0];
      expect(provider.registerCalled).toBe(true);
      expect(provider.bootCalled).toBe(true);
      expect(app.make('testService')).toEqual({ value: 'test' });
    });

    it('should support fluent interface', async () => {
      const middleware1 = jest.fn((req, res, next) => next());
      const middleware2 = jest.fn((req, res, next) => next());
      const errorHandler = jest.fn((err, req, res, next) => {});

      class Provider1 {
        constructor(app) {
          this.app = app;
        }
        async register() {}
        async boot() {}
      }

      app = new Application(process.cwd());
      
      const result = app
        .register(Provider1)
        .use(middleware1)
        .use(middleware2)
        .handleError(errorHandler);

      expect(result).toBe(app);
      expect(app.providers.length).toBe(1);
    });
  });
});
