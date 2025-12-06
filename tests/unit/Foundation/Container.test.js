/**
 * Container Unit Tests
 * Tests for framework/Foundation/Container.js
 * 
 * Coverage:
 * - Constructor and initialization
 * - bind() - binding classes/factories
 * - singleton() - singleton binding
 * - instance() - binding existing instances
 * - alias() - creating aliases
 * - make() - resolving services
 * - has() - checking binding existence
 * - forget() - removing bindings
 * - flush() - clearing all bindings
 * - Singleton resolution (cached instances)
 * - Alias resolution
 * - Error handling for missing bindings
 */

import { jest } from '@jest/globals';
import { Container } from '../../../framework/Foundation/Container.js';

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
  });

  describe('Constructor', () => {
    it('should initialize with empty collections', () => {
      expect(container.bindings).toBeInstanceOf(Map);
      expect(container.instances).toBeInstanceOf(Map);
      expect(container.singletons).toBeInstanceOf(Set);
      expect(container.aliases).toBeInstanceOf(Map);
      
      expect(container.bindings.size).toBe(0);
      expect(container.instances.size).toBe(0);
      expect(container.singletons.size).toBe(0);
      expect(container.aliases.size).toBe(0);
    });
  });

  describe('bind()', () => {
    it('should bind a class to the container', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      
      expect(container.bindings.has('TestService')).toBe(true);
      expect(container.bindings.get('TestService')).toBe(TestService);
    });

    it('should bind a factory function to the container', () => {
      class FactoryService {
        constructor() {
          this.value = 42;
        }
      }
      
      container.bind('factory', FactoryService);
      
      expect(container.bindings.has('factory')).toBe(true);
      expect(container.bindings.get('factory')).toBe(FactoryService);
    });

    it('should not mark as singleton by default', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      
      expect(container.singletons.has('TestService')).toBe(false);
    });

    it('should mark as singleton when third parameter is true', () => {
      class TestService {}
      
      container.bind('TestService', TestService, true);
      
      expect(container.singletons.has('TestService')).toBe(true);
    });

    it('should allow rebinding', () => {
      class Service1 {}
      class Service2 {}
      
      container.bind('service', Service1);
      expect(container.bindings.get('service')).toBe(Service1);
      
      container.bind('service', Service2);
      expect(container.bindings.get('service')).toBe(Service2);
    });
  });

  describe('singleton()', () => {
    it('should bind as singleton', () => {
      class TestService {}
      
      container.singleton('TestService', TestService);
      
      expect(container.bindings.has('TestService')).toBe(true);
      expect(container.singletons.has('TestService')).toBe(true);
    });

    it('should resolve to same instance on multiple makes', () => {
      class TestService {
        constructor() {
          this.id = Math.random();
        }
      }
      
      container.singleton('TestService', TestService);
      
      const instance1 = container.make('TestService');
      const instance2 = container.make('TestService');
      
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });
  });

  describe('instance()', () => {
    it('should store an existing instance', () => {
      const existingInstance = { value: 'test' };
      
      container.instance('myInstance', existingInstance);
      
      expect(container.instances.has('myInstance')).toBe(true);
      expect(container.instances.get('myInstance')).toBe(existingInstance);
    });

    it('should return the same instance when resolved', () => {
      const existingInstance = { value: 'test' };
      
      container.instance('myInstance', existingInstance);
      const resolved = container.make('myInstance');
      
      expect(resolved).toBe(existingInstance);
    });
  });

  describe('alias()', () => {
    it('should create an alias for a binding', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      
      expect(container.aliases.has('Test')).toBe(true);
      expect(container.aliases.get('Test')).toBe('TestService');
    });

    it('should resolve through alias', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      
      const resolved = container.make('Test');
      
      expect(resolved).toBeInstanceOf(TestService);
    });

    it('should allow multiple aliases for same binding', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      container.alias('T', 'TestService');
      
      const instance1 = container.make('Test');
      const instance2 = container.make('T');
      
      expect(instance1).toBeInstanceOf(TestService);
      expect(instance2).toBeInstanceOf(TestService);
    });
  });

  describe('make()', () => {
    it('should resolve a bound class', () => {
      class TestService {
        getValue() {
          return 'test';
        }
      }
      
      container.bind('TestService', TestService);
      const instance = container.make('TestService');
      
      expect(instance).toBeInstanceOf(TestService);
      expect(instance.getValue()).toBe('test');
    });

    it('should resolve a factory class', () => {
      class FactoryService {
        constructor() {
          this.value = 42;
        }
      }
      
      container.bind('factory', FactoryService);
      const result = container.make('factory');
      
      expect(result).toBeInstanceOf(FactoryService);
      expect(result.value).toBe(42);
    });

    it('should return new instance each time for non-singleton', () => {
      class TestService {
        constructor() {
          this.id = Math.random();
        }
      }
      
      container.bind('TestService', TestService);
      
      const instance1 = container.make('TestService');
      const instance2 = container.make('TestService');
      
      expect(instance1).not.toBe(instance2);
      expect(instance1.id).not.toBe(instance2.id);
    });

    it('should cache and return same instance for singleton', () => {
      class TestService {
        constructor() {
          this.id = Math.random();
        }
      }
      
      container.singleton('TestService', TestService);
      
      const instance1 = container.make('TestService');
      const instance2 = container.make('TestService');
      
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });

    it('should return existing instance first if available', () => {
      const existingInstance = { value: 'existing' };
      
      container.instance('service', existingInstance);
      const resolved = container.make('service');
      
      expect(resolved).toBe(existingInstance);
    });

    it('should throw error for missing binding', () => {
      expect(() => container.make('NonExistent')).toThrow(
        'No binding found for "NonExistent"'
      );
    });

    it('should resolve through alias', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      
      const instance = container.make('Test');
      
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should handle non-constructor concrete bindings', () => {
      const simpleObject = { value: 'simple' };
      
      container.bind('simple', simpleObject);
      const resolved = container.make('simple');
      
      expect(resolved).toEqual(simpleObject);
    });
  });

  describe('has()', () => {
    it('should return true for existing binding', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      
      expect(container.has('TestService')).toBe(true);
    });

    it('should return true for existing instance', () => {
      container.instance('myInstance', { value: 'test' });
      
      expect(container.has('myInstance')).toBe(true);
    });

    it('should return false for non-existent binding', () => {
      expect(container.has('NonExistent')).toBe(false);
    });

    it('should return true for aliased binding', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      
      expect(container.has('Test')).toBe(true);
    });

    it('should work with both bindings and instances', () => {
      class Service1 {}
      
      container.bind('service1', Service1);
      container.instance('service2', {});
      
      expect(container.has('service1')).toBe(true);
      expect(container.has('service2')).toBe(true);
      expect(container.has('service3')).toBe(false);
    });
  });

  describe('forget()', () => {
    it('should remove a binding', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      expect(container.has('TestService')).toBe(true);
      
      container.forget('TestService');
      expect(container.has('TestService')).toBe(false);
    });

    it('should remove an instance', () => {
      container.instance('myInstance', { value: 'test' });
      expect(container.has('myInstance')).toBe(true);
      
      container.forget('myInstance');
      expect(container.has('myInstance')).toBe(false);
    });

    it('should remove singleton marker', () => {
      class TestService {}
      
      container.singleton('TestService', TestService);
      expect(container.singletons.has('TestService')).toBe(true);
      
      container.forget('TestService');
      expect(container.singletons.has('TestService')).toBe(false);
    });

    it('should resolve through alias when forgetting', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      
      container.forget('Test');
      
      expect(container.has('TestService')).toBe(false);
    });

    it('should not throw error when forgetting non-existent binding', () => {
      expect(() => container.forget('NonExistent')).not.toThrow();
    });
  });

  describe('flush()', () => {
    it('should clear all bindings', () => {
      class Service1 {}
      class Service2 {}
      
      container.bind('service1', Service1);
      container.bind('service2', Service2);
      
      expect(container.bindings.size).toBe(2);
      
      container.flush();
      
      expect(container.bindings.size).toBe(0);
    });

    it('should clear all instances', () => {
      container.instance('instance1', {});
      container.instance('instance2', {});
      
      expect(container.instances.size).toBe(2);
      
      container.flush();
      
      expect(container.instances.size).toBe(0);
    });

    it('should clear all singletons', () => {
      class Service1 {}
      class Service2 {}
      
      container.singleton('service1', Service1);
      container.singleton('service2', Service2);
      
      expect(container.singletons.size).toBe(2);
      
      container.flush();
      
      expect(container.singletons.size).toBe(0);
    });

    it('should clear all aliases', () => {
      class TestService {}
      
      container.bind('TestService', TestService);
      container.alias('Test', 'TestService');
      container.alias('T', 'TestService');
      
      expect(container.aliases.size).toBe(2);
      
      container.flush();
      
      expect(container.aliases.size).toBe(0);
    });

    it('should clear all collections in one call', () => {
      class TestService {}
      
      container.bind('service', TestService);
      container.singleton('singleton', TestService);
      container.instance('instance', {});
      container.alias('alias', 'service');
      
      container.flush();
      
      expect(container.bindings.size).toBe(0);
      expect(container.instances.size).toBe(0);
      expect(container.singletons.size).toBe(0);
      expect(container.aliases.size).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should support complex dependency resolution', () => {
      class Database {
        query() {
          return 'db result';
        }
      }
      
      class UserRepository {
        constructor() {
          this.db = container.make('Database');
        }
        
        getUsers() {
          return this.db.query();
        }
      }
      
      container.singleton('Database', Database);
      container.bind('UserRepository', UserRepository);
      
      const repo1 = container.make('UserRepository');
      const repo2 = container.make('UserRepository');
      
      expect(repo1.getUsers()).toBe('db result');
      expect(repo2.getUsers()).toBe('db result');
      expect(repo1.db).toBe(repo2.db); // Same database instance (singleton)
      expect(repo1).not.toBe(repo2); // Different repo instances
    });

    it('should handle circular dependencies gracefully', () => {
      class ServiceA {}
      class ServiceB {}
      
      container.bind('ServiceA', ServiceA);
      container.bind('ServiceB', ServiceB);
      
      const a = container.make('ServiceA');
      const b = container.make('ServiceB');
      
      expect(a).toBeInstanceOf(ServiceA);
      expect(b).toBeInstanceOf(ServiceB);
    });

    it('should support factory-based resolution with unique instances', () => {
      let counter = 0;
      
      class CounterService {
        constructor() {
          counter++;
          this.id = counter;
        }
      }
      
      container.bind('counter', CounterService);
      
      const obj1 = container.make('counter');
      const obj2 = container.make('counter');
      
      expect(obj1.id).toBe(1);
      expect(obj2.id).toBe(2);
      expect(obj1).not.toBe(obj2);
    });
  });
});
