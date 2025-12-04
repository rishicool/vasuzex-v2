/**
 * DateHelper - Date and time utilities
 * 
 * Provides comprehensive date manipulation and formatting functions.
 */

/**
 * Format date to string
 * 
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  const tokens = {
    YYYY: d.getFullYear(),
    YY: String(d.getFullYear()).slice(-2),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    M: d.getMonth() + 1,
    DD: String(d.getDate()).padStart(2, '0'),
    D: d.getDate(),
    HH: String(d.getHours()).padStart(2, '0'),
    H: d.getHours(),
    hh: String(d.getHours() % 12 || 12).padStart(2, '0'),
    h: d.getHours() % 12 || 12,
    mm: String(d.getMinutes()).padStart(2, '0'),
    m: d.getMinutes(),
    ss: String(d.getSeconds()).padStart(2, '0'),
    s: d.getSeconds(),
    SSS: String(d.getMilliseconds()).padStart(3, '0'),
    A: d.getHours() >= 12 ? 'PM' : 'AM',
    a: d.getHours() >= 12 ? 'pm' : 'am',
  };

  let formatted = format;
  
  for (const [token, value] of Object.entries(tokens)) {
    formatted = formatted.replace(new RegExp(token, 'g'), value);
  }

  return formatted;
}

/**
 * Parse date string
 * 
 * @param {string} dateString - Date string
 * @param {string} format - Format string (optional)
 * @returns {Date} Parsed date
 */
export function parseDate(dateString, format = null) {
  if (format) {
    // Simple format parsing (extend as needed)
    return new Date(dateString);
  }
  
  return new Date(dateString);
}

/**
 * Add time to date
 * 
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Time unit
 * @returns {Date} New date
 */
export function addTime(date, amount, unit = 'days') {
  const d = new Date(date);
  
  switch (unit) {
    case 'years':
      d.setFullYear(d.getFullYear() + amount);
      break;
    case 'months':
      d.setMonth(d.getMonth() + amount);
      break;
    case 'weeks':
      d.setDate(d.getDate() + amount * 7);
      break;
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'milliseconds':
      d.setMilliseconds(d.getMilliseconds() + amount);
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }
  
  return d;
}

/**
 * Subtract time from date
 * 
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Time unit
 * @returns {Date} New date
 */
export function subtractTime(date, amount, unit = 'days') {
  return addTime(date, -amount, unit);
}

/**
 * Get difference between dates
 * 
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @param {string} unit - Time unit
 * @returns {number} Difference
 */
export function diffTime(date1, date2, unit = 'milliseconds') {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d1.getTime() - d2.getTime();
  
  switch (unit) {
    case 'years':
      return diff / (1000 * 60 * 60 * 24 * 365.25);
    case 'months':
      return diff / (1000 * 60 * 60 * 24 * 30.44);
    case 'weeks':
      return diff / (1000 * 60 * 60 * 24 * 7);
    case 'days':
      return diff / (1000 * 60 * 60 * 24);
    case 'hours':
      return diff / (1000 * 60 * 60);
    case 'minutes':
      return diff / (1000 * 60);
    case 'seconds':
      return diff / 1000;
    case 'milliseconds':
      return diff;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }
}

/**
 * Check if date is in the past
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean} Past status
 */
export function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean} Future status
 */
export function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Check if date is today
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean} Today status
 */
export function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean} Yesterday status
 */
export function isYesterday(date) {
  const yesterday = subtractTime(new Date(), 1, 'days');
  const d = new Date(date);
  
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean} Tomorrow status
 */
