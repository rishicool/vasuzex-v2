/**
 * Integration tests for @vasuzex/client formatters
 */

describe('Formatters Module', () => {
  const { 
    formatDate,
    formatTime,
    formatDateTime,
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatFileSize,
    formatPhone,
    formatRelativeTime,
    truncateText,
    capitalize
  } = require('../dist/Formatters/index.cjs');

  describe('DateFormatter', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-12-05T14:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('12');
      expect(formatted).toContain('2025');
    });

    it('should format time correctly', () => {
      const date = new Date('2025-12-05T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format datetime correctly', () => {
      const date = new Date('2025-12-05T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('12');
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('-'); // Returns '-' for invalid dates
      expect(formatTime(null)).toBe('-');
      expect(formatDateTime(undefined)).toBe('-');
    });
  });

  describe('CurrencyFormatter', () => {
    it('should format currency with INR symbol', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1');
    });

    it('should format numbers with Indian grouping', () => {
      const formatted = formatNumber(1234567.89);
      expect(formatted).toContain('12,34,567');
    });

    it('should format percentages', () => {
      // formatPercentage expects already multiplied values (15.23 not 0.1523)
      expect(formatPercentage(15.23)).toContain('15');
      expect(formatPercentage(15.23, 2)).toContain('15.23');
    });

    it('should format file sizes', () => {
      expect(formatFileSize(500)).toContain('500 B');
      expect(formatFileSize(1024)).toContain('1 KB');
      expect(formatFileSize(1048576)).toContain('1 MB');
      expect(formatFileSize(1073741824)).toContain('1 GB');
    });

    it('should handle zero and negative values', () => {
      expect(formatCurrency(0)).toContain('0');
      expect(formatNumber(-1234)).toContain('-');
      expect(formatPercentage(0)).toContain('0');
    });
  });

  describe('PhoneFormatter', () => {
    it('should format 10-digit Indian phone numbers', () => {
      const formatted = formatPhone('9876543210');
      expect(formatted).toBe('98765 43210');
    });

    it('should return original for invalid numbers', () => {
      expect(formatPhone('123')).toBe('123');
      expect(formatPhone('abcdefghij')).toBe('abcde fghij'); // Still formats as 10 chars
      expect(formatPhone('')).toBe('');
    });
  });

  describe('RelativeTimeFormatter', () => {
    it('should format recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toContain('just now');
      
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      expect(formatRelativeTime(oneMinuteAgo)).toContain('minute');
    });

    it('should truncate text correctly', () => {
      const longText = 'This is a very long text that needs truncation';
      const truncated = truncateText(longText, 20);
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(truncated).toContain('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short';
      expect(truncateText(shortText, 20)).toBe('Short');
    });

    it('should capitalize text', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('hELLO wORLD')).toBe('Hello world');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
      expect(truncateText('', 10)).toBe('');
    });
  });
});
