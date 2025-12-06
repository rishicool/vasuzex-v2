/**
 * ServiceFactory Tests
 */

import { 
  ServiceFactory,
  createServiceFactory,
  serviceFactory 
} from '../../../framework/Patterns/ServiceFactory.js';

describe('ServiceFactory', () => {
  let factory;

  beforeEach(() => {
    factory = new ServiceFactory();
  });

  describe('constructor', () => {
    test('initializes empty containers', () => {
      expect(factory.services.size).toBe(0);
      expect(factory.singletons.size).toBe(0);
      expect(factory.aliases.size).toBe(0);
    });
  });

  describe('register', () => {
    test('registers a service', () => {
      const creator = () => ({ name: 'TestService' });
      factory.register('test', creator);

      expect(factory.services.has('test')).toBe(true);
    });

    test('registers a singleton when flag is true', () => {
      const creator = () => ({ name: 'SingletonService' });
      factory.register('test', creator, true);

      expect(factory.singletons.has('test')).toBe(true);
      expect(factory.services.has('test')).toBe(false);
    });

    test('overwrites existing service', () => {
      const creator1 = () => ({ version: 1 });
      const creator2 = () => ({ version: 2 });

      factory.register('test', creator1);
      factory.register('test', creator2);

      const instance = factory.make('test');
      expect(instance.version).toBe(2);
    });
  });

  describe('singleton', () => {
    test('registers service as singleton', () => {
      const creator = () => ({ name: 'SingletonService' });
      factory.singleton('test', creator);

      expect(factory.singletons.has('test')).toBe(true);
    });

    test('returns same instance on multiple make calls', () => {
      const creator = () => ({ id: Math.random() });
      factory.singleton('test', creator);

      const instance1 = factory.make('test');
      const instance2 = factory.make('test');

      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });

    test('does not recreate singleton if already instantiated', () => {
      let callCount = 0;
      const creator = () => {
        callCount++;
        return { count: callCount };
      };
      
      factory.singleton('test', creator);

      factory.make('test');
      factory.make('test');
      factory.make('test');

      expect(callCount).toBe(1);
    });
  });

  describe('alias', () => {
    test('registers an alias', () => {
      const creator = () => ({ name: 'TestService' });
      factory.register('original', creator);
      factory.alias('aliased', 'original');

      expect(factory.aliases.has('aliased')).toBe(true);
    });

    test('resolves service through alias', () => {
      const creator = () => ({ name: 'TestService' });
      factory.register('original', creator);
      factory.alias('aliased', 'original');

      const instance = factory.make('aliased');
      expect(instance.name).toBe('TestService');
    });

    test('supports multiple aliases for same service', () => {
      const creator = () => ({ name: 'TestService' });
      factory.register('original', creator);
      factory.alias('alias1', 'original');
      factory.alias('alias2', 'original');

      const instance1 = factory.make('alias1');
      const instance2 = factory.make('alias2');

      expect(instance1.name).toBe('TestService');
      expect(instance2.name).toBe('TestService');
    });
  });

  describe('make', () => {
    test('creates service instance', () => {
      const creator = () => ({ name: 'TestService' });
      factory.register('test', creator);

      const instance = factory.make('test');
      expect(instance.name).toBe('TestService');
    });

    test('creates new instance each time for non-singletons', () => {
      const creator = () => ({ id: Math.random() });
      factory.register('test', creator);

      const instance1 = factory.make('test');
      const instance2 = factory.make('test');

      expect(instance1.id).not.toBe(instance2.id);
    });

    test('passes factory instance to creator', () => {
      let passedFactory = null;
      const creator = (factory) => {
        passedFactory = factory;
        return { name: 'TestService' };
      };

      factory.register('test', creator);
      factory.make('test');

      expect(passedFactory).toBe(factory);
    });

    test('throws error for unregistered service', () => {
      expect(() => factory.make('nonexistent')).toThrow('Service [nonexistent] not found');
    });

    test('resolves singleton that is already instance', () => {
      const instance = { name: 'PreCreated' };
      factory.singletons.set('test', instance);

      const resolved = factory.make('test');
      expect(resolved).toBe(instance);
    });

    test('handles dependency injection through creator', () => {
      const dbService = { name: 'Database' };
      factory.singleton('db', () => dbService);

      const userService = (factory) => ({
        db: factory.make('db'),
        name: 'UserService'
      });
      factory.register('user', userService);

      const instance = factory.make('user');
      expect(instance.db).toBe(dbService);
    });
  });

  describe('has', () => {
    test('returns true for registered service', () => {
      factory.register('test', () => ({}));
      expect(factory.has('test')).toBe(true);
    });

    test('returns true for registered singleton', () => {
      factory.singleton('test', () => ({}));
      expect(factory.has('test')).toBe(true);
    });

    test('returns true for aliased service', () => {
      factory.register('original', () => ({}));
      factory.alias('aliased', 'original');
      
      expect(factory.has('aliased')).toBe(true);
    });

    test('returns false for unregistered service', () => {
      expect(factory.has('nonexistent')).toBe(false);
    });
  });

  describe('forget', () => {
    test('removes service from container', () => {
      factory.register('test', () => ({}));
      factory.forget('test');

      expect(factory.has('test')).toBe(false);
    });

    test('removes singleton from container', () => {
      factory.singleton('test', () => ({}));
      factory.forget('test');

      expect(factory.has('test')).toBe(false);
    });

    test('removes associated aliases', () => {
      factory.register('original', () => ({}));
      factory.alias('aliased', 'original');
      
      factory.forget('original');

      expect(factory.aliases.has('aliased')).toBe(false);
    });

    test('does not throw for non-existent service', () => {
      expect(() => factory.forget('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    test('removes all services', () => {
      factory.register('service1', () => ({}));
      factory.singleton('service2', () => ({}));
      factory.alias('alias1', 'service1');

      factory.clear();

      expect(factory.services.size).toBe(0);
      expect(factory.singletons.size).toBe(0);
      expect(factory.aliases.size).toBe(0);
    });

    test('can register services after clear', () => {
      factory.register('test', () => ({}));
      factory.clear();
      factory.register('new', () => ({ name: 'New' }));

      expect(factory.has('test')).toBe(false);
      expect(factory.has('new')).toBe(true);
    });
  });

  describe('getServiceNames', () => {
    test('returns empty array when no services registered', () => {
      const names = factory.getServiceNames();
      expect(names).toEqual([]);
    });

    test('returns all service names', () => {
      factory.register('service1', () => ({}));
      factory.register('service2', () => ({}));
      factory.singleton('singleton1', () => ({}));

      const names = factory.getServiceNames();
      
      expect(names).toContain('service1');
      expect(names).toContain('service2');
      expect(names).toContain('singleton1');
      expect(names).toHaveLength(3);
    });

    test('does not include aliases', () => {
      factory.register('original', () => ({}));
      factory.alias('aliased', 'original');

      const names = factory.getServiceNames();
      
      expect(names).toContain('original');
      expect(names).not.toContain('aliased');
    });
  });

  describe('integration scenarios', () => {
    test('supports service factory pattern', () => {
      // Database service
      factory.singleton('db', () => ({
        connect: () => 'connected',
        query: (sql) => []
      }));

      // Logger service
      factory.singleton('logger', () => ({
        log: (msg) => msg,
        error: (msg) => msg
      }));

      // User service with dependencies
      factory.register('userService', (container) => ({
        db: container.make('db'),
        logger: container.make('logger'),
        create: function(data) {
          this.logger.log('Creating user');
          return this.db.query('INSERT INTO users ...');
        }
      }));

      const userService = factory.make('userService');
      
      expect(userService.db).toBeDefined();
      expect(userService.logger).toBeDefined();
      expect(userService.create).toBeInstanceOf(Function);
    });

    test('supports lazy loading of services', () => {
      let initialized = false;
      
      factory.singleton('expensive', () => {
        initialized = true;
        return { heavy: 'computation' };
      });

      expect(initialized).toBe(false);
      
      factory.make('expensive');
      
      expect(initialized).toBe(true);
    });

    test('supports service replacement for testing', () => {
      // Production service
      factory.singleton('mailer', () => ({
        send: (to, msg) => 'sent via smtp'
      }));

      const prodMailer = factory.make('mailer');
      expect(prodMailer.send()).toBe('sent via smtp');

      // Replace with mock for testing
      factory.forget('mailer');
      factory.singleton('mailer', () => ({
        send: (to, msg) => 'mocked'
      }));

      const mockMailer = factory.make('mailer');
      expect(mockMailer.send()).toBe('mocked');
    });
  });
});

describe('createServiceFactory', () => {
  test('creates new factory instance', () => {
    const factory = createServiceFactory();
    
    expect(factory).toBeInstanceOf(ServiceFactory);
    expect(factory.services.size).toBe(0);
  });

  test('creates independent instances', () => {
    const factory1 = createServiceFactory();
    const factory2 = createServiceFactory();

    factory1.register('test', () => ({}));

    expect(factory1.has('test')).toBe(true);
    expect(factory2.has('test')).toBe(false);
  });
});

describe('serviceFactory (global instance)', () => {
  beforeEach(() => {
    serviceFactory.clear();
  });

  test('is a ServiceFactory instance', () => {
    expect(serviceFactory).toBeInstanceOf(ServiceFactory);
  });

  test('can be used as global container', () => {
    serviceFactory.singleton('globalService', () => ({ name: 'Global' }));

    expect(serviceFactory.has('globalService')).toBe(true);
  });

  test('persists across imports', () => {
    serviceFactory.register('persistent', () => ({ id: 123 }));

    // In real scenario, this would be tested across different modules
    expect(serviceFactory.has('persistent')).toBe(true);
  });
});
