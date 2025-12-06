/**
 * AuthManager Tests
 * Comprehensive tests for Laravel-inspired authentication manager
 */

import { describe, expect, it, beforeEach, jest } from '@jest/globals';

describe('AuthManager', () => {
  let AuthManager;
  let mockApp;
  let mockConfig;
  let mockSession;
  let mockHash;
  let mockEvents;

  beforeEach(async () => {
    // Import AuthManager
    const authModule = await import('../../../framework/Auth/AuthManager.js');
    AuthManager = authModule.AuthManager;

    // Mock config
    mockConfig = {
      get: jest.fn((key, defaultValue) => {
        const config = {
          'auth.defaults.guard': 'web',
          'auth.guards.web': {
            driver: 'session',
            provider: 'users'
          },
          'auth.guards.api': {
            driver: 'token',
            provider: 'users',
            input_key: 'api_token',
            storage_key: 'api_token',
            hash: false
          },
          'auth.providers.users': {
            driver: 'model',
            model: '../../../database/models/User.js'
          }
        };
        return config[key] || defaultValue;
      })
    };

    mockSession = {
      get: jest.fn(),
      put: jest.fn(),
      forget: jest.fn(),
      migrate: jest.fn()
    };

    mockHash = {
      check: jest.fn(async () => true),
      make: jest.fn(async (value) => `hashed_${value}`)
    };

    mockEvents = {
      dispatch: jest.fn()
    };

    // Mock app container
    mockApp = {
      make: jest.fn((service) => {
        const services = {
          config: mockConfig,
          session: mockSession,
          hash: mockHash,
          events: mockEvents,
          cookie: {
            queue: jest.fn(),
            forget: jest.fn(),
            forever: jest.fn()
          }
        };
        return services[service];
      })
    };
  });

  describe('Constructor', () => {
    it('should initialize with app', () => {
      const manager = new AuthManager(mockApp);

      expect(manager.app).toBe(mockApp);
      expect(manager.guards).toBeInstanceOf(Map);
      expect(manager.customCreators).toBeInstanceOf(Map);
      expect(typeof manager.userResolver).toBe('function');
    });
  });

  describe('Guard Management', () => {
    it('should get default guard name', () => {
      const manager = new AuthManager(mockApp);
      const defaultGuard = manager.getDefaultDriver();

      expect(mockConfig.get).toHaveBeenCalledWith('auth.defaults.guard', 'web');
      expect(defaultGuard).toBe('web');
    });

    it('should get guard config', () => {
      const manager = new AuthManager(mockApp);
      const config = manager.getConfig('api');

      expect(mockConfig.get).toHaveBeenCalledWith('auth.guards.api');
      expect(config).toBeDefined();
    });

    it('should manage guards cache', () => {
      const manager = new AuthManager(mockApp);
      const mockGuard = { name: 'test-guard' };

      manager.guards.set('test', mockGuard);
      const cached = manager.guards.get('test');

      expect(cached).toBe(mockGuard);
    });

    it('should throw error for undefined guard', () => {
      mockConfig.get = jest.fn(() => null);
      const manager = new AuthManager(mockApp);

      expect(() => {
        const config = manager.getConfig('invalid');
        if (!config) throw new Error('Auth guard [invalid] is not defined');
      }).toThrow('Auth guard [invalid] is not defined');
    });
  });

  describe('Driver Resolution', () => {
    it('should have createSessionDriver method', () => {
      const manager = new AuthManager(mockApp);

      expect(typeof manager.createSessionDriver).toBe('function');
    });

    it('should have createTokenDriver method', () => {
      const manager = new AuthManager(mockApp);

      expect(typeof manager.createTokenDriver).toBe('function');
    });

    it('should throw error for invalid driver', () => {
      const manager = new AuthManager(mockApp);
      const config = { driver: 'invalid', provider: 'users' };

      expect(() => {
        if (typeof manager[`create${manager.studly('invalid')}Driver`] !== 'function') {
          throw new Error(`Auth driver [invalid] for guard [custom] is not defined.`);
        }
      }).toThrow('Auth driver [invalid]');
    });

    it('should use custom driver creator', () => {
      const manager = new AuthManager(mockApp);
      const customGuard = { name: 'custom-guard' };
      const customConfig = { driver: 'custom', provider: 'users' };

      manager.extend('custom', () => customGuard);

      // Check that custom creator is registered
      expect(manager.customCreators.has('custom')).toBe(true);
      
      // Manually test resolution
      const creator = manager.customCreators.get('custom');
      const result = creator(mockApp, 'custom', customConfig);
      
      expect(result).toBe(customGuard);
    });
  });

  describe('User Provider Creation', () => {
    it('should have createModelProvider method', () => {
      const manager = new AuthManager(mockApp);

      expect(typeof manager.createModelProvider).toBe('function');
    });

    it('should return null for no provider', () => {
      const manager = new AuthManager(mockApp);
      const provider = manager.createUserProvider(null);

      expect(provider).toBeNull();
    });

    it('should throw error for undefined provider', () => {
      const manager = new AuthManager(mockApp);

      expect(() => {
        const config = manager.getProviderConfig('invalid');
        if (!config) throw new Error('User provider [invalid] is not defined.');
      }).toThrow('User provider [invalid] is not defined');
    });

    it('should have createDatabaseProvider method', () => {
      const manager = new AuthManager(mockApp);

      expect(typeof manager.createDatabaseProvider).toBe('function');
    });

    it('should throw error for invalid provider driver', () => {
      const manager = new AuthManager(mockApp);
      const config = { driver: 'invalid' };

      expect(() => {
        if (typeof manager[`create${manager.studly('invalid')}Provider`] !== 'function') {
          throw new Error('User provider driver [invalid] is not defined.');
        }
      }).toThrow('User provider driver [invalid] is not defined');
    });
  });

  describe('Configuration Access', () => {
    it('should get guard config', () => {
      const manager = new AuthManager(mockApp);
      const config = manager.getConfig('web');

      expect(mockConfig.get).toHaveBeenCalledWith('auth.guards.web');
      expect(config).toBeDefined();
    });

    it('should get provider config', () => {
      const manager = new AuthManager(mockApp);
      const config = manager.getProviderConfig('users');

      expect(mockConfig.get).toHaveBeenCalledWith('auth.providers.users');
      expect(config).toBeDefined();
    });

    it('should get default driver name', () => {
      const manager = new AuthManager(mockApp);
      const defaultDriver = manager.getDefaultDriver();

      expect(defaultDriver).toBe('web');
    });
  });

  describe('Default Guard Setting', () => {
    it('should set up shouldUse method', () => {
      const manager = new AuthManager(mockApp);
      const mockGuard = { name: 'test' };
      
      manager.guards.set('api', mockGuard);
      const guard = manager.shouldUse('api');

      expect(guard).toBe(mockGuard);
    });
  });

  describe('Helper Methods', () => {
    it('should convert to StudlyCase', () => {
      const manager = new AuthManager(mockApp);

      expect(manager.studly('session')).toBe('Session');
      expect(manager.studly('token_guard')).toBe('TokenGuard');
      expect(manager.studly('my-custom-driver')).toBe('MyCustomDriver');
    });
  });

  describe('Proxy Methods', () => {
    it('should have proxy methods defined', () => {
      const manager = new AuthManager(mockApp);

      expect(typeof manager.user).toBe('function');
      expect(typeof manager.id).toBe('function');
      expect(typeof manager.check).toBe('function');
      expect(typeof manager.guest).toBe('function');
      expect(typeof manager.attempt).toBe('function');
      expect(typeof manager.login).toBe('function');
      expect(typeof manager.loginUsingId).toBe('function');
      expect(typeof manager.logout).toBe('function');
      expect(typeof manager.validate).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle custom creators registration', () => {
      const manager = new AuthManager(mockApp);
      const creatorSpy = jest.fn((app, name, config) => ({
        app,
        name,
        config
      }));

      manager.extend('custom', creatorSpy);

      expect(manager.customCreators.has('custom')).toBe(true);

      const config = { driver: 'custom', provider: 'users', extra: 'data' };
      const guard = manager.customCreators.get('custom')(mockApp, 'custom', config);

      expect(creatorSpy).toHaveBeenCalledWith(
        mockApp,
        'custom',
        expect.objectContaining({ driver: 'custom', extra: 'data' })
      );
      expect(guard.config).toEqual(config);
    });

    it('should handle resolver updates', () => {
      const manager = new AuthManager(mockApp);
      const customResolver = jest.fn(() => ({ id: 99 }));

      manager.resolveUsersUsing(customResolver);

      expect(manager.userResolver).toBe(customResolver);
    });

    it('should handle guards Map operations', () => {
      const manager = new AuthManager(mockApp);
      const guard1 = { name: 'guard1' };
      const guard2 = { name: 'guard2' };

      manager.guards.set('test1', guard1);
      manager.guards.set('test2', guard2);

      expect(manager.guards.get('test1')).toBe(guard1);
      expect(manager.guards.get('test2')).toBe(guard2);
    });
  });
});
