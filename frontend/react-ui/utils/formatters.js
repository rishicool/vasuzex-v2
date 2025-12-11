/**
 * Formatting Utilities - Production Ready
 *
 * Common formatters for dates, currency, phone numbers, etc.
 * Consistent formatting across all applications.
 * 
 * @module @vasuzex/react/utils/formatters
 */

/**
 * Complete set of formatting functions
 */
export const formatters = {
  /**
   * Format date to readable string
   * @param {Date|string} date - Date to format
   * @param {"short"|"long"} [format="short"] - Format type
   * @returns {string} Formatted date
   */
  date: (date, format = 'short') => {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if d is actually a Date object and is valid
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    if (format === 'short') {
      return d.toLocaleDateString('en-IN');
    }

    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format time to readable string
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted time
   */
  time: (date) => {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if d is actually a Date object and is valid
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format date and time together
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted datetime
   */
  datetime: (date) => {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if d is actually a Date object and is valid
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    return `${formatters.date(d)} ${formatters.time(d)}`;
  },

  /**
   * Format currency in Indian Rupees
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  currency: (amount) => {
    if (amount === null || amount === undefined) {
      return '₹0';
    }

    const num = parseFloat(amount);
    if (isNaN(num)) {
      return '₹0';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  },

  /**
   * Format phone number with space
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone
   */
  phone: (phone) => {
    if (!phone) return '-';
    if (phone.length === 10) {
      return `${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {Date|string} date - Date to format
   * @returns {string} Relative time string
   */
  relativeTime: (date) => {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if d is actually a Date object and is valid
    if (!(d instanceof Date) || isNaN(d.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatters.date(d);
  },

  /**
   * Format number with Indian number system (lakhs, crores)
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  number: (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  },

  /**
   * Format percentage
   * @param {number} value - Value to format
   * @param {number} [decimals=0] - Decimal places
   * @returns {string} Formatted percentage
   */
  percentage: (value, decimals = 0) => {
    if (isNaN(value)) value = 0;
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate: (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },

  /**
   * Capitalize first letter
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },
};

// Default export
export default formatters;
