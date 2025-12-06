/**
 * Arr Utility Tests
 * Tests for array and object manipulation utility class
 * 
 * Tests Cover:
 * - get() - nested object access with dot notation
 * - set() - nested object modification
 * - has() - key existence check
 * - flatten() - array flattening
 * - only() - key filtering
 * - except() - key exclusion
 * - pluck() - value extraction
 * - groupBy() - grouping
 * - chunk() - array chunking
 * - unique() - duplicate removal
 * - wrap() - array wrapping
 */

import { describe, it, expect } from '@jest/globals';
import { Arr } from '../../../framework/Support/Arr.js';

describe('Arr Utility', () => {
  describe('get()', () => {
    it('should get nested value using dot notation', () => {
      const obj = { app: { name: 'Test', port: 3000 } };
      
      expect(Arr.get(obj, 'app.name')).toBe('Test');
      expect(Arr.get(obj, 'app.port')).toBe(3000);
    });

    it('should return default value for non-existent keys', () => {
      const obj = { app: { name: 'Test' } };
      
      expect(Arr.get(obj, 'app.debug', false)).toBe(false);
      expect(Arr.get(obj, 'nonexistent', 'default')).toBe('default');
    });

    it('should return null as default when not specified', () => {
      const obj = {};
      
      expect(Arr.get(obj, 'nonexistent')).toBe(null);
    });
  });

  describe('set()', () => {
    it('should set nested value using dot notation', () => {
      const obj = {};
      
      Arr.set(obj, 'app.name', 'Test');
      
      expect(obj.app.name).toBe('Test');
    });

    it('should create intermediate objects', () => {
      const obj = {};
      
      Arr.set(obj, 'app.settings.debug', true);
      
      expect(obj.app.settings.debug).toBe(true);
    });
  });

  describe('has()', () => {
    it('should return true for existing keys', () => {
      const obj = { app: { name: 'Test' } };
      
      expect(Arr.has(obj, 'app.name')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const obj = { app: {} };
      
      expect(Arr.has(obj, 'app.name')).toBe(false);
    });
  });

  describe('flatten()', () => {
    it('should flatten array by default depth', () => {
      const arr = [1, [2, 3], 4];
      
      expect(Arr.flatten(arr)).toEqual([1, 2, 3, 4]);
    });

    it('should flatten array by custom depth', () => {
      const arr = [1, [2, [3, 4]], 5];
      
      expect(Arr.flatten(arr, 2)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('only()', () => {
    it('should return only specified keys', () => {
      const obj = { name: 'John', age: 30, email: 'john@example.com' };
      
      expect(Arr.only(obj, ['name', 'email'])).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
    });
  });

  describe('except()', () => {
    it('should return all except specified keys', () => {
      const obj = { name: 'John', age: 30, email: 'john@example.com' };
      
      expect(Arr.except(obj, ['age'])).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
    });
  });

  describe('pluck()', () => {
    it('should pluck values from array of objects', () => {
      const arr = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];
      
      expect(Arr.pluck(arr, 'name')).toEqual(['John', 'Jane']);
    });
  });

  describe('groupBy()', () => {
    it('should group array by key', () => {
      const arr = [
        { type: 'fruit', name: 'apple' },
        { type: 'vegetable', name: 'carrot' },
        { type: 'fruit', name: 'banana' }
      ];
      
      const result = Arr.groupBy(arr, 'type');
      
      expect(result.fruit.length).toBe(2);
      expect(result.vegetable.length).toBe(1);
    });
  });

  describe('chunk()', () => {
    it('should chunk array into smaller arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      
      expect(Arr.chunk(arr, 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('unique()', () => {
    it('should return unique values', () => {
      const arr = [1, 2, 2, 3, 3, 3];
      
      expect(Arr.unique(arr)).toEqual([1, 2, 3]);
    });
  });

  describe('wrap()', () => {
    it('should wrap non-array values', () => {
      expect(Arr.wrap('value')).toEqual(['value']);
      expect(Arr.wrap(123)).toEqual([123]);
    });

    it('should not wrap arrays', () => {
      expect(Arr.wrap([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });
});
