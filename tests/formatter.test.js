/**
 * Formatter Service Tests
 * Tests for all 30+ formatters including Indian-specific formats
 */

import { describe, test, expect } from '@jest/globals';
import FormatterManager from '../framework/Services/Formatter/FormatterManager.js';

describe('FormatterManager', () => {
  let formatter;

  beforeEach(() => {
    formatter = new FormatterManager({
      locale: 'en-IN',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    });
  });

  describe('Date & Time Formatting', () => {
    test('formats date correctly', () => {
      const date = new Date('2025-12-03T10:30:00Z');
      const result = formatter.date(date);
      expect(result).toContain('2025');
      expect(result).toContain('12');
      expect(result).toContain('03');
    });

    test('formats date with custom format', () => {
      const date = new Date('2025-12-03');
      const result = formatter.date(date, 'YYYY-MM-DD');
      expect(result).toBe('2025-12-03');
    });

    test('formats time correctly', () => {
      const date = new Date('2025-12-03T14:30:00');
      const result = formatter.time(date);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    test('formats datetime correctly', () => {
      const date = new Date('2025-12-03T14:30:00');
      const result = formatter.datetime(date);
      expect(result).toContain('2025');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    test('formats relative time', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
      const result = formatter.relativeTime(fiveMinutesAgo);
      expect(result).toContain('minute');
    });

    test('formats duration', () => {
      expect(formatter.duration(3661)).toBe('1 hour 1 minute');
      expect(formatter.duration(90)).toBe('1 minute 30 seconds');
      expect(formatter.duration(3600)).toBe('1 hour');
    });
  });

  describe('Currency Formatting', () => {
    test('formats INR currency', () => {
      const result = formatter.currency(1000);
      expect(result).toContain('₹');
      expect(result).toContain('1,000');
    });

    test('formats with different currency', () => {
      const result = formatter.currency(1000, 'USD');
      expect(result).toContain('$');
    });

    test('formats Indian number system', () => {
      expect(formatter.indianNumber(1000)).toBe('1,000');
      expect(formatter.indianNumber(100000)).toBe('1,00,000');
      expect(formatter.indianNumber(10000000)).toBe('1,00,00,000');
    });

    test('converts rupees to words', () => {
      expect(formatter.rupeeWords(100)).toContain('One Hundred');
      expect(formatter.rupeeWords(1000)).toContain('One Thousand');
      expect(formatter.rupeeWords(100000)).toContain('One Lakh');
      expect(formatter.rupeeWords(10000000)).toContain('One Crore');
    });

    test('formats short currency', () => {
      expect(formatter.shortCurrency(1000)).toBe('₹1K');
      expect(formatter.shortCurrency(100000)).toBe('₹1L');
      expect(formatter.shortCurrency(10000000)).toBe('₹1Cr');
    });
  });

  describe('Number Formatting', () => {
    test('formats numbers with commas', () => {
      expect(formatter.number(1000)).toBe('1,000');
      expect(formatter.number(1000000)).toBe('10,00,000');
    });

    test('formats with decimals', () => {
      expect(formatter.number(1234.56, 2)).toBe('1,234.56');
    });

    test('formats percentage', () => {
      expect(formatter.percentage(0.5)).toBe('50%');
      expect(formatter.percentage(0.755, 1)).toBe('75.5%');
    });

    test('formats file size', () => {
      expect(formatter.fileSize(1024)).toBe('1 KB');
      expect(formatter.fileSize(1024 * 1024)).toBe('1 MB');
      expect(formatter.fileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatter.fileSize(512)).toBe('512 Bytes');
    });

    test('formats ordinal numbers', () => {
      expect(formatter.ordinal(1)).toBe('1st');
      expect(formatter.ordinal(2)).toBe('2nd');
      expect(formatter.ordinal(3)).toBe('3rd');
      expect(formatter.ordinal(4)).toBe('4th');
      expect(formatter.ordinal(21)).toBe('21st');
    });
  });

  describe('Phone Formatting', () => {
    test('formats phone with spaces', () => {
      const result = formatter.phone('9876543210');
      expect(result).toBe('98765 43210');
    });

    test('formats phone with dashes', () => {
      const result = formatter.phone('9876543210', 'dash');
      expect(result).toBe('98765-43210');
    });

    test('formats phone with groups', () => {
      const result = formatter.phone('9876543210', 'group');
      expect(result).toBe('(987) 654-3210');
    });

    test('handles phone with country code', () => {
      const result = formatter.phone('+919876543210');
      expect(result).toContain('98765');
    });
  });

  describe('Text Formatting', () => {
    test('truncates text', () => {
      const text = 'This is a very long text that needs truncation';
      const result = formatter.truncate(text, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(result).toContain('...');
    });

    test('does not truncate short text', () => {
      const text = 'Short text';
      const result = formatter.truncate(text, 20);
      expect(result).toBe(text);
    });

    test('capitalizes first letter', () => {
      expect(formatter.capitalize('hello world')).toBe('Hello world');
    });

    test('converts to title case', () => {
      expect(formatter.title('hello world')).toBe('Hello World');
    });

    test('converts to snake_case', () => {
      expect(formatter.snake('helloWorld')).toBe('hello_world');
      expect(formatter.snake('HelloWorld')).toBe('hello_world');
    });

    test('converts to kebab-case', () => {
      expect(formatter.kebab('helloWorld')).toBe('hello-world');
      expect(formatter.kebab('HelloWorld')).toBe('hello-world');
    });

    test('converts to camelCase', () => {
      expect(formatter.camel('hello_world')).toBe('helloWorld');
      expect(formatter.camel('hello-world')).toBe('helloWorld');
    });

    test('converts to StudlyCase', () => {
      expect(formatter.studly('hello_world')).toBe('HelloWorld');
      expect(formatter.studly('hello-world')).toBe('HelloWorld');
    });
  });

  describe('Helper Functions', () => {
    test('pluralizes words', () => {
      expect(formatter.plural('cat', 1)).toBe('cat');
      expect(formatter.plural('cat', 2)).toBe('cats');
      expect(formatter.plural('dog', 0)).toBe('dogs');
    });

    test('formats boolean values', () => {
      expect(formatter.boolean(true)).toBe('Yes');
      expect(formatter.boolean(false)).toBe('No');
      expect(formatter.boolean(1)).toBe('Yes');
      expect(formatter.boolean(0)).toBe('No');
    });

    test('formats lists', () => {
      expect(formatter.list(['apple', 'banana'])).toBe('apple and banana');
      expect(formatter.list(['a', 'b', 'c'])).toBe('a, b, and c');
      expect(formatter.list(['single'])).toBe('single');
    });
  });

  describe('Edge Cases', () => {
    test('handles null values', () => {
      expect(formatter.number(null)).toBe('0');
      expect(formatter.currency(null)).toContain('0');
    });

    test('handles undefined values', () => {
      expect(formatter.number(undefined)).toBe('0');
      expect(formatter.currency(undefined)).toContain('0');
    });

    test('handles empty strings', () => {
      expect(formatter.truncate('')).toBe('');
      expect(formatter.capitalize('')).toBe('');
    });

    test('handles negative numbers', () => {
      expect(formatter.number(-1000)).toBe('-1,000');
      expect(formatter.currency(-500)).toContain('-');
    });

    test('handles very large numbers', () => {
      const result = formatter.indianNumber(10000000000);
      expect(result).toContain(',');
    });
  });
});
