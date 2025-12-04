/**
 * Formatter Manager
 * Laravel-style formatting utilities
 * 
 * Provides consistent formatting for dates, currency, numbers, and more.
 */

export class FormatterManager {
  constructor(app) {
    this.app = app;
    this.locale = app.config('app.locale', 'en-IN');
    this.timezone = app.config('app.timezone', 'Asia/Kolkata');
    this.currency = app.config('app.currency', 'INR');
  }

  /**
   * Format date
   */
  date(date, format = 'short') {
    if (!date) return '-';

    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';

    const options = format === 'short'
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { year: 'numeric', month: 'long', day: 'numeric' };

    return d.toLocaleDateString(this.locale, options);
  }

  /**
   * Format time
   */
  time(date, use24Hour = false) {
    if (!date) return '-';

    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleTimeString(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    });
  }

  /**
   * Format datetime
   */
  datetime(date, format = 'short') {
    if (!date) return '-';

    return `${this.date(date, format)} ${this.time(date)}`;
  }

  /**
   * Format relative time ("2 hours ago")
   */
  relativeTime(date) {
    if (!date) return '-';

    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin === 1) return '1 minute ago';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour === 1) return '1 hour ago';
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay === 1) return 'yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;
    if (diffWeek === 1) return '1 week ago';
    if (diffWeek < 4) return `${diffWeek} weeks ago`;
    if (diffMonth === 1) return '1 month ago';
    if (diffMonth < 12) return `${diffMonth} months ago`;
    if (diffYear === 1) return '1 year ago';
    return `${diffYear} years ago`;
  }

  /**
   * Format currency
   */
  currency(amount, currency = null, decimals = null) {
    if (amount === null || amount === undefined) return '-';

    const curr = currency || this.currency;
    const options = {
      style: 'currency',
      currency: curr,
    };

    if (decimals !== null) {
      options.minimumFractionDigits = decimals;
      options.maximumFractionDigits = decimals;
    } else if (curr === 'INR') {
      options.maximumFractionDigits = 0;
    }

    return new Intl.NumberFormat(this.locale, options).format(amount);
  }

  /**
   * Format number with Indian number system
   */
  number(num, decimals = 0) {
    if (num === null || num === undefined) return '-';

    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Format phone number
   */
  phone(phone, format = 'spaced') {
    if (!phone) return '-';

    const cleaned = phone.toString().replace(/\D/g, '');

    if (format === 'spaced' && cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    if (format === 'dashed' && cleaned.length === 10) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }

    if (format === 'grouped' && cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    return cleaned;
  }

  /**
   * Format percentage
   */
  percentage(value, decimals = 0) {
    if (value === null || value === undefined) return '-';

    return `${Number(value).toFixed(decimals)}%`;
  }

  /**
   * Format file size
   */
  fileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return '-';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  /**
   * Truncate text
   */
  truncate(text, maxLength, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Capitalize first letter
   */
  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Title case (capitalize each word)
   */
  title(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Snake case
   */
  snake(text) {
    if (!text) return '';
    return text
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Kebab case
   */
  kebab(text) {
    if (!text) return '';
    return text
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  /**
   * Camel case
   */
  camel(text) {
    if (!text) return '';
    return text
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
  }

  /**
   * Studly case (PascalCase)
   */
  studly(text) {
    const camelCase = this.camel(text);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  /**
   * Plural form
   */
  plural(count, singular, plural = null) {
    if (count === 1) return singular;
    return plural || `${singular}s`;
  }

  /**
   * Format boolean as Yes/No
   */
  boolean(value, trueText = 'Yes', falseText = 'No') {
    return value ? trueText : falseText;
  }

  /**
   * Format array as comma-separated list
   */
  list(array, separator = ', ', lastSeparator = ' and ') {
    if (!Array.isArray(array) || array.length === 0) return '';
    if (array.length === 1) return array[0];
    if (array.length === 2) return array.join(lastSeparator);

    const last = array[array.length - 1];
    const rest = array.slice(0, -1);
    return rest.join(separator) + lastSeparator + last;
  }

  /**
   * Format duration (seconds to human readable)
   */
  duration(seconds) {
    if (!seconds || seconds < 0) return '-';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Format ordinal number (1st, 2nd, 3rd, etc.)
   */
  ordinal(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }

  /**
   * Format Indian Rupees in words
   */
  rupeeWords(amount) {
    if (amount === 0) return 'Zero Rupees';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    };

    let num = Math.floor(amount);
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    let words = '';
    if (crore) words += convert(crore) + ' Crore ';
    if (lakh) words += convert(lakh) + ' Lakh ';
    if (thousand) words += convert(thousand) + ' Thousand ';
    if (num) words += convert(num);

    return (words.trim() + ' Rupees').trim();
  }

  /**
   * Format Indian number system (1L, 1Cr, etc.)
   */
  indianNumber(num) {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  }
}

export default FormatterManager;
