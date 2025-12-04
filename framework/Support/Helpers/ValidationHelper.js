/**
 * ValidationHelper - Common validation functions
 * 
 * Provides reusable validation utilities.
 */

/**
 * Validate email address
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} Valid status
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID
 * 
 * @param {string} uuid - UUID to validate
 * @param {number} version - UUID version (default: any)
 * @returns {boolean} Valid status
 */
export function isValidUUID(uuid, version = null) {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = {
    1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    2: /^[0-9a-f]{8}-[0-9a-f]{4}-2[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    all: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  };

  const regex = version ? uuidRegex[version] : uuidRegex.all;
  return regex ? regex.test(uuid) : false;
}

/**
 * Validate MongoDB ObjectId
 * 
 * @param {string} id - ObjectId to validate
 * @returns {boolean} Valid status
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate phone number (international format)
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Valid status
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // E.164 format: +[country code][number]
  const cleaned = phone.replace(/[\s()-]/g, '');
  const phoneRegex = /^\+?[1-9]\d{9,14}$/; // Minimum 10 digits, maximum 15
  return phoneRegex.test(cleaned);
}

/**
 * Validate Indian phone number
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Valid status
 */
export function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleaned = phone.replace(/[\s()-]/g, '');
  const indianPhoneRegex = /^(\+91|91|0)?[6789]\d{9}$/;
  return indianPhoneRegex.test(cleaned);
}

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result with strength info
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;

  const result = {
    isValid: true,
    errors: [],
    strength: 0,
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.errors.push('Password is required');
    return result;
  }

  if (password.length < minLength) {
    result.isValid = false;
    result.errors.push(`Password must be at least ${minLength} characters`);
  } else {
    result.strength += 1;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    result.strength += 1;
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    result.strength += 1;
  }

  if (requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    result.strength += 1;
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.strength += 1;
  }

  return result;
}

/**
 * Validate URL
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} Valid status
 */
export function isValidURL(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate IP address (v4 or v6)
 * 
 * @param {string} ip - IP address to validate
 * @param {number} version - IP version (4 or 6, default: any)
 * @returns {boolean} Valid status
 */
export function isValidIP(ip, version = null) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  if (version === 4) {
    return ipv4Regex.test(ip);
  } else if (version === 6) {
    return ipv6Regex.test(ip);
  }

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate credit card number (Luhn algorithm)
 * 
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Valid status
 */
export function isValidCreditCard(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate date string
 * 
 * @param {string} dateString - Date string to validate
 * @param {string} format - Expected format (optional)
 * @returns {boolean} Valid status
 */
export function isValidDate(dateString, format = null) {
  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate alphanumeric string
 * 
 * @param {string} str - String to validate
 * @returns {boolean} Valid status
 */
export function isAlphanumeric(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }

  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validate numeric string
 * 
 * @param {string} str - String to validate
 * @returns {boolean} Valid status
 */
export function isNumeric(str) {
  if (str === null || str === undefined || str === '') {
    return false;
  }

  return !isNaN(str) && !isNaN(parseFloat(str));
}

/**
 * Validate string length
 * 
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} Valid status
 */
export function hasValidLength(str, min, max = Infinity) {
  if (!str || typeof str !== 'string') {
    return false;
  }

  return str.length >= min && str.length <= max;
}

/**
 * ValidationHelper class for OOP approach
 */
export class ValidationHelper {
  static isValidEmail = isValidEmail;
  static isValidUUID = isValidUUID;
  static isValidObjectId = isValidObjectId;
  static isValidPhone = isValidPhone;
  static isValidIndianPhone = isValidIndianPhone;
  static validatePassword = validatePassword;
  static isValidURL = isValidURL;
  static isValidIP = isValidIP;
  static isValidCreditCard = isValidCreditCard;
  static isValidDate = isValidDate;
  static isAlphanumeric = isAlphanumeric;
  static isNumeric = isNumeric;
  static hasValidLength = hasValidLength;
}

export default ValidationHelper;
