/**
 * StringHelper Tests
 * Tests for string manipulation utilities
 * 
 * Tests Cover:
 * - generateSlug() - URL-friendly slug generation with various options
 * - toCamelCase() - Convert to camelCase
 * - toPascalCase() - Convert to PascalCase
 * - toSnakeCase() - Convert to snake_case
 * - toKebabCase() - Convert to kebab-case
 * - truncate() - String truncation
 * - capitalize() - First letter capitalization
 * - toTitleCase() - Title case conversion
 * - contains() - Substring search
 * - startsWith() - Prefix check
 * - endsWith() - Suffix check
 * - randomString() - Random string generation
 * - pad() - String padding
 * - removeWhitespace() - Whitespace removal
 * - normalizeWhitespace() - Whitespace normalization
 * - getInitials() - Extract initials from name
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateSlug,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  capitalize,
  toTitleCase,
  contains,
  startsWith,
  endsWith,
  randomString,
  pad,
  removeWhitespace,
  normalizeWhitespace,
  getInitials,
  StringHelper
} from '../../../../framework/Support/Helpers/StringHelper.js';

describe('StringHelper', () => {
  describe('generateSlug()', () => {
    it('should generate basic slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Store Name 123')).toBe('store-name-123');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Hello & World!')).toBe('hello-world');
      expect(generateSlug('Café & Restaurant')).toBe('cafe-restaurant');
      expect(generateSlug('Price: $99.99')).toBe('price-9999');
    });

    it('should handle unicode characters', () => {
      expect(generateSlug('Niño')).toBe('nino');
      expect(generateSlug('Crème Brûlée')).toBe('creme-brulee');
      expect(generateSlug('São Paulo')).toBe('sao-paulo');
    });

    it('should handle custom separator', () => {
      expect(generateSlug('Hello World', { separator: '_' })).toBe('hello_world');
      expect(generateSlug('Hello World', { separator: '.' })).toBe('hello.world');
    });

    it('should handle uppercase option', () => {
      expect(generateSlug('Hello World', { lowercase: false })).toBe('Hello-World');
    });

    it('should handle strict mode', () => {
      expect(generateSlug('Hello_World-123', { strict: true })).toBe('hello-world-123');
      expect(generateSlug('Hello@World#123', { strict: true })).toBe('helloworld123');
    });

    it('should handle maxLength option', () => {
      expect(generateSlug('Very Long Title That Should Be Truncated', { maxLength: 20 })).toBe('very-long-title-that');
      expect(generateSlug('Short', { maxLength: 20 })).toBe('short');
    });

    it('should handle custom remove pattern', () => {
      expect(generateSlug('Hello [World]', { remove: /[\[\]]/g })).toBe('hello-world');
    });

    it('should handle multiple spaces and separators', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
      expect(generateSlug('Hello---World')).toBe('hello-world');
      expect(generateSlug('Hello___World')).toBe('hello-world');
    });

    it('should handle leading/trailing whitespace', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug(null)).toBe('');
      expect(generateSlug(undefined)).toBe('');
    });

    it('should handle replacement option', () => {
      expect(generateSlug('Hello@World', { replacement: '-' })).toBe('hello-world');
    });
  });

  describe('toCamelCase()', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('Hello World')).toBe('helloWorld');
      expect(toCamelCase('hello world foo bar')).toBe('helloWorldFooBar');
    });

    it('should handle PascalCase input', () => {
      expect(toCamelCase('HelloWorld')).toBe('helloWorld');
    });

    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
      expect(toCamelCase(null)).toBe('');
    });
  });

  describe('toPascalCase()', () => {
    it('should convert to PascalCase', () => {
      expect(toPascalCase('hello-world')).toBe('HelloWorld');
      expect(toPascalCase('hello_world')).toBe('HelloWorld');
      expect(toPascalCase('hello world')).toBe('HelloWorld');
    });

    it('should handle camelCase input', () => {
      expect(toPascalCase('helloWorld')).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
      expect(toPascalCase(null)).toBe('');
    });
  });

  describe('toSnakeCase()', () => {
    it('should convert to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('HelloWorld')).toBe('hello_world');
      expect(toSnakeCase('hello-world')).toBe('hello_world');
      expect(toSnakeCase('hello world')).toBe('hello_world');
    });

    it('should handle empty string', () => {
      expect(toSnakeCase('')).toBe('');
      expect(toSnakeCase(null)).toBe('');
    });
  });

  describe('toKebabCase()', () => {
    it('should convert to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
      expect(toKebabCase('hello_world')).toBe('hello-world');
      expect(toKebabCase('hello world')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(toKebabCase('')).toBe('');
      expect(toKebabCase(null)).toBe('');
    });
  });

  describe('truncate()', () => {
    it('should truncate string', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Hello World', 5)).toBe('He...');
    });

    it('should not truncate if within length', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle custom ending', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
      expect(truncate('Hello World', 8, ' [...]')).toBe('He [...]');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
      expect(truncate(null, 10)).toBe('');
    });
  });

  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
    });
  });

  describe('toTitleCase()', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    it('should handle mixed case', () => {
      expect(toTitleCase('hELLo wORLd')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(toTitleCase('')).toBe('');
      expect(toTitleCase(null)).toBe('');
    });
  });

  describe('contains()', () => {
    it('should check if contains substring', () => {
      expect(contains('Hello World', 'World')).toBe(true);
      expect(contains('Hello World', 'world')).toBe(true);
      expect(contains('Hello World', 'WORLD')).toBe(true);
    });

    it('should return false if not found', () => {
      expect(contains('Hello World', 'Foo')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(contains('', 'test')).toBe(false);
      expect(contains('test', '')).toBe(false);
      expect(contains(null, 'test')).toBe(false);
    });
  });

  describe('startsWith()', () => {
    it('should check if starts with substring', () => {
      expect(startsWith('Hello World', 'Hello')).toBe(true);
      expect(startsWith('Hello World', 'hello')).toBe(true);
      expect(startsWith('Hello World', 'HELLO')).toBe(true);
    });

    it('should return false if not starts with', () => {
      expect(startsWith('Hello World', 'World')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(startsWith('', 'test')).toBe(false);
      expect(startsWith('test', '')).toBe(false);
      expect(startsWith(null, 'test')).toBe(false);
    });
  });

  describe('endsWith()', () => {
    it('should check if ends with substring', () => {
      expect(endsWith('Hello World', 'World')).toBe(true);
      expect(endsWith('Hello World', 'world')).toBe(true);
      expect(endsWith('Hello World', 'WORLD')).toBe(true);
    });

    it('should return false if not ends with', () => {
      expect(endsWith('Hello World', 'Hello')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(endsWith('', 'test')).toBe(false);
      expect(endsWith('test', '')).toBe(false);
      expect(endsWith(null, 'test')).toBe(false);
    });
  });

  describe('randomString()', () => {
    it('should generate random string of specified length', () => {
      const str = randomString(10);
      expect(str).toHaveLength(10);
      expect(typeof str).toBe('string');
    });

    it('should generate different strings', () => {
      const str1 = randomString(20);
      const str2 = randomString(20);
      expect(str1).not.toBe(str2);
    });

    it('should use custom character set', () => {
      const str = randomString(10, '0123456789');
      expect(str).toMatch(/^[0-9]+$/);
      expect(str).toHaveLength(10);
    });

    it('should use default length', () => {
      const str = randomString();
      expect(str).toHaveLength(32);
    });
  });

  describe('pad()', () => {
    it('should pad right by default', () => {
      expect(pad('42', 5, '0')).toBe('42000');
      expect(pad('test', 10, '-')).toBe('test------');
    });

    it('should pad left', () => {
      expect(pad('42', 5, '0', 'left')).toBe('00042');
      expect(pad('test', 10, '-', 'left')).toBe('------test');
    });

    it('should pad both sides', () => {
      expect(pad('test', 10, '-', 'both')).toBe('---test---');
      expect(pad('hi', 6, '*', 'both')).toBe('**hi**');
    });

    it('should not pad if already long enough', () => {
      expect(pad('hello', 5)).toBe('hello');
      expect(pad('hello', 3)).toBe('hello');
    });

    it('should handle multi-char padding', () => {
      expect(pad('42', 10, 'xy', 'left')).toBe('xyxyxyxy42');
    });
  });

  describe('removeWhitespace()', () => {
    it('should remove all whitespace', () => {
      expect(removeWhitespace('Hello World')).toBe('HelloWorld');
      expect(removeWhitespace('  Hello   World  ')).toBe('HelloWorld');
    });

    it('should handle tabs and newlines', () => {
      expect(removeWhitespace('Hello\tWorld\n')).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      expect(removeWhitespace('')).toBe('');
      expect(removeWhitespace(null)).toBe('');
    });
  });

  describe('normalizeWhitespace()', () => {
    it('should normalize whitespace', () => {
      expect(normalizeWhitespace('Hello   World')).toBe('Hello World');
      expect(normalizeWhitespace('  Hello   World  ')).toBe('Hello World');
    });

    it('should handle tabs and newlines', () => {
      expect(normalizeWhitespace('Hello\t\tWorld\n\nFoo')).toBe('Hello World Foo');
    });

    it('should handle empty string', () => {
      expect(normalizeWhitespace('')).toBe('');
      expect(normalizeWhitespace(null)).toBe('');
    });
  });

  describe('getInitials()', () => {
    it('should extract initials', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });

    it('should handle custom max initials', () => {
      expect(getInitials('John Michael Doe', 3)).toBe('JMD');
      expect(getInitials('John Michael Doe', 1)).toBe('J');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle extra whitespace', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
      expect(getInitials(null)).toBe('');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('StringHelper class', () => {
    it('should have all static methods', () => {
      expect(typeof StringHelper.generateSlug).toBe('function');
      expect(typeof StringHelper.toCamelCase).toBe('function');
      expect(typeof StringHelper.toPascalCase).toBe('function');
      expect(typeof StringHelper.toSnakeCase).toBe('function');
      expect(typeof StringHelper.toKebabCase).toBe('function');
      expect(typeof StringHelper.truncate).toBe('function');
      expect(typeof StringHelper.capitalize).toBe('function');
      expect(typeof StringHelper.toTitleCase).toBe('function');
      expect(typeof StringHelper.contains).toBe('function');
      expect(typeof StringHelper.startsWith).toBe('function');
      expect(typeof StringHelper.endsWith).toBe('function');
      expect(typeof StringHelper.randomString).toBe('function');
      expect(typeof StringHelper.pad).toBe('function');
      expect(typeof StringHelper.removeWhitespace).toBe('function');
      expect(typeof StringHelper.normalizeWhitespace).toBe('function');
      expect(typeof StringHelper.getInitials).toBe('function');
    });

    it('should work via class methods', () => {
      expect(StringHelper.generateSlug('Hello World')).toBe('hello-world');
      expect(StringHelper.toCamelCase('hello-world')).toBe('helloWorld');
      expect(StringHelper.capitalize('hello')).toBe('Hello');
    });
  });
});
