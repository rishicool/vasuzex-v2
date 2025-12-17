/**
 * Form Validation Utilities
 *
 * Simple, reusable validation functions for common form fields.
 * Returns boolean for easy integration with any form library.
 * 
 * @module @vasuzex/react/utils/validation
 */

/**
 * Validation functions
 */
export const validators = {
  /**
   * Validate 10-digit Indian phone number
   * @param {string} value - Phone number
   * @returns {boolean} Is valid
   */
  phone: (value) => {
    return /^[0-9]{10}$/.test(value);
  },

  /**
   * Validate email address
   * @param {string} value - Email
   * @returns {boolean} Is valid
   */
  email: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  /**
   * Validate 6-digit OTP
   * @param {string} value - OTP
   * @returns {boolean} Is valid
   */
  otp: (value) => {
    return /^[0-9]{6}$/.test(value);
  },

  /**
   * Validate 6-digit Indian pincode
   * @param {string} value - Pincode
   * @returns {boolean} Is valid
   */
  pincode: (value) => {
    return /^[0-9]{6}$/.test(value);
  },

  /**
   * Check if value is not empty
   * @param {any} value - Value to check
   * @returns {boolean} Is valid
   */
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  },

  /**
   * Validate minimum string length
   * @param {number} min - Minimum length
   * @returns {Function} Validator function
   */
  minLength: (min) => (value) => {
    return value.length >= min;
  },

  /**
   * Validate maximum string length
   * @param {number} max - Maximum length
   * @returns {Function} Validator function
   */
  maxLength: (max) => (value) => {
    return value.length <= max;
  },

  /**
   * Validate URL format
   * @param {string} value - URL
   * @returns {boolean} Is valid
   */
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate number is within range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {Function} Validator function
   */
  numberRange: (min, max) => (value) => {
    return value >= min && value <= max;
  },

  /**
   * Validate positive number
   * @param {number} value - Number
   * @returns {boolean} Is valid
   */
  positiveNumber: (value) => {
    return value > 0;
  },

  /**
   * Validate Indian IFSC code format
   * @param {string} value - IFSC code
   * @returns {boolean} Is valid
   */
  ifsc: (value) => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
  },

  /**
   * Validate PAN card format
   * @param {string} value - PAN number
   * @returns {boolean} Is valid
   */
  pan: (value) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  },

  /**
   * Validate Aadhaar number (12 digits)
   * @param {string} value - Aadhaar number
   * @returns {boolean} Is valid
   */
  aadhaar: (value) => {
    return /^[0-9]{12}$/.test(value);
  },
};

/**
 * Validation error messages
 */
export const validationMessages = {
  phone: 'Phone number must be exactly 10 digits',
  email: 'Please enter a valid email address',
  otp: 'OTP must be exactly 6 digits',
  pincode: 'Pincode must be exactly 6 digits',
  required: 'This field is required',
  minLength: (min) => `Minimum ${min || 0} characters required`,
  maxLength: (max) => `Maximum ${max || 0} characters allowed`,
  url: 'Please enter a valid URL',
  numberRange: (min, max) => `Value must be between ${min || 0} and ${max || 0}`,
  positiveNumber: 'Value must be greater than 0',
  ifsc: 'Invalid IFSC code format',
  pan: 'Invalid PAN card format',
  aadhaar: 'Aadhaar number must be exactly 12 digits',
};

/**
 * Helper function to validate a value and get error message
 * @param {any} value - Value to validate
 * @param {string} validatorName - Validator function name
 * @param {number} [arg1] - Optional argument 1
 * @param {number} [arg2] - Optional argument 2
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validate(value, validatorName, arg1, arg2) {
  const validator = validators[validatorName];

  if (!validator) {
    return { isValid: false, error: 'Invalid validator' };
  }

  let isValid;

  // Handle different validator signatures
  if (arg1 !== undefined && arg2 !== undefined) {
    isValid = validator(arg1, arg2)(value);
  } else if (arg1 !== undefined) {
    isValid = validator(arg1)(value);
  } else {
    isValid = validator(value);
  }

  if (isValid) {
    return { isValid: true };
  }

  const message = validationMessages[validatorName];
  let error;

  if (typeof message === 'function') {
    if (arg1 !== undefined && arg2 !== undefined) {
      error = message(arg1, arg2);
    } else if (arg1 !== undefined) {
      error = message(arg1);
    } else {
      error = message();
    }
  } else {
    error = message;
  }

  return { isValid: false, error };
}

/**
 * Form Error Handling Utilities for Formik
 * 
 * These utilities help manage backend validation errors in Formik forms.
 */

/**
 * Converts flat dot-notation error object to nested structure for Formik
 * 
 * Example:
 * Input:  { "bankdetails.ifscCode": "IFSC code is invalid" }
 * Output: { bankdetails: { ifscCode: "IFSC code is invalid" } }
 * 
 * @param {Object} errors - Flat error object with dot-notation keys
 * @returns {Object} Nested error object for Formik
 */
export function transformBackendErrors(errors) {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  const nested = {};
  
  Object.keys(errors).forEach((field) => {
    if (field.includes('.')) {
      // Handle nested fields like "bankdetails.ifscCode"
      const parts = field.split('.');
      let current = nested;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = errors[field];
    } else {
      // Handle top-level fields
      nested[field] = errors[field];
    }
  });
  
  return nested;
}

/**
 * Handles API validation errors and sets them in Formik-compatible format
 * 
 * @param {Error} error - Error object from API call
 * @param {Function} setBackendErrors - State setter for backend errors
 * @param {Object} toast - Toast notification object with error method
 * @returns {boolean} True if error was handled as validation error
 */
export function handleBackendValidationError(error, setBackendErrors, toast) {
  // Check if this is a validation error (422 status)
  if (error.isValidationError && error.errors) {
    console.log("✅ Validation error detected:", error.errors);
    
    // Transform flat errors to nested structure
    const nested = transformBackendErrors(error.errors);
    
    setBackendErrors(nested);
    console.log("✅ Backend errors set:", nested);
    
    if (toast && typeof toast.error === 'function') {
      toast.error(error.message || "Please fix the validation errors");
    }
    return true;
  }
  
  return false;
}

/**
 * Flattens nested error object to dot-notation for easier access
 * 
 * Example:
 * Input:  { bankdetails: { ifscCode: "Invalid" } }
 * Output: { "bankdetails.ifscCode": "Invalid" }
 * 
 * @param {Object} errors - Nested error object
 * @param {string} prefix - Prefix for nested keys (used internally)
 * @returns {Object} Flattened error object with dot-notation keys
 */
export function flattenErrors(errors, prefix = "") {
  const flattened = {};

  for (const key in errors) {
    const value = errors[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      flattened[newKey] = value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(flattened, flattenErrors(value, newKey));
    }
  }

  return flattened;
}

export default { validators, validationMessages, validate, transformBackendErrors, handleBackendValidationError, flattenErrors };
