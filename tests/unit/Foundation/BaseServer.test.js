/**
 * BaseServer Unit Tests
 * Tests for framework/Foundation/BaseServer.js
 * 
 * Coverage:
 * - Constructor and initialization
 * - Configuration validation
 * - Service initialization lifecycle
 * - App creation (abstract method)
 * - Server start/stop lifecycle
 * - Port configuration (options, env, default)
 * - Error handling during start
 * - Getter methods
 */

import { jest } from '@jest/globals';
import { BaseServer } from '../../../framework/Foundation/BaseServer.js';

describe('BaseServer', () => {
  let mockExpressApp;
  let mockServer;

  beforeEach(() => {
    // Mock Express app
    mockExpressApp = {
      listen: jest.fn((port, callback) => {
        callback();
        return mockServer;
      }),
      getExpress: jest.fn(() => mockExpressApp),
    };

    // Mock HTTP server
    mockServer = {
      close: jest.fn((callback) => {
        callback();
      }),
    };

    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.APP_PORT;
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const server = new BaseServer();

      expect(server.options).toEqual({});
      expect(server.appName).toBe('app');
      expect(server.projectRoot).toBe(process.cwd());
      expect(server.port).toBe(3000);
      expect(server.app).toBeNull();
      expect(server.server).toBeNull();
    });

    it('should initialize with custom options', () => {
      const options = {
        appName: 'my-app',
        projectRoot: '/custom/path',
        port: 8080,
      };

      const server = new BaseServer(options);

      expect(server.options).toEqual(options);
      expect(server.appName).toBe('my-app');
      expect(server.projectRoot).toBe('/custom/path');
      expect(server.port).toBe(8080);
    });

    it('should prioritize options.port over env.APP_PORT', () => {
      process.env.APP_PORT = '5000';
      const server = new BaseServer({ port: 8080 });

      expect(server.port).toBe(8080);
    });

    it('should use env.APP_PORT when no port option provided', () => {
      process.env.APP_PORT = '5000';
      const server = new BaseServer();

      expect(server.port).toBe('5000');
    });

    it('should use default port 3000 when no port configured', () => {
      const server = new BaseServer();

      expect(server.port).toBe(3000);
    });
  });

  describe('validateConfig()', () => {
    it('should execute without error by default', () => {
      const server = new BaseServer();

      expect(() => server.validateConfig()).not.toThrow();
    });

    it('should be overridable in subclass', () => {
      class CustomServer extends BaseServer {
        validateConfig() {
          if (!this.options.required) {
            throw new Error('Missing required config');
          }
        }
      }

      const server = new CustomServer();

      expect(() => server.validateConfig()).toThrow('Missing required config');
    });
  });

  describe('initializeServices()', () => {
    it('should execute without error by default', async () => {
      const server = new BaseServer();

      await expect(server.initializeServices()).resolves.toBeUndefined();
    });

    it('should be overridable in subclass', async () => {
      const serviceMock = jest.fn();

      class CustomServer extends BaseServer {
        async initializeServices() {
          serviceMock();
        }
      }

      const server = new CustomServer();
      await server.initializeServices();

      expect(serviceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('createApp()', () => {
    it('should throw error when not implemented', async () => {
      const server = new BaseServer();

      await expect(server.createApp()).rejects.toThrow(
        'createApp() must be implemented by subclass'
      );
    });

    it('should be implementable in subclass', async () => {
      class CustomServer extends BaseServer {
        async createApp() {
          return { express: 'app' };
        }
      }

      const server = new CustomServer();
      const result = await server.createApp();

      expect(result).toEqual({ express: 'app' });
    });
  });

  describe('start()', () => {
    class TestServer extends BaseServer {
      async createApp() {
        return mockExpressApp;
      }
    }

    it('should start server successfully with BaseApp instance', async () => {
      const server = new TestServer({ appName: 'test-app', port: 4000 });
      await server.start();

      expect(mockExpressApp.getExpress).toHaveBeenCalled();
      expect(mockExpressApp.listen).toHaveBeenCalledWith(4000, expect.any(Function));
      expect(console.log).toHaveBeenCalledWith(
        '🚀 test-app running on http://localhost:4000'
      );
      expect(server.server).toBe(mockServer);
      expect(server.app).toBe(mockExpressApp);
    });

    it('should start server with plain Express app (no getExpress method)', async () => {
      const plainExpressApp = {
        listen: jest.fn((port, callback) => {
          callback();
          return mockServer;
        }),
      };

      class PlainExpressServer extends BaseServer {
        async createApp() {
          return plainExpressApp;
        }
      }

      const server = new PlainExpressServer({ port: 5000 });
      await server.start();

      expect(plainExpressApp.listen).toHaveBeenCalledWith(5000, expect.any(Function));
    });

    it('should call validateConfig before starting', async () => {
      const validateMock = jest.fn();

      class CustomServer extends TestServer {
        validateConfig() {
          validateMock();
        }
      }

      const server = new CustomServer();
      await server.start();

      expect(validateMock).toHaveBeenCalledTimes(1);
    });

    it('should call initializeServices before creating app', async () => {
      const initMock = jest.fn();

      class CustomServer extends TestServer {
        async initializeServices() {
          initMock();
        }
      }

      const server = new CustomServer();
      await server.start();

      expect(initMock).toHaveBeenCalledTimes(1);
    });

    it('should throw error and log when validateConfig fails', async () => {
      class FailingServer extends TestServer {
        validateConfig() {
          throw new Error('Validation failed');
        }
      }

      const server = new FailingServer();

      await expect(server.start()).rejects.toThrow('Validation failed');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Failed to start server:',
        expect.any(Error)
      );
    });

    it('should throw error and log when initializeServices fails', async () => {
      class FailingServer extends TestServer {
        async initializeServices() {
          throw new Error('Service init failed');
        }
      }

      const server = new FailingServer();

      await expect(server.start()).rejects.toThrow('Service init failed');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Failed to start server:',
        expect.any(Error)
      );
    });

    it('should throw error and log when createApp fails', async () => {
      class FailingServer extends BaseServer {
        async createApp() {
          throw new Error('App creation failed');
        }
      }

      const server = new FailingServer();

      await expect(server.start()).rejects.toThrow('App creation failed');
      expect(console.error).toHaveBeenCalledWith(
        '❌ Failed to start server:',
        expect.any(Error)
      );
    });

    it('should execute lifecycle methods in correct order', async () => {
      const callOrder = [];

      class OrderTestServer extends TestServer {
        validateConfig() {
          callOrder.push('validate');
        }
        async initializeServices() {
          callOrder.push('initialize');
        }
        async createApp() {
          callOrder.push('createApp');
          return mockExpressApp;
        }
      }

      const server = new OrderTestServer();
      await server.start();

      expect(callOrder).toEqual(['validate', 'initialize', 'createApp']);
    });
  });

  describe('stop()', () => {
    class TestServer extends BaseServer {
      async createApp() {
        return mockExpressApp;
      }
    }

    it('should stop running server', async () => {
      const server = new TestServer();
      await server.start();
      await server.stop();

      expect(mockServer.close).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Server stopped');
    });

    it('should resolve when server stops', async () => {
      const server = new TestServer();
      await server.start();

      await expect(server.stop()).resolves.toBeUndefined();
    });

    it('should do nothing when server not running', async () => {
      const server = new TestServer();

      await expect(server.stop()).resolves.toBeUndefined();
      expect(mockServer.close).not.toHaveBeenCalled();
    });
  });

  describe('getServer()', () => {
    it('should return null when server not started', () => {
      const server = new BaseServer();

      expect(server.getServer()).toBeNull();
    });

    it('should return server instance after start', async () => {
      class TestServer extends BaseServer {
        async createApp() {
          return mockExpressApp;
        }
      }

      const server = new TestServer();
      await server.start();

      expect(server.getServer()).toBe(mockServer);
    });
  });

  describe('getApp()', () => {
    it('should return null when app not created', () => {
      const server = new BaseServer();

      expect(server.getApp()).toBeNull();
    });

    it('should return app instance after start', async () => {
      class TestServer extends BaseServer {
        async createApp() {
          return mockExpressApp;
        }
      }

      const server = new TestServer();
      await server.start();

      expect(server.getApp()).toBe(mockExpressApp);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete lifecycle: start -> stop', async () => {
      class TestServer extends BaseServer {
        async createApp() {
          return mockExpressApp;
        }
      }

      const server = new TestServer({ appName: 'integration-test', port: 6000 });

      // Start
      await server.start();
      expect(server.getApp()).toBe(mockExpressApp);
      expect(server.getServer()).toBe(mockServer);

      // Stop
      await server.stop();
      expect(mockServer.close).toHaveBeenCalled();
    });

    it('should support multiple start/stop cycles', async () => {
      class TestServer extends BaseServer {
        async createApp() {
          return mockExpressApp;
        }
      }

      const server = new TestServer();

      // First cycle
      await server.start();
      await server.stop();

      // Reset mocks for second cycle
      mockServer.close.mockClear();

      // Second cycle
      await server.start();
      await server.stop();

      expect(mockServer.close).toHaveBeenCalledTimes(1);
    });
  });
});