export function isTomorrow(date) {
  const tomorrow = addTime(new Date(), 1, 'days');
  const d = new Date(date);
  
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if year is leap year
 * 
 * @param {number} year - Year to check
 * @returns {boolean} Leap year status
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get start of period
 * 
 * @param {Date|string} date - Date
 * @param {string} period - Period (day, week, month, year)
 * @returns {Date} Start of period
 */
export function startOf(date, period = 'day') {
  const d = new Date(date);
  
  switch (period) {
    case 'year':
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      break;
    case 'month':
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      break;
    case 'week':
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      break;
    case 'day':
      d.setHours(0, 0, 0, 0);
      break;
    case 'hour':
      d.setMinutes(0, 0, 0);
      break;
    case 'minute':
      d.setSeconds(0, 0);
      break;
    case 'second':
      d.setMilliseconds(0);
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }
  
  return d;
}

/**
 * Get end of period
 * 
 * @param {Date|string} date - Date
 * @param {string} period - Period (day, week, month, year)
 * @returns {Date} End of period
 */
export function endOf(date, period = 'day') {
  const d = new Date(date);
  
  switch (period) {
    case 'year':
      d.setMonth(11, 31);
      d.setHours(23, 59, 59, 999);
      break;
    case 'month':
      d.setMonth(d.getMonth() + 1, 0);
      d.setHours(23, 59, 59, 999);
      break;
    case 'week':
      d.setDate(d.getDate() - d.getDay() + 6);
      d.setHours(23, 59, 59, 999);
      break;
    case 'day':
      d.setHours(23, 59, 59, 999);
      break;
    case 'hour':
      d.setMinutes(59, 59, 999);
      break;
    case 'minute':
      d.setSeconds(59, 999);
      break;
    case 'second':
      d.setMilliseconds(999);
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }
  
  return d;
}

/**
 * Get human-readable time ago
 * 
 * @param {Date|string} date - Date
 * @returns {string} Time ago string
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    
    if (interval >= 1) {
      return interval === 1 
        ? `1 ${name} ago` 
        : `${interval} ${name}s ago`;
    }
  }
  
  return 'just now';
}

/**
 * Get human-readable time until
 * 
 * @param {Date|string} date - Date
 * @returns {string} Time until string
 */
export function timeUntil(date) {
  const seconds = Math.floor((new Date(date) - new Date()) / 1000);
  
  if (seconds < 0) {
    return 'already passed';
  }
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    
    if (interval >= 1) {
      return interval === 1 
        ? `in 1 ${name}` 
        : `in ${interval} ${name}s`;
    }
  }
  
  return 'in a moment';
}

/**
 * Get timezone offset in hours
 * 
 * @param {Date} date - Date
 * @returns {number} Offset in hours
 */
export function getTimezoneOffset(date = new Date()) {
  return -date.getTimezoneOffset() / 60;
}

/**
 * Convert to UTC
 * 
 * @param {Date|string} date - Date
 * @returns {Date} UTC date
 */
export function toUTC(date) {
  const d = new Date(date);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

/**
 * Convert from UTC
 * 
 * @param {Date|string} date - UTC date
 * @returns {Date} Local date
 */
export function fromUTC(date) {
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
}

/**
 * Get ISO week number
 * 
 * @param {Date|string} date - Date
 * @returns {number} Week number
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

/**
 * Get quarter of year
 * 
 * @param {Date|string} date - Date
 * @returns {number} Quarter (1-4)
 */
export function getQuarter(date) {
  const d = new Date(date);
  return Math.floor((d.getMonth() + 3) / 3);
}

/**
 * Check if dates are same day
 * 
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} Same day status
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/**
 * Check if date is between two dates
 * 
 * @param {Date|string} date - Date to check
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @param {boolean} inclusive - Include boundaries
 * @returns {boolean} Between status
 */
export function isBetween(date, start, end, inclusive = true) {
  const d = new Date(date).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  
  return inclusive ? d >= s && d <= e : d > s && d < e;
}

/**
 * DateHelper class for OOP approach
 */
export class DateHelper {
  constructor(date = new Date()) {
    this.date = new Date(date);
  }

  format(format) {
    return formatDate(this.date, format);
  }

  add(amount, unit) {
    this.date = addTime(this.date, amount, unit);
    return this;
  }

  subtract(amount, unit) {
    this.date = subtractTime(this.date, amount, unit);
    return this;
  }

  diff(date, unit) {
    return diffTime(this.date, date, unit);
  }

  isPast() {
    return isPast(this.date);
  }

  isFuture() {
    return isFuture(this.date);
  }

  isToday() {
    return isToday(this.date);
  }

  isYesterday() {
    return isYesterday(this.date);
  }

  isTomorrow() {
    return isTomorrow(this.date);
  }

  startOf(period) {
    this.date = startOf(this.date, period);
    return this;
  }

  endOf(period) {
    this.date = endOf(this.date, period);
    return this;
  }

  timeAgo() {
    return timeAgo(this.date);
  }

  timeUntil() {
    return timeUntil(this.date);
  }

  toUTC() {
    this.date = toUTC(this.date);
    return this;
  }

  fromUTC() {
    this.date = fromUTC(this.date);
    return this;
  }

  getWeekNumber() {
    return getWeekNumber(this.date);
  }

  getQuarter() {
    return getQuarter(this.date);
  }

  isSameDay(date) {
    return isSameDay(this.date, date);
  }

  isBetween(start, end, inclusive) {
    return isBetween(this.date, start, end, inclusive);
  }

  clone() {
    return new DateHelper(this.date);
  }

  toDate() {
    return new Date(this.date);
  }

  static isLeapYear = isLeapYear;
  static getTimezoneOffset = getTimezoneOffset;
  static parse = parseDate;
}

export default DateHelper;
