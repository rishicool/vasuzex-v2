/**
 * ServiceProvider Unit Tests
 * Tests for framework/Foundation/ServiceProvider.js
 * 
 * Coverage:
 * - Constructor with app binding
 * - register() method (base implementation)
 * - boot() method (base implementation)
 * - Subclass override patterns
 * - Integration with Application container
 * - Service binding in register phase
 * - Service bootstrapping in boot phase
 */

import { jest } from '@jest/globals';
import { ServiceProvider } from '../../../framework/Foundation/ServiceProvider.js';
import { Application } from '../../../framework/Foundation/Application.js';

describe('ServiceProvider', () => {
  let app;
  let provider;

  beforeEach(() => {
    // Silence console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    app = new Application(process.cwd());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should store app instance', () => {
      provider = new ServiceProvider(app);

      expect(provider.app).toBe(app);
    });

    it('should work with any application instance', () => {
      const customApp = { name: 'custom' };
      provider = new ServiceProvider(customApp);

      expect(provider.app).toBe(customApp);
    });
  });

  describe('register()', () => {
    it('should be a no-op by default', () => {
      provider = new ServiceProvider(app);

      expect(() => provider.register()).not.toThrow();
    });

    it('should return undefined by default', () => {
      provider = new ServiceProvider(app);
      const result = provider.register();

      expect(result).toBeUndefined();
    });

    it('should be overridable in subclass', () => {
      class CustomProvider extends ServiceProvider {
        register() {
          return 'custom';
        }
      }

      const custom = new CustomProvider(app);
      const result = custom.register();

      expect(result).toBe('custom');
    });

    it('should have access to app in subclass register', () => {
      class CustomProvider extends ServiceProvider {
        register() {
          this.app.instance('test', { value: 'registered' });
        }
      }

      const custom = new CustomProvider(app);
      custom.register();

      expect(app.make('test')).toEqual({ value: 'registered' });
    });
  });

  describe('boot()', () => {
    it('should be a no-op by default', () => {
      provider = new ServiceProvider(app);

      expect(() => provider.boot()).not.toThrow();
    });

    it('should return undefined by default', () => {
      provider = new ServiceProvider(app);
      const result = provider.boot();

      expect(result).toBeUndefined();
    });

    it('should be overridable in subclass', () => {
      class CustomProvider extends ServiceProvider {
        boot() {
          return 'booted';
        }
      }

      const custom = new CustomProvider(app);
      const result = custom.boot();

      expect(result).toBe('booted');
    });

    it('should have access to app in subclass boot', () => {
      class CustomProvider extends ServiceProvider {
        boot() {
          this.app.instance('booted', { value: 'yes' });
        }
      }

      const custom = new CustomProvider(app);
      custom.boot();

      expect(app.make('booted')).toEqual({ value: 'yes' });
    });
  });

  describe('Subclass patterns', () => {
    it('should support register and boot lifecycle', () => {
      const calls = [];

      class LifecycleProvider extends ServiceProvider {
        register() {
          calls.push('register');
          this.app.instance('service', { name: 'test' });
        }

        boot() {
          calls.push('boot');
          const service = this.app.make('service');
          service.booted = true;
        }
      }

      const lifecycle = new LifecycleProvider(app);
      lifecycle.register();
      lifecycle.boot();

      expect(calls).toEqual(['register', 'boot']);
      expect(app.make('service')).toEqual({ name: 'test', booted: true });
    });

    it('should support binding services in register', () => {
      class DatabaseProvider extends ServiceProvider {
        register() {
          this.app.singleton('db', class Database {
            query() { return 'result'; }
          });
        }
      }

      const dbProvider = new DatabaseProvider(app);
      dbProvider.register();

      const db1 = app.make('db');
      const db2 = app.make('db');

      expect(db1).toBe(db2);
      expect(db1.query()).toBe('result');
    });

    it('should support bootstrapping in boot phase', () => {
      class CacheProvider extends ServiceProvider {
        register() {
          this.app.instance('cache', { store: {} });
        }

        boot() {
          const cache = this.app.make('cache');
          cache.initialized = true;
          cache.set = (key, value) => { cache.store[key] = value; };
          cache.get = (key) => cache.store[key];
        }
      }

      const cacheProvider = new CacheProvider(app);
      cacheProvider.register();
      cacheProvider.boot();

      const cache = app.make('cache');
      expect(cache.initialized).toBe(true);
      
      cache.set('test', 'value');
      expect(cache.get('test')).toBe('value');
    });

    it('should support async register', async () => {
      class AsyncProvider extends ServiceProvider {
        async register() {
          await new Promise(resolve => setTimeout(resolve, 1));
          this.app.instance('async', { loaded: true });
        }
      }

      const asyncProvider = new AsyncProvider(app);
      await asyncProvider.register();

      expect(app.make('async')).toEqual({ loaded: true });
    });

    it('should support async boot', async () => {
      class AsyncBootProvider extends ServiceProvider {
        register() {
          this.app.instance('service', { ready: false });
        }

        async boot() {
          await new Promise(resolve => setTimeout(resolve, 1));
          const service = this.app.make('service');
          service.ready = true;
        }
      }

      const asyncBoot = new AsyncBootProvider(app);
      asyncBoot.register();
      await asyncBoot.boot();

      expect(app.make('service').ready).toBe(true);
    });
  });

  describe('Integration with Application', () => {
    it('should work with Application.register()', () => {
      class TestProvider extends ServiceProvider {
        register() {
          this.app.instance('test', { value: 'test' });
        }
      }

      app.register(TestProvider);

      expect(app.providers.length).toBe(1);
      expect(app.providers[0]).toBeInstanceOf(TestProvider);
    });

    it('should execute register phase before boot in Application.boot()', async () => {
      const calls = [];

      class Provider1 extends ServiceProvider {
        register() {
          calls.push('register1');
        }
        boot() {
          calls.push('boot1');
        }
      }

      class Provider2 extends ServiceProvider {
        register() {
          calls.push('register2');
        }
        boot() {
          calls.push('boot2');
        }
      }

      app.register(Provider1);
      app.register(Provider2);

      await app.boot();

      expect(calls).toEqual(['register1', 'register2', 'boot1', 'boot2']);
    });

    it('should receive options when registered with Application', () => {
      class ConfigProvider extends ServiceProvider {
        register() {
          const options = this.app.make('ConfigProvider.options');
          this.app.instance('config', options);
        }
      }

      const options = { key: 'value' };
      app.register(ConfigProvider, options);

      expect(app.providers[0]).toBeInstanceOf(ConfigProvider);
      expect(app.has('ConfigProvider.options')).toBe(true);
    });

    it('should support multiple providers with dependencies', async () => {
      class DatabaseProvider extends ServiceProvider {
        register() {
          this.app.singleton('db', class DB {
            connect() { return 'connected'; }
          });
        }
      }

      class UserRepositoryProvider extends ServiceProvider {
        register() {
          this.app.bind('userRepo', class UserRepo {
            constructor() {
              this.db = app.make('db');
            }
            getUsers() {
              return this.db.connect();
            }
          });
        }
      }

      app.register(DatabaseProvider);
      app.register(UserRepositoryProvider);

      await app.boot();

      const userRepo = app.make('userRepo');
      expect(userRepo.getUsers()).toBe('connected');
    });
  });

  describe('Real-world provider examples', () => {
    it('should implement a mail provider pattern', async () => {
      class MailProvider extends ServiceProvider {
        register() {
          this.app.singleton('mail', class MailManager {
            constructor() {
              this.driver = null;
            }
            setDriver(driver) {
              this.driver = driver;
            }
            send(to, message) {
              return this.driver ? this.driver.send(to, message) : null;
            }
          });
        }

        boot() {
          const mail = this.app.make('mail');
          mail.setDriver({
            send: (to, message) => `Sent to ${to}: ${message}`
          });
        }
      }

      app.register(MailProvider);
      await app.boot();

      const mail = app.make('mail');
      expect(mail.send('test@example.com', 'Hello')).toBe(
        'Sent to test@example.com: Hello'
      );
    });

    it('should implement a validation provider pattern', async () => {
      class ValidationProvider extends ServiceProvider {
        register() {
          this.app.instance('validator', {
            rules: {},
            addRule(name, fn) {
              this.rules[name] = fn;
            },
            validate(value, rule) {
              return this.rules[rule] ? this.rules[rule](value) : false;
            }
          });
        }

        boot() {
          const validator = this.app.make('validator');
          
          validator.addRule('email', (value) => {
            return value.includes('@');
          });
          
          validator.addRule('required', (value) => {
            return value !== null && value !== undefined && value !== '';
          });
        }
      }

      app.register(ValidationProvider);
      await app.boot();

      const validator = app.make('validator');
      expect(validator.validate('test@example.com', 'email')).toBe(true);
      expect(validator.validate('test', 'email')).toBe(false);
      expect(validator.validate('value', 'required')).toBe(true);
      expect(validator.validate('', 'required')).toBe(false);
    });
  });
});
