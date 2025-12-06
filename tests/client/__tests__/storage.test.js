/**
 * Integration tests for @vasuzex/client storage
 */

/**
 * @jest-environment jsdom
 */

describe('Storage Module', () => {
  const { storage } = require('../dist/Storage/index.cjs');

  beforeEach(() => {
    localStorage.clear();
  });

  describe('storage.get / storage.set', () => {
    it('should store and retrieve strings', () => {
      storage.set('key1', 'value1');
      expect(storage.get('key1')).toBe('value1');
    });

    it('should store and retrieve JSON objects', () => {
      const obj = { name: 'Test', count: 42 };
      storage.set('obj', obj, true);
      expect(storage.get('obj', true)).toEqual(obj);
    });

    it('should return null for non-existent keys', () => {
      expect(storage.get('nonexistent')).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem('invalid', 'not-json{');
      expect(storage.get('invalid', true)).toBeNull();
    });
  });

  describe('storage.remove', () => {
    it('should remove stored items', () => {
      storage.set('temp', 'value');
      expect(storage.get('temp')).toBe('value');
      
      storage.remove('temp');
      expect(storage.get('temp')).toBeNull();
    });
  });

  describe('storage.clear', () => {
    it('should clear all stored items', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      
      storage.clear();
      
      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
    });
  });

  describe('storage.has', () => {
    it('should check if key exists', () => {
      storage.set('exists', 'yes');
      
      expect(storage.has('exists')).toBe(true);
      expect(storage.has('notexists')).toBe(false);
    });
  });

  describe('complex data types', () => {
    it('should handle arrays', () => {
      const arr = [1, 2, 3, 'test', { nested: true }];
      storage.set('array', arr, true);
      expect(storage.get('array', true)).toEqual(arr);
    });

    it('should handle nested objects', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      };
      storage.set('nested', nested, true);
      expect(storage.get('nested', true)).toEqual(nested);
    });

    it('should handle special characters in values', () => {
      const special = 'Value with "quotes" and \'apostrophes\'';
      storage.set('special', special);
      expect(storage.get('special')).toBe(special);
    });
  });
});
