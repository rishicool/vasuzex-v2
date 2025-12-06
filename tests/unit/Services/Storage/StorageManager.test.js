/**
 * StorageManager Unit Tests
 * Tests for Laravel-inspired Storage Manager with multiple disk drivers
 * 
 * Tests Cover:
 * - Constructor initialization
 * - Disk instance resolution and caching
 * - Configuration retrieval
 * - Default driver selection
 * - Cloud disk selection
 * - Custom driver creators via extend()
 * - Proxy methods (put, get, exists, delete, url, size, files, copy, move)
 * - Error handling for missing/invalid configuration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('StorageManager', () => {
  let StorageManager;
  let mockApp;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import StorageManager
    const module = await import('../../../../framework/Services/Storage/StorageManager.js');
    StorageManager = module.StorageManager;
    
    // Create mock app with config method
    mockApp = {
      config: jest.fn()
    };
  });

  describe('Constructor', () => {
    it('should initialize with app instance', () => {
      const manager = new StorageManager(mockApp);
      
      expect(manager.app).toBe(mockApp);
      expect(manager.disks).toEqual({});
      expect(manager.customCreators).toEqual({});
    });

    it('should create separate instances for different apps', () => {
      const manager1 = new StorageManager(mockApp);
      const manager2 = new StorageManager({ config: jest.fn() });
      
      expect(manager1).not.toBe(manager2);
      expect(manager1.disks).not.toBe(manager2.disks);
    });
  });

  describe('disk()', () => {
    it('should return default disk when no name provided', async () => {
      const mockDisk = { put: jest.fn(), get: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockDisk);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.default') return 'custom';
        if (key === 'filesystems.disks') {
          return {
            custom: { driver: 'custom', root: '/storage' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('custom', customCreator);
      
      const disk = manager.disk();
      
      expect(disk).toBe(mockDisk);
      expect(mockApp.config).toHaveBeenCalledWith('filesystems.default', 'local');
    });

    it('should cache disk instances', async () => {
      const mockDisk = { put: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockDisk);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.default') return 'custom';
        if (key === 'filesystems.disks') {
          return {
            custom: { driver: 'custom', root: '/storage' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('custom', customCreator);
      
      const disk1 = manager.disk('custom');
      const disk2 = manager.disk('custom');
      
      expect(disk1).toBe(disk2);
      expect(manager.disks.custom).toBe(disk1);
      expect(customCreator).toHaveBeenCalledTimes(1);
    });

    it('should create different instances for different disk names', async () => {
      const mockDisk1 = { put: jest.fn(), name: 'disk1' };
      const mockDisk2 = { put: jest.fn(), name: 'disk2' };
      const creator1 = jest.fn().mockReturnValue(mockDisk1);
      const creator2 = jest.fn().mockReturnValue(mockDisk2);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.default') return 'disk1';
        if (key === 'filesystems.disks') {
          return {
            disk1: { driver: 'disk1', root: '/storage1' },
            disk2: { driver: 'disk2', root: '/storage2' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('disk1', creator1);
      manager.extend('disk2', creator2);
      
      const disk1 = manager.disk('disk1');
      const disk2 = manager.disk('disk2');
      
      expect(disk1).toBe(mockDisk1);
      expect(disk2).toBe(mockDisk2);
      expect(disk1).not.toBe(disk2);
    });
  });

  describe('cloud()', () => {
    it('should return default cloud disk', () => {
      const mockDisk = { put: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockDisk);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.cloud') return 's3';
        if (key === 'filesystems.disks') {
          return {
            s3: { driver: 's3', bucket: 'test-bucket' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('s3', customCreator);
      
      const cloudDisk = manager.cloud();
      
      expect(cloudDisk).toBe(mockDisk);
      expect(mockApp.config).toHaveBeenCalledWith('filesystems.cloud', 's3');
    });

    it('should fallback to s3 as default cloud driver', () => {
      const mockDisk = { put: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(mockDisk);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.cloud') return defaultValue;
        if (key === 'filesystems.disks') {
          return {
            s3: { driver: 's3', bucket: 'test-bucket' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('s3', customCreator);
      
      const cloudDisk = manager.cloud();
      
      expect(cloudDisk).toBe(mockDisk);
    });
  });

  describe('resolve()', () => {
    it('should throw error when disk is not configured', () => {
      mockApp.config.mockReturnValue({});
      
      const manager = new StorageManager(mockApp);
      
      expect(() => manager.resolve('nonexistent')).toThrow('Disk [nonexistent] does not have a configured driver.');
    });

    it('should throw error when driver is missing', () => {
      mockApp.config.mockReturnValue({
        local: { root: '/storage' } // Missing driver
      });
      
      const manager = new StorageManager(mockApp);
      
      expect(() => manager.resolve('local')).toThrow('Disk [local] does not have a configured driver.');
    });

    it('should use custom creator when available', async () => {
      const customDisk = { put: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(customDisk);
      
      mockApp.config.mockReturnValue({
        custom: { driver: 'custom', root: '/storage' }
      });
      
      const manager = new StorageManager(mockApp);
      manager.customCreators.custom = customCreator;
      
      const disk = manager.resolve('custom');
      
      expect(customCreator).toHaveBeenCalledWith(mockApp, {
        driver: 'custom',
        root: '/storage'
      });
      expect(disk).toBe(customDisk);
    });

    it('should throw error for unsupported driver', () => {
      mockApp.config.mockReturnValue({
        unsupported: { driver: 'unknown' }
      });
      
      const manager = new StorageManager(mockApp);
      
      expect(() => manager.resolve('unsupported')).toThrow('Driver [unknown] is not supported.');
    });
  });

  describe('Driver Creation Methods', () => {
    it('should have createLocalDriver method', () => {
      const manager = new StorageManager(mockApp);
      
      expect(typeof manager.createLocalDriver).toBe('function');
    });

    it('should have createS3Driver method', () => {
      const manager = new StorageManager(mockApp);
      
      expect(typeof manager.createS3Driver).toBe('function');
    });

    it('should follow naming convention for driver methods', () => {
      const manager = new StorageManager(mockApp);
      const localMethod = `create${manager.capitalize('local')}Driver`;
      const s3Method = `create${manager.capitalize('s3')}Driver`;
      
      expect(typeof manager[localMethod]).toBe('function');
      expect(typeof manager[s3Method]).toBe('function');
      expect(localMethod).toBe('createLocalDriver');
      expect(s3Method).toBe('createS3Driver');
    });
  });

  describe('extend()', () => {
    it('should register custom creator', () => {
      const customCreator = jest.fn();
      const manager = new StorageManager(mockApp);
      
      const result = manager.extend('custom', customCreator);
      
      expect(result).toBe(manager);
      expect(manager.customCreators.custom).toBe(customCreator);
    });

    it('should allow multiple custom creators', () => {
      const creator1 = jest.fn();
      const creator2 = jest.fn();
      const manager = new StorageManager(mockApp);
      
      manager.extend('custom1', creator1);
      manager.extend('custom2', creator2);
      
      expect(manager.customCreators.custom1).toBe(creator1);
      expect(manager.customCreators.custom2).toBe(creator2);
    });

    it('should support fluent interface', () => {
      const manager = new StorageManager(mockApp);
      
      const result = manager
        .extend('custom1', jest.fn())
        .extend('custom2', jest.fn());
      
      expect(result).toBe(manager);
    });
  });

  describe('getConfig()', () => {
    it('should retrieve disk configuration', () => {
      const disks = {
        local: { driver: 'local', root: '/storage/local' },
        s3: { driver: 's3', bucket: 'test-bucket' }
      };
      
      mockApp.config.mockReturnValue(disks);
      
      const manager = new StorageManager(mockApp);
      const config = manager.getConfig('local');
      
      expect(mockApp.config).toHaveBeenCalledWith('filesystems.disks', {});
      expect(config).toEqual({ driver: 'local', root: '/storage/local' });
    });

    it('should return undefined for nonexistent disk', () => {
      mockApp.config.mockReturnValue({});
      
      const manager = new StorageManager(mockApp);
      const config = manager.getConfig('nonexistent');
      
      expect(config).toBeUndefined();
    });

    it('should return default value when disks not configured', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new StorageManager(mockApp);
      const config = manager.getConfig('local');
      
      expect(config).toBeUndefined();
    });
  });

  describe('getDefaultDriver()', () => {
    it('should return configured default driver', () => {
      mockApp.config.mockReturnValue('s3');
      
      const manager = new StorageManager(mockApp);
      const driver = manager.getDefaultDriver();
      
      expect(mockApp.config).toHaveBeenCalledWith('filesystems.default', 'local');
      expect(driver).toBe('s3');
    });

    it('should return local as fallback default', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new StorageManager(mockApp);
      const driver = manager.getDefaultDriver();
      
      expect(driver).toBe('local');
    });
  });

  describe('getDefaultCloudDriver()', () => {
    it('should return configured default cloud driver', () => {
      mockApp.config.mockReturnValue('gcs');
      
      const manager = new StorageManager(mockApp);
      const driver = manager.getDefaultCloudDriver();
      
      expect(mockApp.config).toHaveBeenCalledWith('filesystems.cloud', 's3');
      expect(driver).toBe('gcs');
    });

    it('should return s3 as fallback default', () => {
      mockApp.config.mockImplementation((key, defaultValue) => defaultValue);
      
      const manager = new StorageManager(mockApp);
      const driver = manager.getDefaultCloudDriver();
      
      expect(driver).toBe('s3');
    });
  });

  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      const manager = new StorageManager(mockApp);
      
      expect(manager.capitalize('local')).toBe('Local');
      expect(manager.capitalize('s3')).toBe('S3');
    });

    it('should handle single character', () => {
      const manager = new StorageManager(mockApp);
      
      expect(manager.capitalize('a')).toBe('A');
    });

    it('should handle already capitalized', () => {
      const manager = new StorageManager(mockApp);
      
      expect(manager.capitalize('Local')).toBe('Local');
    });

    it('should handle empty string', () => {
      const manager = new StorageManager(mockApp);
      
      expect(manager.capitalize('')).toBe('');
    });
  });

  describe('Proxy Methods', () => {
    let manager;
    let mockDisk;

    beforeEach(() => {
      mockDisk = {
        put: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue('content'),
        exists: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(true),
        url: jest.fn().mockReturnValue('/storage/file.txt'),
        size: jest.fn().mockResolvedValue(1024),
        files: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt']),
        copy: jest.fn().mockResolvedValue(true),
        move: jest.fn().mockResolvedValue(true)
      };

      const customCreator = jest.fn().mockReturnValue(mockDisk);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.default') return 'custom';
        if (key === 'filesystems.disks') {
          return {
            custom: { driver: 'custom', root: '/storage' }
          };
        }
        return defaultValue;
      });

      manager = new StorageManager(mockApp);
      manager.extend('custom', customCreator);
    });

    describe('put()', () => {
      it('should proxy to default disk', async () => {
        await manager.put('file.txt', 'content');
        
        expect(mockDisk.put).toHaveBeenCalledWith('file.txt', 'content');
      });

      it('should pass all arguments', async () => {
        await manager.put('file.txt', 'content', { visibility: 'public' });
        
        expect(mockDisk.put).toHaveBeenCalledWith('file.txt', 'content', { visibility: 'public' });
      });
    });

    describe('get()', () => {
      it('should proxy to default disk', async () => {
        const result = await manager.get('file.txt');
        
        expect(mockDisk.get).toHaveBeenCalledWith('file.txt');
        expect(result).toBe('content');
      });
    });

    describe('exists()', () => {
      it('should proxy to default disk', async () => {
        const result = await manager.exists('file.txt');
        
        expect(mockDisk.exists).toHaveBeenCalledWith('file.txt');
        expect(result).toBe(true);
      });
    });

    describe('delete()', () => {
      it('should proxy to default disk', async () => {
        await manager.delete('file.txt');
        
        expect(mockDisk.delete).toHaveBeenCalledWith('file.txt');
      });

      it('should pass multiple files', async () => {
        await manager.delete(['file1.txt', 'file2.txt']);
        
        expect(mockDisk.delete).toHaveBeenCalledWith(['file1.txt', 'file2.txt']);
      });
    });

    describe('url()', () => {
      it('should proxy to default disk', async () => {
        const result = await manager.url('file.txt');
        
        expect(mockDisk.url).toHaveBeenCalledWith('file.txt');
        expect(result).toBe('/storage/file.txt');
      });
    });

    describe('size()', () => {
      it('should proxy to default disk', async () => {
        const result = await manager.size('file.txt');
        
        expect(mockDisk.size).toHaveBeenCalledWith('file.txt');
        expect(result).toBe(1024);
      });
    });

    describe('files()', () => {
      it('should proxy to default disk', async () => {
        const result = await manager.files('/path');
        
        expect(mockDisk.files).toHaveBeenCalledWith('/path');
        expect(result).toEqual(['file1.txt', 'file2.txt']);
      });
    });

    describe('copy()', () => {
      it('should proxy to default disk', async () => {
        await manager.copy('source.txt', 'destination.txt');
        
        expect(mockDisk.copy).toHaveBeenCalledWith('source.txt', 'destination.txt');
      });
    });

    describe('move()', () => {
      it('should proxy to default disk', async () => {
        await manager.move('source.txt', 'destination.txt');
        
        expect(mockDisk.move).toHaveBeenCalledWith('source.txt', 'destination.txt');
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should support multiple disks simultaneously', async () => {
      const mockDisk1 = { put: jest.fn(), name: 'disk1' };
      const mockDisk2 = { put: jest.fn(), name: 'disk2' };
      const creator1 = jest.fn().mockReturnValue(mockDisk1);
      const creator2 = jest.fn().mockReturnValue(mockDisk2);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.default') return 'disk1';
        if (key === 'filesystems.disks') {
          return {
            disk1: { driver: 'disk1', root: '/storage1' },
            disk2: { driver: 'disk2', root: '/storage2' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('disk1', creator1);
      manager.extend('disk2', creator2);
      
      const disk1 = manager.disk('disk1');
      const disk2 = manager.disk('disk2');
      
      expect(disk1).toBe(mockDisk1);
      expect(disk2).toBe(mockDisk2);
      expect(disk1).not.toBe(disk2);
      expect(manager.disks.disk1).toBe(disk1);
      expect(manager.disks.disk2).toBe(disk2);
    });

    it('should allow custom disk to override built-in', async () => {
      const customDisk = { put: jest.fn() };
      const customCreator = jest.fn().mockReturnValue(customDisk);

      mockApp.config.mockReturnValue({
        local: { driver: 'local', root: '/storage' }
      });

      const manager = new StorageManager(mockApp);
      manager.extend('local', customCreator);

      const disk = manager.disk('local');
      
      expect(customCreator).toHaveBeenCalled();
      expect(disk).toBe(customDisk);
    });

    it('should handle disk creation errors gracefully', () => {
      mockApp.config.mockReturnValue({
        broken: { driver: 'invalid_driver' }
      });

      const manager = new StorageManager(mockApp);
      
      expect(() => manager.resolve('broken')).toThrow('Driver [invalid_driver] is not supported.');
    });

    it('should resolve correct method name for driver', () => {
      const manager = new StorageManager(mockApp);
      
      const localMethod = `create${manager.capitalize('local')}Driver`;
      const s3Method = `create${manager.capitalize('s3')}Driver`;
      
      expect(localMethod).toBe('createLocalDriver');
      expect(s3Method).toBe('createS3Driver');
      expect(typeof manager[localMethod]).toBe('function');
      expect(typeof manager[s3Method]).toBe('function');
    });

    it('should support cloud disk access pattern', () => {
      const mockS3Disk = { put: jest.fn() };
      const s3Creator = jest.fn().mockReturnValue(mockS3Disk);
      
      mockApp.config.mockImplementation((key, defaultValue) => {
        if (key === 'filesystems.cloud') return 's3';
        if (key === 'filesystems.disks') {
          return {
            s3: { driver: 's3', bucket: 'my-bucket' }
          };
        }
        return defaultValue;
      });

      const manager = new StorageManager(mockApp);
      manager.extend('s3', s3Creator);

      const cloudDisk = manager.cloud();
      
      expect(cloudDisk).toBe(mockS3Disk);
      expect(s3Creator).toHaveBeenCalledWith(mockApp, {
        driver: 's3',
        bucket: 'my-bucket'
      });
    });
  });
});
