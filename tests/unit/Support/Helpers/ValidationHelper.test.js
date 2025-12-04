/**
 * ValidationHelper Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  isValidEmail,
  isValidUUID,
  isValidObjectId,
  isValidPhone,
  isValidIndianPhone,
  validatePassword,
  isValidURL,
  isValidIP,
  isValidCreditCard,
  isValidDate,
  isAlphanumeric,
  isNumeric,
  hasValidLength,
  ValidationHelper,
} from '../../../../framework/Support/Helpers/ValidationHelper.js';

describe('ValidationHelper', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should validate UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should validate UUID v4', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000', 4)).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidUUID(null)).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidObjectId', () => {
    it('should validate MongoDB ObjectIds', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('507f191e810c19729de860ea')).toBe(true);
    });

    it('should reject invalid ObjectIds', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd799439')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate international phone numbers', () => {
      expect(isValidPhone('+14155552671')).toBe(true);
      expect(isValidPhone('+442071838750')).toBe(true);
      expect(isValidPhone('+919876543210')).toBe(true);
    });

    it('should handle phone with formatting', () => {
      expect(isValidPhone('+1 (415) 555-2671')).toBe(true);
      expect(isValidPhone('+44 20 7183 8750')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('+1')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidPhone(null)).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidIndianPhone', () => {
    it('should validate Indian phone numbers', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('+919876543210')).toBe(true);
      expect(isValidIndianPhone('919876543210')).toBe(true);
      expect(isValidIndianPhone('09876543210')).toBe(true);
    });

    it('should handle formatting', () => {
      expect(isValidIndianPhone('+91 98765 43210')).toBe(true);
      expect(isValidIndianPhone('(+91) 9876543210')).toBe(true);
    });

    it('should reject invalid Indian numbers', () => {
      expect(isValidIndianPhone('1234567890')).toBe(false); // Doesn't start with 6-9
      expect(isValidIndianPhone('98765')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBeGreaterThan(0);
    });

    it('should enforce minimum length', () => {
      const result = validatePassword('Abc1', { minLength: 8 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should enforce uppercase requirement', () => {
      const result = validatePassword('password123', { requireUppercase: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should enforce lowercase requirement', () => {
      const result = validatePassword('PASSWORD123', { requireLowercase: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should enforce number requirement', () => {
      const result = validatePassword('PasswordAbc', { requireNumbers: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should enforce special character requirement', () => {
      const result = validatePassword('Password123', { requireSpecialChars: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should handle edge cases', () => {
      const result = validatePassword(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('isValidURL', () => {
    it('should validate URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
      expect(isValidURL('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidURL(null)).toBe(false);
      expect(isValidURL('')).toBe(false);
    });
  });

  describe('isValidIP', () => {
    it('should validate IPv4 addresses', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1', 4)).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
    });

    it('should validate IPv6 addresses', () => {
      expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(isValidIP('::1', 6)).toBe(true);
      expect(isValidIP('fe80::1', 6)).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(isValidIP('256.1.1.1')).toBe(false);
      expect(isValidIP('192.168.1')).toBe(false);
      expect(isValidIP('invalid')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidIP(null)).toBe(false);
      expect(isValidIP('')).toBe(false);
    });
  });

  describe('isValidCreditCard', () => {
    it('should validate credit card numbers using Luhn algorithm', () => {
      expect(isValidCreditCard('4532015112830366')).toBe(true);
      expect(isValidCreditCard('6011514433546201')).toBe(true);
      expect(isValidCreditCard('4532-0151-1283-0366')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(isValidCreditCard('1234567890123456')).toBe(false);
      expect(isValidCreditCard('4532015112830367')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidCreditCard(null)).toBe(false);
      expect(isValidCreditCard('')).toBe(false);
      expect(isValidCreditCard('123')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate date strings', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-01-15T10:30:00Z')).toBe(true);
      expect(isValidDate(new Date().toISOString())).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('should validate alphanumeric strings', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
      expect(isAlphanumeric('ABC')).toBe(true);
      expect(isAlphanumeric('123')).toBe(true);
    });

    it('should reject non-alphanumeric strings', () => {
      expect(isAlphanumeric('abc-123')).toBe(false);
      expect(isAlphanumeric('hello world')).toBe(false);
      expect(isAlphanumeric('test@123')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isAlphanumeric(null)).toBe(false);
      expect(isAlphanumeric('')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('should validate numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('123.45')).toBe(true);
      expect(isNumeric('-123')).toBe(true);
      expect(isNumeric(123)).toBe(true);
    });

    it('should reject non-numeric strings', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric('12a3')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric('')).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
    });
  });

  describe('hasValidLength', () => {
    it('should validate string length', () => {
      expect(hasValidLength('hello', 1, 10)).toBe(true);
      expect(hasValidLength('test', 4, 4)).toBe(true);
      expect(hasValidLength('a', 1)).toBe(true);
    });

    it('should reject invalid lengths', () => {
      expect(hasValidLength('hi', 5, 10)).toBe(false);
      expect(hasValidLength('toolong', 1, 5)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(hasValidLength(null, 1, 10)).toBe(false);
      expect(hasValidLength('', 1, 10)).toBe(false);
    });
  });

  describe('ValidationHelper class', () => {
    it('should provide static methods', () => {
      expect(ValidationHelper.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationHelper.isValidPhone('+14155552671')).toBe(true);
      expect(ValidationHelper.isAlphanumeric('abc123')).toBe(true);
    });
  });
});
