/**
 * DateHelper Tests
 */

import {
  formatDate,
  parseDate,
  addTime,
  subtractTime,
  diffTime,
  isPast,
  isFuture,
  isToday,
  isYesterday,
  isTomorrow,
  isLeapYear,
  startOf,
  endOf,
  timeAgo,
  timeUntil,
  toUTC,
  fromUTC,
  getTimezoneOffset,
  getWeekNumber,
  getQuarter,
  isSameDay,
  isBetween,
  DateHelper,
} from '../../../../framework/Support/Helpers/DateHelper.js';

describe('DateHelper - Functional API', () => {
  describe('formatDate', () => {
    test('formats date with default format', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('formats date with custom format YYYY-MM-DD', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const formatted = formatDate(date, 'YYYY-MM-DD');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('formats date with time tokens', () => {
      const date = new Date(Date.UTC(2025, 11, 5, 15, 30, 45, 123));
      const formatted = formatDate(date, 'HH:mm:ss.SSS');
      expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
    });

    test('formats date with 12-hour format', () => {
      const date = new Date(Date.UTC(2025, 11, 5, 15, 30, 0));
      const formatted = formatDate(date, 'hh:mm A');
      expect(formatted).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    });

    test('formats date with lowercase am/pm', () => {
      const date = new Date(Date.UTC(2025, 11, 5, 9, 30, 0));
      const formatted = formatDate(date, 'h:mm a');
      expect(formatted).toMatch(/^\d{1,2}:\d{2} (am|pm)$/);
    });

    test('formats date with year abbreviation', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const formatted = formatDate(date, 'YY/MM/DD');
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
    });

    test('formats date with single digit tokens', () => {
      const date = new Date('2025-01-05T09:05:03Z');
      const formatted = formatDate(date, 'M/D H:m:s');
      expect(formatted).toMatch(/^\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/);
    });

    test('throws error for invalid date', () => {
      expect(() => formatDate('invalid')).toThrow('Invalid date');
    });

    test('accepts string date', () => {
      const formatted = formatDate('2025-12-05', 'YYYY-MM-DD');
      expect(formatted).toBe('2025-12-05');
    });

    test('accepts timestamp', () => {
      const timestamp = Date.now();
      const formatted = formatDate(timestamp, 'YYYY');
      expect(formatted).toMatch(/^\d{4}$/);
    });
  });

  describe('parseDate', () => {
    test('parses date string without format', () => {
      const date = parseDate('2025-12-05T15:30:45Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2025);
    });

    test('parses date string with format', () => {
      const date = parseDate('2025-12-05', 'YYYY-MM-DD');
      expect(date).toBeInstanceOf(Date);
    });

    test('returns invalid date for invalid string', () => {
      const date = parseDate('invalid');
      expect(isNaN(date.getTime())).toBe(true);
    });
  });

  describe('addTime', () => {
    test('adds days by default', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = addTime(date, 5);
      expect(result.getDate()).toBe(10);
    });

    test('adds years', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = addTime(date, 2, 'years');
      expect(result.getFullYear()).toBe(2027);
    });

    test('adds months', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = addTime(date, 3, 'months');
      expect(result.getMonth()).toBe(2); // March (0-indexed)
    });

    test('adds weeks', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = addTime(date, 2, 'weeks');
      expect(result.getDate()).toBe(19);
    });

    test('adds hours', () => {
      const date = new Date('2025-12-05T10:00:00Z');
      const result = addTime(date, 5, 'hours');
      // Timezone conversion may occur, check difference instead
      const diff = Math.abs(result.getTime() - date.getTime());
      expect(diff).toBe(5 * 60 * 60 * 1000); // 5 hours in milliseconds
    });

    test('adds minutes', () => {
      const date = new Date('2025-12-05T10:30:00Z');
      const result = addTime(date, 45, 'minutes');
      // Check time difference instead of specific hour/minute
      const diff = result.getTime() - date.getTime();
      expect(diff).toBe(45 * 60 * 1000); // 45 minutes in milliseconds
    });

    test('adds seconds', () => {
      const date = new Date('2025-12-05T10:30:30Z');
      const result = addTime(date, 45, 'seconds');
      expect(result.getSeconds()).toBe(15);
    });

    test('adds milliseconds', () => {
      const date = new Date('2025-12-05T10:30:30.500Z');
      const result = addTime(date, 750, 'milliseconds');
      expect(result.getMilliseconds()).toBe(250);
    });

    test('throws error for invalid unit', () => {
      const date = new Date();
      expect(() => addTime(date, 5, 'invalid')).toThrow('Invalid unit: invalid');
    });

    test('accepts string date', () => {
      const result = addTime('2025-12-05', 1, 'days');
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(6);
    });
  });

  describe('subtractTime', () => {
    test('subtracts days by default', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = subtractTime(date, 3);
      expect(result.getDate()).toBe(2);
    });

    test('subtracts years', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = subtractTime(date, 2, 'years');
      expect(result.getFullYear()).toBe(2023);
    });

    test('subtracts months', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const result = subtractTime(date, 2, 'months');
      expect(result.getMonth()).toBe(9); // October
    });

    test('subtracts hours', () => {
      const date = new Date('2025-12-05T10:00:00Z');
      const result = subtractTime(date, 3, 'hours');
      // Check time difference instead
      const diff = date.getTime() - result.getTime();
      expect(diff).toBe(3 * 60 * 60 * 1000); // 3 hours in milliseconds
    });
  });

  describe('diffTime', () => {
    test('calculates difference in milliseconds by default', () => {
      const date1 = new Date('2025-12-05T10:00:00Z');
      const date2 = new Date('2025-12-05T10:00:00Z');
      const diff = diffTime(date1, date2);
      expect(diff).toBe(0);
    });

    test('calculates difference in days', () => {
      const date1 = new Date('2025-12-10T00:00:00Z');
      const date2 = new Date('2025-12-05T00:00:00Z');
      const diff = diffTime(date1, date2, 'days');
      expect(diff).toBeCloseTo(5, 0);
    });

    test('calculates difference in hours', () => {
      const date1 = new Date('2025-12-05T15:00:00Z');
      const date2 = new Date('2025-12-05T10:00:00Z');
      const diff = diffTime(date1, date2, 'hours');
      expect(diff).toBe(5);
    });

    test('calculates difference in minutes', () => {
      const date1 = new Date('2025-12-05T10:30:00Z');
      const date2 = new Date('2025-12-05T10:00:00Z');
      const diff = diffTime(date1, date2, 'minutes');
      expect(diff).toBe(30);
    });

    test('calculates difference in seconds', () => {
      const date1 = new Date('2025-12-05T10:00:45Z');
      const date2 = new Date('2025-12-05T10:00:00Z');
      const diff = diffTime(date1, date2, 'seconds');
      expect(diff).toBe(45);
    });

    test('calculates difference in weeks', () => {
      const date1 = new Date('2025-12-19T00:00:00Z');
      const date2 = new Date('2025-12-05T00:00:00Z');
      const diff = diffTime(date1, date2, 'weeks');
      expect(diff).toBeCloseTo(2, 0);
    });

    test('calculates difference in months', () => {
      const date1 = new Date('2025-12-05T00:00:00Z');
      const date2 = new Date('2025-10-05T00:00:00Z');
      const diff = diffTime(date1, date2, 'months');
      expect(diff).toBeGreaterThan(1.9);
    });

    test('calculates difference in years', () => {
      const date1 = new Date('2025-12-05T00:00:00Z');
      const date2 = new Date('2023-12-05T00:00:00Z');
      const diff = diffTime(date1, date2, 'years');
      expect(diff).toBeCloseTo(2, 0);
    });

    test('throws error for invalid unit', () => {
      const date1 = new Date();
      const date2 = new Date();
      expect(() => diffTime(date1, date2, 'invalid')).toThrow('Invalid unit: invalid');
    });

    test('returns negative for past dates', () => {
      const date1 = new Date('2025-12-05T00:00:00Z');
      const date2 = new Date('2025-12-10T00:00:00Z');
      const diff = diffTime(date1, date2, 'days');
      expect(diff).toBeLessThan(0);
    });
  });

  describe('isPast', () => {
    test('returns true for past date', () => {
      const date = new Date('2020-01-01T00:00:00Z');
      expect(isPast(date)).toBe(true);
    });

    test('returns false for future date', () => {
      const date = new Date('2030-01-01T00:00:00Z');
      expect(isPast(date)).toBe(false);
    });

    test('accepts string date', () => {
      expect(isPast('2020-01-01')).toBe(true);
    });
  });

  describe('isFuture', () => {
    test('returns true for future date', () => {
      const date = new Date('2030-01-01T00:00:00Z');
      expect(isFuture(date)).toBe(true);
    });

    test('returns false for past date', () => {
      const date = new Date('2020-01-01T00:00:00Z');
      expect(isFuture(date)).toBe(false);
    });

    test('accepts string date', () => {
      expect(isFuture('2030-01-01')).toBe(true);
    });
  });

  describe('isToday', () => {
    test('returns true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    test('returns false for yesterday', () => {
      const yesterday = subtractTime(new Date(), 1, 'days');
      expect(isToday(yesterday)).toBe(false);
    });

    test('returns false for tomorrow', () => {
      const tomorrow = addTime(new Date(), 1, 'days');
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    test('returns true for yesterday', () => {
      const yesterday = subtractTime(new Date(), 1, 'days');
      expect(isYesterday(yesterday)).toBe(true);
    });

    test('returns false for today', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });

    test('returns false for two days ago', () => {
      const twoDaysAgo = subtractTime(new Date(), 2, 'days');
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    test('returns true for tomorrow', () => {
      const tomorrow = addTime(new Date(), 1, 'days');
      expect(isTomorrow(tomorrow)).toBe(true);
    });

    test('returns false for today', () => {
      const today = new Date();
      expect(isTomorrow(today)).toBe(false);
    });

    test('returns false for two days from now', () => {
      const twoDays = addTime(new Date(), 2, 'days');
      expect(isTomorrow(twoDays)).toBe(false);
    });
  });

  describe('isLeapYear', () => {
    test('returns true for leap year divisible by 400', () => {
      expect(isLeapYear(2000)).toBe(true);
    });

    test('returns true for leap year divisible by 4 but not 100', () => {
      expect(isLeapYear(2024)).toBe(true);
    });

    test('returns false for year divisible by 100 but not 400', () => {
      expect(isLeapYear(1900)).toBe(false);
    });

    test('returns false for non-leap year', () => {
      expect(isLeapYear(2023)).toBe(false);
    });
  });

  describe('startOf', () => {
    test('gets start of day', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = startOf(date, 'day');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test('gets start of week', () => {
      const date = new Date('2025-12-05T15:30:45Z'); // Friday
      const result = startOf(date, 'week');
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(0);
    });

    test('gets start of month', () => {
      const date = new Date('2025-12-15T15:30:45Z');
      const result = startOf(date, 'month');
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
    });

    test('gets start of year', () => {
      const date = new Date('2025-06-15T15:30:45Z');
      const result = startOf(date, 'year');
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
    });

    test('gets start of hour', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = startOf(date, 'hour');
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test('gets start of minute', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = startOf(date, 'minute');
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test('gets start of second', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = startOf(date, 'second');
      expect(result.getMilliseconds()).toBe(0);
    });

    test('throws error for invalid period', () => {
      const date = new Date();
      expect(() => startOf(date, 'invalid')).toThrow('Invalid period: invalid');
    });
  });

  describe('endOf', () => {
    test('gets end of day', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = endOf(date, 'day');
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test('gets end of week', () => {
      const date = new Date('2025-12-05T15:30:45Z'); // Friday
      const result = endOf(date, 'week');
      expect(result.getDay()).toBe(6); // Saturday
      expect(result.getHours()).toBe(23);
    });

    test('gets end of month', () => {
      const date = new Date('2025-12-05T15:30:45Z');
      const result = endOf(date, 'month');
      expect(result.getDate()).toBe(31); // December has 31 days
      expect(result.getHours()).toBe(23);
    });

    test('gets end of year', () => {
      const date = new Date('2025-06-15T15:30:45Z');
      const result = endOf(date, 'year');
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
      expect(result.getHours()).toBe(23);
    });

    test('gets end of hour', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = endOf(date, 'hour');
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test('gets end of minute', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = endOf(date, 'minute');
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test('gets end of second', () => {
      const date = new Date('2025-12-05T15:30:45.123Z');
      const result = endOf(date, 'second');
      expect(result.getMilliseconds()).toBe(999);
    });

    test('throws error for invalid period', () => {
      const date = new Date();
      expect(() => endOf(date, 'invalid')).toThrow('Invalid period: invalid');
    });
  });

  describe('timeAgo', () => {
    test('returns "just now" for very recent date', () => {
      const date = new Date();
      expect(timeAgo(date)).toBe('just now');
    });

    test('returns seconds ago', () => {
      const date = subtractTime(new Date(), 30, 'seconds');
      expect(timeAgo(date)).toBe('30 seconds ago');
    });

    test('returns 1 second ago for singular', () => {
      const date = subtractTime(new Date(), 1, 'seconds');
      expect(timeAgo(date)).toBe('1 second ago');
    });

    test('returns minutes ago', () => {
      const date = subtractTime(new Date(), 5, 'minutes');
      expect(timeAgo(date)).toBe('5 minutes ago');
    });

    test('returns hours ago', () => {
      const date = subtractTime(new Date(), 3, 'hours');
      expect(timeAgo(date)).toBe('3 hours ago');
    });

    test('returns days ago', () => {
      const date = subtractTime(new Date(), 2, 'days');
      expect(timeAgo(date)).toBe('2 days ago');
    });

    test('returns weeks ago', () => {
      const date = subtractTime(new Date(), 14, 'days');
      expect(timeAgo(date)).toMatch(/weeks? ago/);
    });

    test('returns months ago', () => {
      const date = subtractTime(new Date(), 60, 'days');
      expect(timeAgo(date)).toMatch(/months? ago/);
    });

    test('returns years ago', () => {
      const date = subtractTime(new Date(), 400, 'days');
      expect(timeAgo(date)).toMatch(/years? ago/);
    });
  });

  describe('timeUntil', () => {
    test('returns "already passed" for past date', () => {
      const date = subtractTime(new Date(), 1, 'hours');
      expect(timeUntil(date)).toBe('already passed');
    });

    test('returns "in a moment" for very near future', () => {
      const date = addTime(new Date(), 1, 'seconds');
      const result = timeUntil(date);
      expect(result === 'in a moment' || result === 'in 1 second').toBe(true);
    });

    test('returns in seconds', () => {
      const date = addTime(new Date(), 30, 'seconds');
      expect(timeUntil(date)).toBe('in 30 seconds');
    });

    test('returns in 1 second for singular', () => {
      const date = addTime(new Date(), 2, 'seconds');
      expect(timeUntil(date)).toMatch(/^in \d+ seconds?$/);
    });

    test('returns in minutes', () => {
      const date = addTime(new Date(), 5, 'minutes');
      expect(timeUntil(date)).toBe('in 5 minutes');
    });

    test('returns in hours', () => {
      const date = addTime(new Date(), 3, 'hours');
      expect(timeUntil(date)).toBe('in 3 hours');
    });

    test('returns in days', () => {
      const date = addTime(new Date(), 2, 'days');
      expect(timeUntil(date)).toBe('in 2 days');
    });

    test('returns in weeks', () => {
      const date = addTime(new Date(), 14, 'days');
      expect(timeUntil(date)).toMatch(/^in \d+ weeks?$/);
    });
  });

  describe('getTimezoneOffset', () => {
    test('returns timezone offset in hours', () => {
      const offset = getTimezoneOffset();
      expect(typeof offset).toBe('number');
    });

    test('accepts date parameter', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const offset = getTimezoneOffset(date);
      expect(typeof offset).toBe('number');
    });
  });

  describe('toUTC', () => {
    test('converts date to UTC', () => {
      const date = new Date('2025-12-05T15:30:45');
      const utc = toUTC(date);
      expect(utc).toBeInstanceOf(Date);
    });
  });

  describe('fromUTC', () => {
    test('converts UTC date to local', () => {
      const date = new Date('2025-12-05T15:30:45Z');
      const local = fromUTC(date);
      expect(local).toBeInstanceOf(Date);
    });
  });

  describe('getWeekNumber', () => {
    test('returns week number', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const week = getWeekNumber(date);
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });
  });

  describe('getQuarter', () => {
    test('returns Q1 for January', () => {
      const date = new Date('2025-01-15T00:00:00Z');
      expect(getQuarter(date)).toBe(1);
    });

    test('returns Q2 for April', () => {
      const date = new Date('2025-04-15T00:00:00Z');
      expect(getQuarter(date)).toBe(2);
    });

    test('returns Q3 for July', () => {
      const date = new Date('2025-07-15T00:00:00Z');
      expect(getQuarter(date)).toBe(3);
    });

    test('returns Q4 for December', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      expect(getQuarter(date)).toBe(4);
    });
  });

  describe('isSameDay', () => {
    test('returns true for same day', () => {
      const date1 = new Date('2025-12-05T10:00:00Z');
      const date2 = new Date('2025-12-05T15:00:00Z');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    test('returns false for different days', () => {
      const date1 = new Date('2025-12-05T10:00:00Z');
      const date2 = new Date('2025-12-06T10:00:00Z');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isBetween', () => {
    test('returns true for date between range (inclusive)', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const start = new Date('2025-12-01T00:00:00Z');
      const end = new Date('2025-12-10T00:00:00Z');
      expect(isBetween(date, start, end, true)).toBe(true);
    });

    test('returns true for date at start (inclusive)', () => {
      const date = new Date('2025-12-01T00:00:00Z');
      const start = new Date('2025-12-01T00:00:00Z');
      const end = new Date('2025-12-10T00:00:00Z');
      expect(isBetween(date, start, end, true)).toBe(true);
    });

    test('returns false for date at start (exclusive)', () => {
      const date = new Date('2025-12-01T00:00:00Z');
      const start = new Date('2025-12-01T00:00:00Z');
      const end = new Date('2025-12-10T00:00:00Z');
      expect(isBetween(date, start, end, false)).toBe(false);
    });

    test('returns false for date outside range', () => {
      const date = new Date('2025-12-15T00:00:00Z');
      const start = new Date('2025-12-01T00:00:00Z');
      const end = new Date('2025-12-10T00:00:00Z');
      expect(isBetween(date, start, end, true)).toBe(false);
    });
  });
});

describe('DateHelper - Class API', () => {
  describe('constructor', () => {
    test('creates instance with current date by default', () => {
      const helper = new DateHelper();
      expect(helper.date).toBeInstanceOf(Date);
    });

    test('creates instance with provided date', () => {
      const date = new Date('2025-12-05T00:00:00Z');
      const helper = new DateHelper(date);
      expect(helper.date.getTime()).toBe(date.getTime());
    });

    test('creates instance with string date', () => {
      const helper = new DateHelper('2025-12-05');
      expect(helper.date).toBeInstanceOf(Date);
    });
  });

  describe('fluent API', () => {
    test('chains add operations', () => {
      const helper = new DateHelper('2025-12-05T00:00:00Z');
      const result = helper.add(5, 'days').add(2, 'hours');
      expect(result).toBeInstanceOf(DateHelper);
      expect(result.date.getDate()).toBe(10);
    });

    test('chains subtract operations', () => {
      const helper = new DateHelper('2025-12-05T00:00:00Z');
      const result = helper.subtract(2, 'days').subtract(3, 'hours');
      expect(result).toBeInstanceOf(DateHelper);
      expect(result.date.getDate()).toBe(3);
    });

    test('chains startOf operations', () => {
      const helper = new DateHelper('2025-12-05T15:30:45Z');
      const result = helper.startOf('day');
      expect(result).toBeInstanceOf(DateHelper);
      expect(result.date.getHours()).toBe(0);
    });

    test('chains endOf operations', () => {
      const helper = new DateHelper('2025-12-05T15:30:45Z');
      const result = helper.endOf('day');
      expect(result).toBeInstanceOf(DateHelper);
      expect(result.date.getHours()).toBe(23);
    });
  });

  describe('format method', () => {
    test('formats date', () => {
      const helper = new DateHelper('2025-12-05T00:00:00Z');
      const formatted = helper.format('YYYY-MM-DD');
      expect(formatted).toBe('2025-12-05');
    });
  });

  describe('diff method', () => {
    test('calculates difference from another date', () => {
      const helper = new DateHelper('2025-12-10T00:00:00Z');
      const other = new Date('2025-12-05T00:00:00Z');
      const diff = helper.diff(other, 'days');
      expect(diff).toBeCloseTo(5, 0);
    });
  });

  describe('comparison methods', () => {
    test('isPast returns correct value', () => {
      const pastHelper = new DateHelper('2020-01-01T00:00:00Z');
      expect(pastHelper.isPast()).toBe(true);
      
      const futureHelper = new DateHelper('2030-01-01T00:00:00Z');
      expect(futureHelper.isPast()).toBe(false);
    });

    test('isFuture returns correct value', () => {
      const futureHelper = new DateHelper('2030-01-01T00:00:00Z');
      expect(futureHelper.isFuture()).toBe(true);
      
      const pastHelper = new DateHelper('2020-01-01T00:00:00Z');
      expect(pastHelper.isFuture()).toBe(false);
    });

    test('isToday returns correct value', () => {
      const todayHelper = new DateHelper();
      expect(todayHelper.isToday()).toBe(true);
    });
  });

  describe('toDate method', () => {
    test('returns native Date object', () => {
      const helper = new DateHelper('2025-12-05T00:00:00Z');
      const date = helper.toDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(helper.date.getTime());
    });
  });

  describe('clone method', () => {
    test('creates independent copy', () => {
      const helper = new DateHelper('2025-12-05T00:00:00Z');
      const clone = helper.clone();
      
      expect(clone).toBeInstanceOf(DateHelper);
      expect(clone.date.getTime()).toBe(helper.date.getTime());
      
      clone.add(1, 'days');
      expect(clone.date.getTime()).not.toBe(helper.date.getTime());
    });
  });
});
