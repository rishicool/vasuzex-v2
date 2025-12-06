/**
 * DebugHelper Tests
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { inspect, dd, DebugHelper } from '../../../../framework/Support/Helpers/DebugHelper.js';

describe('DebugHelper', () => {
  let consoleSpy;
  let exitSpy;

  beforeEach(() => {
    // Spy on console.log
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Spy on process.exit
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original functions
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe('inspect()', () => {
    it('should print value and return it', () => {
      const value = { name: 'John', age: 30 };
      const result = inspect(value);

      expect(result).toBe(value);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should print value with label', () => {
      const value = [1, 2, 3];
      inspect(value, 'Array of numbers');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(output).toContain('Array of numbers');
    });

    it('should handle null values', () => {
      const result = inspect(null, 'Null value');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle undefined values', () => {
      const result = inspect(undefined);
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle complex objects', () => {
      const value = {
        user: { name: 'John', email: 'john@example.com' },
        orders: [{ id: 1, total: 100 }, { id: 2, total: 200 }],
        metadata: { timestamp: new Date(), version: '1.0' }
      };

      const result = inspect(value, 'Complex Object');
      expect(result).toBe(value);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle arrays', () => {
      const value = [1, 'two', { three: 3 }, [4, 5]];
      const result = inspect(value);
      
      expect(result).toBe(value);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should be chainable', () => {
      const user = { name: 'John' };
      const orders = [{ id: 1 }];

      const result1 = inspect(user, 'User');
      const result2 = inspect(orders, 'Orders');

      expect(result1).toBe(user);
      expect(result2).toBe(orders);
      expect(consoleSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('dd()', () => {
    it('should print value and exit process', () => {
      const value = { name: 'John', age: 30 };
      
      dd(value);

      expect(consoleSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should print value with label', () => {
      const value = 'test';
      
      dd(value, 'Test String');

      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(output).toContain('Test String');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should use custom exit code', () => {
      dd('value', null, 0);
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle complex nested objects', () => {
      const value = {
        level1: {
          level2: {
            level3: {
              data: 'deep value'
            }
          }
        }
      };

      dd(value, 'Nested Object');

      expect(consoleSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should show caller information', () => {
      dd({ test: 'value' });

      const output = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(output).toContain('DUMP AND DIE');
      expect(exitSpy).toHaveBeenCalled();
    });
  });

  describe('DebugHelper class', () => {
    it('should expose inspect as static method', () => {
      expect(DebugHelper.inspect).toBe(inspect);
    });

    it('should expose dd as static method', () => {
      expect(DebugHelper.dd).toBe(dd);
    });

    it('should work with class methods', () => {
      const value = { test: 'value' };
      
      const result = DebugHelper.inspect(value);
      expect(result).toBe(value);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references', () => {
      const obj = { name: 'test' };
      obj.self = obj; // Circular reference

      const result = inspect(obj, 'Circular Object');
      expect(result).toBe(obj);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = inspect(error);

      expect(result).toBe(error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle Promises', () => {
      const promise = Promise.resolve('test');
      const result = inspect(promise, 'Promise');

      expect(result).toBe(promise);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle Functions', () => {
      const fn = () => 'test';
      const result = inspect(fn, 'Function');

      expect(result).toBe(fn);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle large arrays', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      const result = inspect(largeArray);

      expect(result).toBe(largeArray);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle Symbols', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      
      const result = inspect(obj);
      expect(result).toBe(obj);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle Map and Set', () => {
      const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
      const set = new Set([1, 2, 3, 4, 5]);

      inspect(map, 'Map');
      inspect(set, 'Set');

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle Buffer', () => {
      const buffer = Buffer.from('test');
      const result = inspect(buffer);

      expect(result).toBe(buffer);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
