/**
 * Test that the build output works correctly
 */

describe('Build Output', () => {
  it('should export createApiClient from main bundle', () => {
    const { createApiClient } = require('../dist/index.cjs');
    expect(typeof createApiClient).toBe('function');
  });

  it('should export formatDate from Formatters', () => {
    const { formatDate } = require('../dist/Formatters/index.cjs');
    expect(typeof formatDate).toBe('function');
  });

  it('should export storage from Storage', () => {
    const { storage } = require('../dist/Storage/index.cjs');
    expect(typeof storage).toBe('object');
    expect(typeof storage.get).toBe('function');
  });

  it('should export validators from Validation', () => {
    const { validators } = require('../dist/Validation/index.cjs');
    expect(typeof validators).toBe('object');
    expect(typeof validators.email).toBe('function');
  });

  it('should formatDate correctly', () => {
    const { formatDate } = require('../dist/Formatters/index.cjs');
    const date = new Date('2025-12-05');
    const formatted = formatDate(date);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('12');
    expect(formatted).toContain('2025');
  });

  it('should validate email correctly', () => {
    const { validators } = require('../dist/Validation/index.cjs');
    expect(validators.email('test@example.com')).toBe(true);
    expect(validators.email('invalid-email')).toBe(false);
    expect(validators.email('')).toBe(false);
  });

  it('should validate phone correctly', () => {
    const { validators } = require('../dist/Validation/index.cjs');
    expect(validators.phone('9876543210')).toBe(true);
    expect(validators.phone('123')).toBe(false);
  });

  it('should format currency correctly', () => {
    const { formatCurrency } = require('../dist/Formatters/index.cjs');
    const formatted = formatCurrency(1234.56);
    expect(formatted).toContain('1');
    expect(formatted).toContain('235'); // Rounds to ₹1,235
  });
});
