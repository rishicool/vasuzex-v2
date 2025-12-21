/**
 * StringHelper - String manipulation utilities
 * 
 * Provides comprehensive string manipulation functions including
 * slug generation, case conversion, truncation, and more.
 */

/**
 * Generate URL-friendly slug from string
 * Handles special characters, unicode, and provides various options
 * 
 * @param {string} str - String to slugify
 * @param {Object} options - Slug generation options
 * @param {string} options.separator - Character to separate words (default: '-')
 * @param {boolean} options.lowercase - Convert to lowercase (default: true)
 * @param {boolean} options.trim - Trim whitespace (default: true)
 * @param {string} options.replacement - Character to replace invalid chars (default: '')
 * @param {RegExp} options.remove - Pattern to remove from string (default: null)
 * @param {boolean} options.strict - Remove all non-alphanumeric chars except separator (default: false)
 * @param {string} options.locale - Locale for toLowerCase/toUpperCase (default: 'en')
 * @param {number} options.maxLength - Maximum slug length (default: null)
 * @returns {string} URL-friendly slug
 * 
 * @example
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('Hello World!', { separator: '_' }) // 'hello_world'
 * generateSlug('Hello World!', { uppercase: true }) // 'HELLO-WORLD'
 * generateSlug('Café & Restaurant', { strict: true }) // 'cafe-restaurant'
 * generateSlug('Very Long Title That Should Be Truncated', { maxLength: 20 }) // 'very-long-title-that'
 */
export function generateSlug(str, options = {}) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const defaults = {
    separator: '-',
    lowercase: true,
    trim: true,
    replacement: '',
    remove: null,
    strict: false,
    locale: 'en',
    maxLength: null
  };

  const opts = { ...defaults, ...options };

  let slug = str;

  // Apply trim if enabled
  if (opts.trim) {
    slug = slug.trim();
  }

  // Apply custom remove pattern
  if (opts.remove instanceof RegExp) {
    slug = slug.replace(opts.remove, '');
  }

  // Normalize unicode characters (e.g., é -> e, ñ -> n)
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Convert to lowercase/uppercase based on options
  if (opts.lowercase) {
    slug = slug.toLocaleLowerCase(opts.locale);
  }

  if (opts.strict) {
    // Strict mode: remove all non-alphanumeric except separator
    // Replace spaces and underscores with separator
    slug = slug
      .replace(/[\s_]+/g, opts.separator)
      // Remove all non-alphanumeric except separator
      .replace(new RegExp(`[^a-z0-9${opts.separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]+`, 'g'), opts.replacement)
      // Replace multiple separators with single separator
      .replace(new RegExp(`${opts.separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}{2,}`, 'g'), opts.separator);
  } else {
    // Normal mode: allow more characters
    // Replace non-word characters (except separator) with replacement
    slug = slug
      .replace(/[\s_]+/g, opts.separator)
      // Replace special characters
      .replace(new RegExp(`[^\\w${opts.separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]+`, 'g'), opts.replacement)
      // Replace multiple separators with single separator
      .replace(new RegExp(`${opts.separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}{2,}`, 'g'), opts.separator);
  }

  // Remove leading/trailing separators
  const escapedSeparator = opts.separator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  slug = slug.replace(new RegExp(`^${escapedSeparator}+|${escapedSeparator}+$`, 'g'), '');

  // Apply max length if specified
  if (opts.maxLength && slug.length > opts.maxLength) {
    slug = slug.substring(0, opts.maxLength);
    // Remove trailing separator if cut off mid-word
    slug = slug.replace(new RegExp(`${escapedSeparator}+$`), '');
  }

  return slug;
}

/**
 * Convert string to camelCase
 * 
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 * 
 * @example
 * toCamelCase('hello-world') // 'helloWorld'
 * toCamelCase('hello_world') // 'helloWorld'
 * toCamelCase('Hello World') // 'helloWorld'
 */
export function toCamelCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/[_\-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Convert string to PascalCase
 * 
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 * 
 * @example
 * toPascalCase('hello-world') // 'HelloWorld'
 * toPascalCase('hello_world') // 'HelloWorld'
 */
export function toPascalCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/[_\-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[a-z]/, char => char.toUpperCase());
}

/**
 * Convert string to snake_case
 * 
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 * 
 * @example
 * toSnakeCase('helloWorld') // 'hello_world'
 * toSnakeCase('HelloWorld') // 'hello_world'
 */
export function toSnakeCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[\s\-]+/g, '_')
    .replace(/^_/, '')
    .toLowerCase();
}

