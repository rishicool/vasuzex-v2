/**
 * SanitizationHelper - Data sanitization utilities
 * 
 * Provides functions to clean and sanitize user input.
 */

/**
 * Sanitize string - Remove dangerous characters
 * 
 * @param {string} str - String to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export function sanitizeString(str, options = {}) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const {
    allowHTML = false,
    trim = true,
    lowercase = false,
    uppercase = false,
    removeSpecialChars = false,
  } = options;

  let sanitized = str;

  // Remove HTML tags if not allowed
  if (!allowHTML) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
    sanitized = sanitized.replace(/<[^>]+>/g, ''); // Remove all other HTML tags
  }

  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Convert case
  if (lowercase) {
    sanitized = sanitized.toLowerCase();
  } else if (uppercase) {
    sanitized = sanitized.toUpperCase();
  }

  // Remove special characters
  if (removeSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  return sanitized;
}

/**
 * Sanitize email address
 * 
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .trim()
    .toLowerCase()
    .replace(/\s/g, '');
}

/**
 * Sanitize phone number
 * 
 * @param {string} phone - Phone number to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized phone
 */
export function sanitizePhone(phone, options = {}) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const { keepCountryCode = true } = options;

  let sanitized = phone.replace(/[^0-9+]/g, '');

  if (!keepCountryCode) {
    sanitized = sanitized.replace(/^\+/, '');
  }

  return sanitized;
}

/**
 * Sanitize HTML - Escape dangerous characters
 * 
 * @param {string} html - HTML to sanitize
 * @returns {string} Escaped HTML
 */
export function escapeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return html.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Unescape HTML
 * 
 * @param {string} html - Escaped HTML
 * @returns {string} Unescaped HTML
 */
export function unescapeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return html.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, (entity) => map[entity]);
}

/**
 * Sanitize filename
 * 
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+/, '') // Remove leading underscores
    .replace(/_+(\.[^.]+)$/, '$1'); // Remove trailing underscores before extension
}

/**
 * Sanitize URL
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    // Reject dangerous protocols
    if (['javascript:', 'data:', 'vbscript:'].some(proto => urlObj.protocol.startsWith(proto.slice(0, -1)))) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * Strip HTML tags
 * 
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Sanitize SQL input (basic protection)
 * 
 * @param {string} input - SQL input
 * @returns {string} Sanitized input
 */
export function sanitizeSQL(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Sanitize object - Recursively sanitize all string values
 * 
 * @param {object} obj - Object to sanitize
 * @param {object} options - Sanitization options
 * @returns {object} Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string') {
        return sanitizeString(item, options);
      } else if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item, options);
      }
      return item;
    });
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Remove null bytes
 * 
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
export function removeNullBytes(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.replace(/\0/g, '');
}

/**
 * Normalize whitespace
 * 
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export function normalizeWhitespace(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Slugify string
 * 
 * @param {string} str - String to slugify
 * @returns {string} Slug
 */
export function slugify(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Remove whitespace
 * 
 * @param {string} str - String to clean
 * @returns {string} String without whitespace
 */
export function removeWhitespace(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.replace(/\s/g, '');
}

/**
 * Sanitize JSON string
 * 
 * @param {string} jsonString - JSON string
 * @returns {string} Sanitized JSON string
 */
export function sanitizeJSON(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return '';
  }

  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return '';
  }
}

/**
 * SanitizationHelper class for OOP approach
 */
export class SanitizationHelper {
  static sanitizeString = sanitizeString;
  static sanitizeEmail = sanitizeEmail;
  static sanitizePhone = sanitizePhone;
  static escapeHTML = escapeHTML;
  static unescapeHTML = unescapeHTML;
  static sanitizeFilename = sanitizeFilename;
  static sanitizeURL = sanitizeURL;
  static stripHTML = stripHTML;
  static sanitizeSQL = sanitizeSQL;
  static sanitizeObject = sanitizeObject;
  static removeNullBytes = removeNullBytes;
  static normalizeWhitespace = normalizeWhitespace;
  static slugify = slugify;
  static removeWhitespace = removeWhitespace;
  static sanitizeJSON = sanitizeJSON;
}

export default SanitizationHelper;
