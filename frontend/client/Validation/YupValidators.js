/**
 * Yup Custom Validators
 *
 * Custom Yup validation methods that integrate with our centralized validators.
 * This ensures validation logic is consistent across the application.
 */

import * as Yup from 'yup';
import { validators, validationMessages } from './Validators.js';

/**
 * Add custom validation methods to Yup
 */
export function setupYupValidators() {
  // Phone validation
  Yup.addMethod(Yup.string, 'phone', function (message) {
    return this.test('phone', message || validationMessages.phone, function (value) {
      if (!value) return true; // Let required() handle empty values
      return validators.phone(value);
    });
  });

  // Email validation (Yup has built-in, but we can enhance it)
  Yup.addMethod(Yup.string, 'emailCustom', function (message) {
    return this.test('emailCustom', message || validationMessages.email, function (value) {
      if (!value) return true;
      return validators.email(value);
    });
  });

  // OTP validation
  Yup.addMethod(Yup.string, 'otp', function (message) {
    return this.test('otp', message || validationMessages.otp, function (value) {
      if (!value) return true;
      return validators.otp(value);
    });
  });

  // Pincode validation
  Yup.addMethod(Yup.string, 'pincode', function (message) {
    return this.test('pincode', message || validationMessages.pincode, function (value) {
      if (!value) return true;
      return validators.pincode(value);
    });
  });

  // IFSC code validation
  Yup.addMethod(Yup.string, 'ifsc', function (message) {
    return this.test('ifsc', message || validationMessages.ifsc, function (value) {
      if (!value) return true;
      return validators.ifsc(value);
    });
  });

  // PAN card validation
  Yup.addMethod(Yup.string, 'pan', function (message) {
    return this.test('pan', message || validationMessages.pan, function (value) {
      if (!value) return true;
      return validators.pan(value);
    });
  });

  // Aadhaar validation
  Yup.addMethod(Yup.string, 'aadhaar', function (message) {
    return this.test('aadhaar', message || validationMessages.aadhaar, function (value) {
      if (!value) return true;
      return validators.aadhaar(value);
    });
  });

  // Positive number validation
  Yup.addMethod(Yup.number, 'positive', function (message) {
    return this.test('positive', message || validationMessages.positiveNumber, function (value) {
      if (value === undefined || value === null) return true;
      return validators.positiveNumber(value);
    });
  });
}

// Export validators for direct use
export { validators, validationMessages, validate } from './Validators.js';