/**
 * Convert string to kebab-case
 * 
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 * 
 * @example
 * toKebabCase('helloWorld') // 'hello-world'
 * toKebabCase('HelloWorld') // 'hello-world'
 */
export function toKebabCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[\s_]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
}

/**
 * Truncate string to specified length
 * 
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} ending - Ending to append (default: '...')
 * @returns {string} Truncated string
 * 
 * @example
 * truncate('Hello World', 8) // 'Hello...'
 * truncate('Hello World', 8, '…') // 'Hello W…'
 */
export function truncate(str, length = 100, ending = '...') {
  if (!str || typeof str !== 'string') {
    return '';
  }

  if (str.length <= length) {
    return str;
  }

  return str.substring(0, length - ending.length) + ending;
}

/**
 * Capitalize first letter of string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 * 
 * @example
 * capitalize('hello world') // 'Hello world'
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize first letter of each word
 * 
 * @param {string} str - String to title case
 * @returns {string} Title cased string
 * 
 * @example
 * toTitleCase('hello world') // 'Hello World'
 */
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Check if string contains substring (case-insensitive)
 * 
 * @param {string} str - String to search in
 * @param {string} needle - Substring to search for
 * @returns {boolean} True if found
 * 
 * @example
 * contains('Hello World', 'world') // true
 */
export function contains(str, needle) {
  if (!str || !needle || typeof str !== 'string' || typeof needle !== 'string') {
    return false;
  }

  return str.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Check if string starts with substring (case-insensitive)
 * 
 * @param {string} str - String to check
 * @param {string} needle - Substring to check for
 * @returns {boolean} True if starts with
 * 
 * @example
 * startsWith('Hello World', 'hello') // true
 */
export function startsWith(str, needle) {
  if (!str || !needle || typeof str !== 'string' || typeof needle !== 'string') {
    return false;
  }

  return str.toLowerCase().startsWith(needle.toLowerCase());
}

/**
 * Check if string ends with substring (case-insensitive)
 * 
 * @param {string} str - String to check
 * @param {string} needle - Substring to check for
 * @returns {boolean} True if ends with
 * 
 * @example
 * endsWith('Hello World', 'world') // true
 */
export function endsWith(str, needle) {
  if (!str || !needle || typeof str !== 'string' || typeof needle !== 'string') {
    return false;
  }

  return str.toLowerCase().endsWith(needle.toLowerCase());
}

/**
 * Generate random string
 * 
 * @param {number} length - String length
 * @param {string} chars - Characters to use (default: alphanumeric)
 * @returns {string} Random string
 * 
 * @example
 * randomString(10) // 'Kx8fJ2mN4p'
 * randomString(6, '0123456789') // '482719'
 */
export function randomString(length = 32, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Pad string to specified length
 * 
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} padChar - Character to pad with (default: ' ')
 * @param {string} direction - 'left', 'right', or 'both' (default: 'right')
 * @returns {string} Padded string
 * 
 * @example
 * pad('42', 5, '0', 'left') // '00042'
 */
export function pad(str, length, padChar = ' ', direction = 'right') {
  if (!str) str = '';
  str = String(str);

  const padLength = length - str.length;
  if (padLength <= 0) return str;

  const padding = padChar.repeat(Math.ceil(padLength / padChar.length)).substring(0, padLength);

  if (direction === 'left') {
    return padding + str;
  } else if (direction === 'both') {
    const leftPad = Math.floor(padLength / 2);
    const rightPad = padLength - leftPad;
    return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
  } else {
    return str + padding;
  }
}

/**
 * Remove all whitespace from string
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
 * Normalize whitespace (replace multiple spaces with single space)
 * 
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export function normalizeWhitespace(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extract initials from name
 * 
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials
 * 
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('John Michael Doe', 3) // 'JMD'
 */
export function getInitials(name, maxInitials = 2) {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, maxInitials)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

  return initials;
}

/**
 * StringHelper class for OOP approach
 */
export class StringHelper {
  static generateSlug = generateSlug;
  static toCamelCase = toCamelCase;
  static toPascalCase = toPascalCase;
  static toSnakeCase = toSnakeCase;
  static toKebabCase = toKebabCase;
  static truncate = truncate;
  static capitalize = capitalize;
  static toTitleCase = toTitleCase;
  static contains = contains;
  static startsWith = startsWith;
  static endsWith = endsWith;
  static randomString = randomString;
  static pad = pad;
  static removeWhitespace = removeWhitespace;
  static normalizeWhitespace = normalizeWhitespace;
  static getInitials = getInitials;
}

export default StringHelper;
