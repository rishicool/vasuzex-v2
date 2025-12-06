/**
 * ConfigRepository Unit Tests
 * Tests for Laravel-inspired configuration repository with dot notation access
 * 
 * Tests Cover:
 * - Constructor initialization
 * - has() method - checking key existence
 * - get() method - retrieving values with dot notation
 * - getMany() method - retrieving multiple values
 * - set() method - setting values
 * - prepend() method - prepending to arrays
 * - push() method - pushing to arrays
 * - all() method - getting all config items
 * - merge() method - merging configurations
 * - clear() method - clearing all items
 * - Error handling for non-array operations
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ConfigRepository', () => {
  let ConfigRepository;

  beforeEach(async () => {
    // Import ConfigRepository
    const module = await import('../../../framework/Config/Repository.js');
    ConfigRepository = module.default;
  });

  describe('Constructor', () => {
    it('should initialize with empty items', () => {
      const config = new ConfigRepository();
      
      expect(config.all()).toEqual({});
    });

    it('should initialize with provided items', () => {
      const items = {
        app: { name: 'TestApp' },
        database: { host: 'localhost' }
      };
      
      const config = new ConfigRepository(items);
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('database.host')).toBe('localhost');
    });

    it('should support nested object initialization', () => {
      const items = {
        app: {
          name: 'TestApp',
          debug: true
        }
      };
      
      const config = new ConfigRepository(items);
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('app.debug')).toBe(true);
    });
  });

  describe('has()', () => {
    it('should return true for existing keys', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' },
        database: { host: 'localhost' }
      });
      
      expect(config.has('app.name')).toBe(true);
      expect(config.has('database.host')).toBe(true);
    });

    it('should return false for non-existing keys', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      expect(config.has('app.debug')).toBe(false);
      expect(config.has('nonexistent')).toBe(false);
    });

    it('should work with nested keys', () => {
      const config = new ConfigRepository({
        app: {
          name: 'TestApp',
          settings: {
            debug: true
          }
        }
      });
      
      expect(config.has('app.settings.debug')).toBe(true);
      expect(config.has('app.settings.verbose')).toBe(false);
    });

    it('should handle null values correctly', () => {
      const config = new ConfigRepository({
        app: { nullable: null }
      });
      
      // Arr.has returns false for null values, but get() still returns them
      expect(config.has('app.nullable')).toBe(false);
      expect(config.get('app.nullable')).toBe(null);
      expect(config.get('app.nullable', 'default')).toBe(null);
    });
  });

  describe('get()', () => {
    it('should retrieve values with dot notation', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' },
        database: { host: 'localhost', port: 3306 }
      });
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('database.host')).toBe('localhost');
      expect(config.get('database.port')).toBe(3306);
    });

    it('should return default value for non-existing keys', () => {
      const config = new ConfigRepository({});
      
      expect(config.get('nonexistent', 'default')).toBe('default');
      expect(config.get('app.debug', false)).toBe(false);
    });

    it('should return null as default when no default provided', () => {
      const config = new ConfigRepository({});
      
      expect(config.get('nonexistent')).toBe(null);
    });

    it('should handle nested objects', () => {
      const config = new ConfigRepository({
        app: {
          name: 'TestApp',
          settings: {
            debug: true,
            verbose: false
          }
        }
      });
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('app.settings.debug')).toBe(true);
      expect(config.get('app.settings.verbose')).toBe(false);
    });

    it('should return entire nested object when key points to object', () => {
      const config = new ConfigRepository({
        app: {
          settings: {
            debug: true,
            verbose: false
          }
        }
      });
      
      expect(config.get('app.settings')).toEqual({
        debug: true,
        verbose: false
      });
    });

    it('should handle array of keys by calling getMany', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp', debug: true }
      });
      
      const result = config.get(['app.name', 'app.debug']);
      
      expect(result).toEqual({
        'app.name': 'TestApp',
        'app.debug': true
      });
    });
  });

  describe('getMany()', () => {
    it('should retrieve multiple values', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp', debug: true },
        database: { host: 'localhost' }
      });
      
      const result = config.getMany(['app.name', 'database.host']);
      
      expect(result).toEqual({
        'app.name': 'TestApp',
        'database.host': 'localhost'
      });
    });

    it('should use default values for missing keys', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      const result = config.getMany([
        'app.name',
        { 'app.debug': false },
        { 'database.host': 'localhost' }
      ]);
      
      expect(result).toEqual({
        'app.name': 'TestApp',
        'app.debug': false,
        'database.host': 'localhost'
      });
    });

    it('should handle empty array', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      const result = config.getMany([]);
      
      expect(result).toEqual({});
    });
  });

  describe('set()', () => {
    it('should set values with dot notation', () => {
      const config = new ConfigRepository({});
      
      config.set('app.name', 'TestApp');
      config.set('database.host', 'localhost');
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('database.host')).toBe('localhost');
    });

    it('should set multiple values with object', () => {
      const config = new ConfigRepository({});
      
      config.set('app', {
        name: 'TestApp',
        debug: true
      });
      config.set('database', { host: 'localhost' });
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('app.debug')).toBe(true);
      expect(config.get('database.host')).toBe('localhost');
    });

    it('should overwrite existing values', () => {
      const config = new ConfigRepository({
        app: { name: 'OldApp' }
      });
      
      config.set('app.name', 'NewApp');
      
      expect(config.get('app.name')).toBe('NewApp');
    });

    it('should create nested structures', () => {
      const config = new ConfigRepository({});
      
      config.set('app.settings.debug', true);
      
      expect(config.get('app.settings.debug')).toBe(true);
      expect(config.get('app.settings')).toEqual({ debug: true });
    });
  });

  describe('prepend()', () => {
    it('should prepend value to array', () => {
      const config = new ConfigRepository({
        providers: ['ServiceProviderA', 'ServiceProviderB']
      });
      
      config.prepend('providers', 'ServiceProviderZ');
      
      expect(config.get('providers')).toEqual(['ServiceProviderZ', 'ServiceProviderA', 'ServiceProviderB']);
    });

    it('should create array if key does not exist', () => {
      const config = new ConfigRepository({});
      
      config.prepend('providers', 'ServiceProviderA');
      
      expect(config.get('providers')).toEqual(['ServiceProviderA']);
    });

    it('should throw error if value is not an array', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      expect(() => config.prepend('app.name', 'value')).toThrow();
    });
  });

  describe('push()', () => {
    it('should push value to array', () => {
      const config = new ConfigRepository({
        'providers': ['ServiceProviderA', 'ServiceProviderB']
      });
      
      config.push('providers', 'ServiceProviderC');
      
      expect(config.get('providers')).toEqual(['ServiceProviderA', 'ServiceProviderB', 'ServiceProviderC']);
    });

    it('should create array if key does not exist', () => {
      const config = new ConfigRepository({});
      
      config.push('providers', 'ServiceProviderA');
      
      expect(config.get('providers')).toEqual(['ServiceProviderA']);
    });

    it('should throw error if value is not an array', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      expect(() => config.push('app.name', 'value')).toThrow();
    });

    it('should handle multiple pushes', () => {
      const config = new ConfigRepository({
        tags: []
      });
      
      config.push('tags', 'tag1');
      config.push('tags', 'tag2');
      config.push('tags', 'tag3');
      
      expect(config.get('tags')).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('all()', () => {
    it('should return all configuration items', () => {
      const items = {
        app: { name: 'TestApp', debug: true },
        database: { host: 'localhost' }
      };
      
      const config = new ConfigRepository(items);
      
      expect(config.all()).toEqual(items);
    });

    it('should return shallow copy of items (not deep copy)', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      const allItems = config.all();
      // Shallow copy: modifying top-level doesn't affect original
      allItems.newKey = 'newValue';
      expect(config.get('newKey')).toBe(null);
      
      // But modifying nested objects does affect original (shallow copy)
      allItems.app.debug = true;
      expect(config.get('app.debug')).toBe(true);
    });

    it('should return empty object when no items', () => {
      const config = new ConfigRepository();
      
      expect(config.all()).toEqual({});
    });
  });

  describe('merge()', () => {
    it('should merge new configuration items', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp', debug: true }
      });
      
      config.merge({
        database: { host: 'localhost', port: 3306 }
      });
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('database.host')).toBe('localhost');
    });

    it('should overwrite existing keys during merge', () => {
      const config = new ConfigRepository({
        app: { name: 'OldApp', debug: true }
      });
      
      config.merge({
        app: { name: 'NewApp' },
        database: { host: 'localhost' }
      });
      
      expect(config.get('app.name')).toBe('NewApp');
      expect(config.get('app.debug')).toBe(null);
      expect(config.get('database.host')).toBe('localhost');
    });

    it('should handle empty merge', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      config.merge({});
      
      expect(config.get('app.name')).toBe('TestApp');
    });
  });

  describe('clear()', () => {
    it('should clear all configuration items', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp', debug: true },
        database: { host: 'localhost' }
      });
      
      config.clear();
      
      expect(config.all()).toEqual({});
      expect(config.get('app.name')).toBe(null);
    });

    it('should allow setting new items after clear', () => {
      const config = new ConfigRepository({
        app: { name: 'TestApp' }
      });
      
      config.clear();
      config.set('new.key', 'value');
      
      expect(config.get('new.key')).toBe('value');
      expect(config.get('app.name')).toBe(null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex nested configuration', () => {
      const config = new ConfigRepository({});
      
      config.set('app.name', 'TestApp');
      config.set('app.settings.debug', true);
      config.set('app.settings.log.level', 'error');
      config.set('app.settings.log.file', '/var/log/app.log');
      
      expect(config.get('app.settings')).toEqual({
        debug: true,
        log: {
          level: 'error',
          file: '/var/log/app.log'
        }
      });
    });

    it('should support array operations on nested arrays', () => {
      const config = new ConfigRepository({});
      
      config.set('app.providers', []);
      config.push('app.providers', 'ProviderA');
      config.push('app.providers', 'ProviderB');
      config.prepend('app.providers', 'ProviderZ');
      
      expect(config.get('app.providers')).toEqual(['ProviderZ', 'ProviderA', 'ProviderB']);
    });

    it('should handle mixed data types', () => {
      const config = new ConfigRepository({
        app: {
          name: 'TestApp',
          debug: true,
          port: 3000,
          settings: { timeout: 5000 },
          tags: ['api', 'production']
        }
      });
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('app.debug')).toBe(true);
      expect(config.get('app.port')).toBe(3000);
      expect(config.get('app.settings')).toEqual({ timeout: 5000 });
      expect(config.get('app.tags')).toEqual(['api', 'production']);
    });

    it('should support fluent configuration building', () => {
      const config = new ConfigRepository({});
      
      config.set('app.name', 'TestApp');
      config.set('app.debug', true);
      config.merge({ database: { host: 'localhost' } });
      config.set('providers', []);
      config.push('providers', 'ServiceProvider');
      
      expect(config.get('app.name')).toBe('TestApp');
      expect(config.get('app.debug')).toBe(true);
      expect(config.get('database.host')).toBe('localhost');
      expect(config.get('providers')).toEqual(['ServiceProvider']);
    });
  });
});
