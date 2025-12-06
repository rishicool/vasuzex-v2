/**
 * ConfigService Unit Tests
 * Tests for database-driven configuration service with auto-reload and environment support
 * 
 * Tests Cover:
 * - Constructor initialization with options
 * - init() method - database initialization
 * - _loadConfigs() method - loading from database with environment filtering
 * - get() method - retrieving with auto-reload and fallback
 * - getAll() method - cache retrieval
 * - reload() method - force refresh
 * - shouldReload() method - cache expiry check
 * - _buildNestedObject() method - flat to nested transformation
 * - _getNestedValue() method - dot notation traversal
 * - clear() method - cache clearing
 * - Integration scenarios with GuruORM
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ConfigService', () => {
  let ConfigService;
  let mockDB;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import ConfigService
    const module = await import('../../../../framework/Services/Config/ConfigService.js');
    ConfigService = module.default;

    // Mock database
    mockDB = {
      table: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue([])
    };
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const service = new ConfigService();
      
      expect(service.tableName).toBe('app_configs');
      expect(service.environment).toBe(process.env.NODE_ENV || 'development');
      expect(service.cacheDuration).toBe(300000); // 5 minutes
    });

    it('should initialize with custom options', () => {
      const service = new ConfigService({
        table: 'app_settings',
        env: 'production',
        cacheDuration: 600000
      });
      
      expect(service.tableName).toBe('app_settings');
      expect(service.environment).toBe('production');
      expect(service.cacheDuration).toBe(600000);
    });

    it('should start with empty cache', () => {
      const service = new ConfigService();
      
      expect(service.configCache).toEqual({});
      expect(service.isInitialized).toBe(false);
      expect(service.lastLoadTime).toBe(null);
    });
  });

  describe('init()', () => {
    it('should initialize with database and load configs', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 },
        { key: 'app.debug', value: 'true', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      expect(service.DB).toBe(mockDB);
      expect(service.isInitialized).toBe(true);
      expect(mockDB.table).toHaveBeenCalledWith('app_configs');
    });

    it('should load configs during initialization', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      expect(service.get('app.name')).toBe('TestApp');
    });
  });

  describe('_loadConfigs()', () => {
    it('should load all active configs for current environment', async () => {
      const service = new ConfigService({ env: process.env.NODE_ENV || 'development' });
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1, environment: process.env.NODE_ENV || 'development' },
        { key: 'app.debug', value: 'true', is_active: 1, environment: process.env.NODE_ENV || 'development' }
      ]);
      
      await service.init(mockDB);
      
      expect(mockDB.where).toHaveBeenCalledWith('is_active', true);
      expect(service.configCache).toHaveProperty('app');
    });

    it('should filter by specific environment', async () => {
      const service = new ConfigService({ env: 'production' });
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'ProdApp', is_active: 1, environment: 'production' }
      ]);
      
      await service.init(mockDB);
      
      // Check that environment filtering was applied
      expect(service.environment).toBe('production');
      expect(service.get('app.name')).toBe('ProdApp');
    });

    it('should update lastLoadTime after loading', async () => {
      const service = new ConfigService();
      const beforeLoad = Date.now();
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      
      expect(service.lastLoadTime).toBeGreaterThanOrEqual(beforeLoad);
    });

    it('should handle database errors gracefully', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockRejectedValue(new Error('Database error'));
      
      await expect(service.init(mockDB)).rejects.toThrow('Database error');
    });
  });

  describe('_buildNestedObject()', () => {
    it('should convert flat key-value pairs to nested object', () => {
      const service = new ConfigService();
      
      const configs = [
        { key: 'app.name', value: 'TestApp' },
        { key: 'app.debug', value: 'true' },
        { key: 'database.host', value: 'localhost' }
      ];
      
      const result = service._buildNestedObject(configs);
      
      expect(result).toEqual({
        app: {
          name: 'TestApp',
          debug: true
        },
        database: {
          host: 'localhost'
        }
      });
    });

    it('should parse boolean string values', () => {
      const service = new ConfigService();
      
      const configs = [
        { key: 'app.debug', value: 'true' },
        { key: 'app.verbose', value: 'false' }
      ];
      
      const result = service._buildNestedObject(configs);
      
      expect(result.app.debug).toBe(true);
      expect(result.app.verbose).toBe(false);
    });

    it('should parse numeric string values', () => {
      const service = new ConfigService();
      
      const configs = [
        { key: 'database.port', value: '3306' },
        { key: 'app.timeout', value: '5000' }
      ];
      
      const result = service._buildNestedObject(configs);
      
      expect(result.database.port).toBe(3306);
      expect(result.app.timeout).toBe(5000);
    });

    it('should keep string values as strings', () => {
      const service = new ConfigService();
      
      const configs = [
        { key: 'app.name', value: 'TestApp' },
        { key: 'database.host', value: 'localhost' }
      ];
      
      const result = service._buildNestedObject(configs);
      
      expect(result.app.name).toBe('TestApp');
      expect(result.database.host).toBe('localhost');
    });

    it('should handle deep nesting', () => {
      const service = new ConfigService();
      
      const configs = [
        { key: 'app.settings.cache.ttl', value: '3600' },
        { key: 'app.settings.cache.driver', value: 'redis' }
      ];
      
      const result = service._buildNestedObject(configs);
      
      expect(result).toEqual({
        app: {
          settings: {
            cache: {
              ttl: 3600,
              driver: 'redis'
            }
          }
        }
      });
    });

    it('should handle empty configs array', () => {
      const service = new ConfigService();
      
      const result = service._buildNestedObject([]);
      
      expect(result).toEqual({});
    });
  });

  describe('_getNestedValue()', () => {
    it('should retrieve nested values using dot notation', () => {
      const service = new ConfigService();
      
      const obj = {
        app: {
          name: 'TestApp',
          settings: {
            debug: true
          }
        }
      };
      
      expect(service._getNestedValue(obj, 'app.name')).toBe('TestApp');
      expect(service._getNestedValue(obj, 'app.settings.debug')).toBe(true);
    });

    it('should return undefined for non-existent paths', () => {
      const service = new ConfigService();
      
      const obj = {
        app: {
          name: 'TestApp'
        }
      };
      
      expect(service._getNestedValue(obj, 'app.debug')).toBeUndefined();
      expect(service._getNestedValue(obj, 'nonexistent.key')).toBeUndefined();
    });

    it('should handle single-level keys', () => {
      const service = new ConfigService();
      
      const obj = {
        name: 'TestApp'
      };
      
      expect(service._getNestedValue(obj, 'name')).toBe('TestApp');
    });
  });

  describe('get()', () => {
    it('should retrieve cached config values', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      expect(service.get('app.name')).toBe('TestApp');
    });

    it('should return fallback for non-existent keys', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      
      expect(service.get('nonexistent', 'fallback')).toBe('fallback');
    });

    it('should return null as default fallback', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      
      expect(service.get('nonexistent')).toBe(null);
    });

    it('should trigger reload if cache expired but return cached value', async () => {
      const service = new ConfigService({ cacheDuration: 100 }); // 100ms cache
      
      mockDB.get
        .mockResolvedValueOnce([
          { key: 'app.name', value: 'OldApp', is_active: 1 }
        ])
        .mockResolvedValueOnce([
          { key: 'app.name', value: 'NewApp', is_active: 1 }
        ]);
      
      await service.init(mockDB);
      expect(service.get('app.name')).toBe('OldApp');
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // get() triggers reload but doesn't await it, so returns old cached value
      const value = service.get('app.name');
      expect(value).toBe('OldApp');
      
      // Wait for background reload to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now it should have new value
      expect(service.get('app.name')).toBe('NewApp');
    });

    it('should not reload if cache still valid', async () => {
      const service = new ConfigService({ cacheDuration: 10000 }); // 10s cache
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      const value1 = service.get('app.name');
      const value2 = service.get('app.name');
      
      expect(value1).toBe('TestApp');
      expect(value2).toBe('TestApp');
      expect(mockDB.get).toHaveBeenCalledTimes(1); // Only initial load
    });
  });

  describe('getAll()', () => {
    it('should return all cached configs', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 },
        { key: 'app.debug', value: 'true', is_active: 1 },
        { key: 'database.host', value: 'localhost', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      const all = service.getAll();
      
      expect(all).toHaveProperty('app');
      expect(all.app.name).toBe('TestApp');
      expect(all.app.debug).toBe(true);
      expect(all.database.host).toBe('localhost');
    });

    it('should return empty object when no configs loaded', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      
      expect(service.getAll()).toEqual({});
    });
  });

  describe('reload()', () => {
    it('should force reload from database', async () => {
      const service = new ConfigService();
      
      mockDB.get
        .mockResolvedValueOnce([
          { key: 'app.name', value: 'OldApp', is_active: 1 }
        ])
        .mockResolvedValueOnce([
          { key: 'app.name', value: 'NewApp', is_active: 1 }
        ]);
      
      await service.init(mockDB);
      expect(service.get('app.name')).toBe('OldApp');
      
      await service.reload();
      expect(service.get('app.name')).toBe('NewApp');
    });

    it('should update lastLoadTime after reload', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      const firstLoadTime = service.lastLoadTime;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await service.reload();
      expect(service.lastLoadTime).toBeGreaterThan(firstLoadTime);
    });
  });

  describe('shouldReload()', () => {
    it('should return true when cache expired', async () => {
      const service = new ConfigService({ cacheDuration: 100 });
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(service.shouldReload()).toBe(true);
    });

    it('should return false when cache still valid', async () => {
      const service = new ConfigService({ cacheDuration: 10000 });
      
      mockDB.get.mockResolvedValue([]);
      
      await service.init(mockDB);
      
      expect(service.shouldReload()).toBe(false);
    });

    it('should return falsy when never loaded', () => {
      const service = new ConfigService();
      
      // Returns falsy (undefined or false) when lastLoadTime is null
      expect(service.shouldReload()).toBeFalsy();
    });
  });

  describe('clear()', () => {
    it('should clear cache and reset state', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      expect(service.isInitialized).toBe(true);
      
      service.clear();
      
      expect(service.configCache).toEqual({});
      expect(service.isInitialized).toBe(false);
      expect(service.lastLoadTime).toBe(null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multiple environments correctly', async () => {
      const prodService = new ConfigService({ env: 'production' });
      const devService = new ConfigService({ env: 'development' });
      
      const prodDB = {
        table: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue([
          { key: 'app.debug', value: 'false', is_active: 1, environment: 'production' }
        ])
      };
      
      const devDB = {
        table: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue([
          { key: 'app.debug', value: 'true', is_active: 1, environment: 'development' }
        ])
      };
      
      await prodService.init(prodDB);
      await devService.init(devDB);
      
      expect(prodService.get('app.debug')).toBe(false);
      expect(devService.get('app.debug')).toBe(true);
    });

    it('should handle complex nested configuration', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'cache.default', value: 'redis', is_active: 1 },
        { key: 'cache.stores.redis.host', value: 'localhost', is_active: 1 },
        { key: 'cache.stores.redis.port', value: '6379', is_active: 1 },
        { key: 'cache.stores.file.path', value: '/tmp/cache', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      expect(service.get('cache.default')).toBe('redis');
      expect(service.get('cache.stores.redis.host')).toBe('localhost');
      expect(service.get('cache.stores.redis.port')).toBe(6379);
      expect(service.get('cache.stores.file.path')).toBe('/tmp/cache');
    });

    it('should trigger auto-reload on cache expiry during get', async () => {
      const service = new ConfigService({ cacheDuration: 50 });
      
      let callCount = 0;
      mockDB.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve([
          { key: 'app.version', value: `v${callCount}`, is_active: 1 }
        ]);
      });
      
      await service.init(mockDB);
      expect(service.get('app.version')).toBe('v1');
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // get() triggers reload but doesn't wait for it
      const firstGet = service.get('app.version');
      expect(firstGet).toBe('v1'); // Still returns cached value
      
      // Wait for background reload to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now should have new value
      expect(service.get('app.version')).toBe('v2');
    });

    it('should filter inactive configs', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.name', value: 'TestApp', is_active: 1 },
        { key: 'app.debug', value: 'true', is_active: 0 } // Inactive, should be filtered by DB query
      ]);
      
      await service.init(mockDB);
      
      expect(mockDB.where).toHaveBeenCalledWith('is_active', true);
    });

    it('should handle data type conversions correctly', async () => {
      const service = new ConfigService();
      
      mockDB.get.mockResolvedValue([
        { key: 'app.debug', value: 'true', is_active: 1 },
        { key: 'app.verbose', value: 'false', is_active: 1 },
        { key: 'app.port', value: '3000', is_active: 1 },
        { key: 'app.timeout', value: '5000', is_active: 1 },
        { key: 'app.name', value: 'TestApp', is_active: 1 },
        { key: 'app.host', value: 'localhost', is_active: 1 }
      ]);
      
      await service.init(mockDB);
      
      expect(service.get('app.debug')).toBe(true);
      expect(service.get('app.verbose')).toBe(false);
      expect(service.get('app.port')).toBe(3000);
      expect(service.get('app.timeout')).toBe(5000);
      expect(service.get('app.name')).toBe('TestApp');
      expect(service.get('app.host')).toBe('localhost');
    });
  });
});
