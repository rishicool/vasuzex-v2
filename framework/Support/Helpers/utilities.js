/**
 * Helper Utilities
 * Common utility functions used across the framework
 */

/**
 * Mask phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Masked phone number
 */
export function maskPhone(phone) {
  if (!phone || phone.length !== 10) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
}

/**
 * Mask email for display
 * @param {string} email - Email address
 * @returns {string} Masked email
 */
export function maskEmail(email) {
  if (!email) return email;
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;

  const maskedUsername =
    username.length > 2
      ? `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
      : username;

  return `${maskedUsername}@${domain}`;
}

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>}
 */
export async function retry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        if (onRetry) {
          onRetry(error, attempt + 1, waitTime);
        }
        
        await sleep(waitTime);
      }
    }
  }
  
  throw lastError;
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Property name or function
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Omit keys from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {Object} New object without omitted keys
 */
export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Pick keys from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {Object} New object with picked keys
 */
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Flatten nested array
 * @param {Array} array - Array to flatten
 * @param {number} depth - Depth to flatten
 * @returns {Array} Flattened array
 */
export function flatten(array, depth = Infinity) {
  return array.flat(depth);
}

/**
 * Unique values in array
 * @param {Array} array - Source array
 * @returns {Array} Array with unique values
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * Format currency
 * @param {number} amount - Amount in smallest unit (paisa)
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'INR') {
  const value = amount / 100; // Convert paisa to rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

/**
 * Parse phone number to E.164 format
 * @param {string} phone - Phone number
 * @param {string} countryCode - Country code (default: +91 for India)
 * @returns {string} E.164 formatted phone
 */
export function parsePhone(phone, countryCode = '+91') {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleaned.startsWith(countryCode.replace('+', ''))) {
    return `+${cleaned}`;
  }
  
  return `${countryCode}${cleaned}`;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number format (Indian)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && /^[6-9]/.test(cleaned);
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export function truncate(str, length = 50, suffix = '...') {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function titleCase(str) {
  return str.toLowerCase().split(' ').map(capitalize).join(' ');
}

/**
 * Convert camelCase to snake_case
 * @param {string} str - camelCase string
 * @returns {string} snake_case string
 */
export function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - snake_case string
 * @returns {string} camelCase string
 */
export function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convert object keys to snake_case
 * @param {Object} obj - Object with camelCase keys
 * @returns {Object} Object with snake_case keys
 */
export function keysToSnakeCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toSnakeCase(key)] = value;
  }
  return result;
}

/**
 * Convert object keys to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
export function keysToCamelCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toCamelCase(key)] = value;
  }
  return result;
}
