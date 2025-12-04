/**
 * SanitizationHelper Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  escapeHTML,
  unescapeHTML,
  sanitizeFilename,
  sanitizeURL,
  stripHTML,
  sanitizeSQL,
  sanitizeObject,
  removeNullBytes,
  normalizeWhitespace,
  slugify,
  removeWhitespace,
  sanitizeJSON,
  SanitizationHelper,
} from '../../../../framework/Support/Helpers/SanitizationHelper.js';

describe('SanitizationHelper', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags by default', () => {
      expect(sanitizeString('<script>alert("xss")</script>hello')).toBe('hello');
      expect(sanitizeString('<p>Test</p>')).toBe('Test');
    });

    it('should preserve HTML if allowed', () => {
      expect(sanitizeString('<p>Test</p>', { allowHTML: true })).toBe('<p>Test</p>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should convert case', () => {
      expect(sanitizeString('Hello', { lowercase: true })).toBe('hello');
      expect(sanitizeString('hello', { uppercase: true })).toBe('HELLO');
    });

    it('should remove special characters if requested', () => {
      expect(sanitizeString('hello@world!', { removeSpecialChars: true })).toBe('helloworld');
    });

    it('should handle edge cases', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should sanitize email addresses', () => {
      expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail('user @ domain.com')).toBe('user@domain.com');
    });

    it('should handle edge cases', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail('')).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('should remove non-numeric characters except +', () => {
      expect(sanitizePhone('+1 (415) 555-2671')).toBe('+14155552671');
      expect(sanitizePhone('(555) 123-4567')).toBe('5551234567');
    });

    it('should remove country code if requested', () => {
      expect(sanitizePhone('+14155552671', { keepCountryCode: false })).toBe('14155552671');
    });

    it('should handle edge cases', () => {
      expect(sanitizePhone(null)).toBe('');
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHTML('&')).toBe('&amp;');
      expect(escapeHTML('"')).toBe('&quot;');
      expect(escapeHTML("'")).toBe('&#x27;');
    });

    it('should handle edge cases', () => {
      expect(escapeHTML(null)).toBe('');
      expect(escapeHTML('')).toBe('');
    });
  });

  describe('unescapeHTML', () => {
    it('should unescape HTML entities', () => {
      expect(unescapeHTML('&lt;div&gt;')).toBe('<div>');
      expect(unescapeHTML('&amp;')).toBe('&');
      expect(unescapeHTML('&quot;')).toBe('"');
    });

    it('should handle edge cases', () => {
      expect(unescapeHTML(null)).toBe('');
      expect(unescapeHTML('')).toBe('');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filenames', () => {
      expect(sanitizeFilename('my file.txt')).toBe('my_file.txt');
      expect(sanitizeFilename('test/file\\name.pdf')).toBe('test_file_name.pdf');
      expect(sanitizeFilename('___test___.txt')).toBe('test.txt'); // Leading underscores removed
    });

    it('should handle consecutive underscores', () => {
      expect(sanitizeFilename('my___file.txt')).toBe('my_file.txt');
    });

    it('should handle edge cases', () => {
      expect(sanitizeFilename(null)).toBe('');
      expect(sanitizeFilename('')).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('should sanitize valid URLs', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
      expect(sanitizeURL('http://localhost:3000/path')).toBe('http://localhost:3000/path');
    });

    it('should return empty string for invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBe('');
      expect(sanitizeURL('javascript:alert(1)')).toBe('');
    });

    it('should handle edge cases', () => {
      expect(sanitizeURL(null)).toBe('');
      expect(sanitizeURL('')).toBe('');
    });
  });

  describe('stripHTML', () => {
    it('should remove all HTML tags', () => {
      expect(stripHTML('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
      expect(stripHTML('<div>Test</div>')).toBe('Test');
    });

    it('should decode HTML entities', () => {
      expect(stripHTML('&nbsp;Test&nbsp;')).toBe('Test');
      expect(stripHTML('&lt;div&gt;')).toBe('<div>');
    });

    it('should handle edge cases', () => {
      expect(stripHTML(null)).toBe('');
      expect(stripHTML('')).toBe('');
    });
  });

  describe('sanitizeSQL', () => {
    it('should escape SQL special characters', () => {
      expect(sanitizeSQL("O'Brien")).toBe("O''Brien");
    });

    it('should remove dangerous SQL patterns', () => {
      expect(sanitizeSQL('DROP TABLE users;')).toBe('DROP TABLE users');
      expect(sanitizeSQL('SELECT * FROM users -- comment')).toBe('SELECT * FROM users  comment');
    });

    it('should handle edge cases', () => {
      expect(sanitizeSQL(null)).toBe('');
      expect(sanitizeSQL('')).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values in objects', () => {
      const input = {
        name: '<script>XSS</script>',  // This will be removed to empty string
        email: '  test@example.com  ',
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe(''); // Script tags removed completely
      expect(result.email).toBe('test@example.com');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '  John  ',
          address: {
            city: '  NYC  ',
          },
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe('John');
      expect(result.user.address.city).toBe('NYC');
    });

    it('should handle arrays', () => {
      const input = ['  test  ', '  hello  '];
      const result = sanitizeObject(input);
      expect(result).toEqual(['test', 'hello']);
    });

    it('should preserve non-string values', () => {
      const input = {
        name: '  John  ',
        age: 30,
        active: true,
      };
      const result = sanitizeObject(input);
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(sanitizeObject(null)).toBe(null);
      expect(sanitizeObject(undefined)).toBe(undefined);
    });
  });

  describe('removeNullBytes', () => {
    it('should remove null bytes', () => {
      expect(removeNullBytes('hello\0world')).toBe('helloworld');
      expect(removeNullBytes('test\0\0test')).toBe('testtest');
    });

    it('should handle edge cases', () => {
      expect(removeNullBytes(null)).toBe('');
      expect(removeNullBytes('')).toBe('');
    });
  });

  describe('normalizeWhitespace', () => {
    it('should normalize whitespace', () => {
      expect(normalizeWhitespace('hello   world')).toBe('hello world');
      expect(normalizeWhitespace('  test  \n  test  ')).toBe('test test');
    });

    it('should handle edge cases', () => {
      expect(normalizeWhitespace(null)).toBe('');
      expect(normalizeWhitespace('')).toBe('');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('This is a TEST')).toBe('this-is-a-test');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello @World!')).toBe('hello-world');
      expect(slugify('Test & Demo')).toBe('test-demo');
    });

    it('should handle multiple spaces and dashes', () => {
      expect(slugify('hello   world')).toBe('hello-world');
      expect(slugify('test--slug')).toBe('test-slug');
    });

    it('should handle edge cases', () => {
      expect(slugify(null)).toBe('');
      expect(slugify('')).toBe('');
    });
  });

  describe('removeWhitespace', () => {
    it('should remove all whitespace', () => {
      expect(removeWhitespace('hello world')).toBe('helloworld');
      expect(removeWhitespace('  test  \n  test  ')).toBe('testtest');
    });

    it('should handle edge cases', () => {
      expect(removeWhitespace(null)).toBe('');
      expect(removeWhitespace('')).toBe('');
    });
  });

  describe('sanitizeJSON', () => {
    it('should sanitize valid JSON strings', () => {
      const json = '{"name":"test","value":123}';
      expect(sanitizeJSON(json)).toBe(json);
    });

    it('should return empty string for invalid JSON', () => {
      expect(sanitizeJSON('{invalid}')).toBe('');
      expect(sanitizeJSON('not json')).toBe('');
    });

    it('should handle edge cases', () => {
      expect(sanitizeJSON(null)).toBe('');
      expect(sanitizeJSON('')).toBe('');
    });
  });

  describe('SanitizationHelper class', () => {
    it('should provide static methods', () => {
      expect(SanitizationHelper.sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(SanitizationHelper.slugify('Hello World')).toBe('hello-world');
      expect(SanitizationHelper.escapeHTML('<div>')).toBe('&lt;div&gt;');
    });
  });
});
