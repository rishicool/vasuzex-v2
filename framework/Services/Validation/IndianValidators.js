/**
 * Indian Validators
 * India-specific validation rules
 * 
 * Provides validators for Indian formats like phone, PAN, IFSC, Aadhaar, etc.
 */

export class IndianValidators {
  /**
   * Validate Indian mobile number (10 digits)
   */
  static phone(value) {
    if (!value) return { isValid: false, message: 'Phone number is required' };
    
    const cleaned = value.toString().replace(/\D/g, '');
    const pattern = /^[6-9][0-9]{9}$/;
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'Phone number must be 10 digits starting with 6-9',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate Indian PIN code (6 digits)
   */
  static pincode(value) {
    if (!value) return { isValid: false, message: 'PIN code is required' };
    
    const cleaned = value.toString().replace(/\D/g, '');
    const pattern = /^[1-9][0-9]{5}$/;
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'PIN code must be 6 digits and cannot start with 0',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate IFSC code
   * Format: 4 letters (bank code) + 0 + 6 alphanumeric (branch code)
   */
  static ifsc(value) {
    if (!value) return { isValid: false, message: 'IFSC code is required' };
    
    const pattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const cleaned = value.toString().toUpperCase().trim();
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'IFSC code must be in format: ABCD0123456 (11 characters)',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate PAN card number
   * Format: 5 letters + 4 digits + 1 letter
   */
  static pan(value) {
    if (!value) return { isValid: false, message: 'PAN number is required' };
    
    const pattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const cleaned = value.toString().toUpperCase().trim();
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'PAN must be in format: ABCDE1234F (10 characters)',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate Aadhaar number (12 digits)
   * Note: Verhoeff algorithm validation can be added for stronger validation
   */
  static aadhaar(value) {
    if (!value) return { isValid: false, message: 'Aadhaar number is required' };
    
    const cleaned = value.toString().replace(/\D/g, '');
    const pattern = /^[2-9][0-9]{11}$/;
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'Aadhaar must be 12 digits and cannot start with 0 or 1',
      };
    }
    
    // Optional: Verhoeff algorithm validation
    if (!this.verifyVerhoeff(cleaned)) {
      return {
        isValid: false,
        message: 'Invalid Aadhaar number (checksum failed)',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate GST number
   * Format: 2 digits (state) + 10 chars (PAN) + 1 letter + 1 digit + 1 letter + 1 digit/letter
   */
  static gstin(value) {
    if (!value) return { isValid: false, message: 'GSTIN is required' };
    
    const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const cleaned = value.toString().toUpperCase().trim();
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'GSTIN must be 15 characters in valid format',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate Indian vehicle registration number
   * Format: AA00AA0000 or AA-00-AA-0000
   */
  static vehicleNumber(value) {
    if (!value) return { isValid: false, message: 'Vehicle number is required' };
    
    const cleaned = value.toString().toUpperCase().replace(/[-\s]/g, '');
    const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'Vehicle number must be in format: DL01AB1234',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate UPI ID
   * Format: username@bankcode
   */
  static upi(value) {
    if (!value) return { isValid: false, message: 'UPI ID is required' };
    
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    
    if (!pattern.test(value)) {
      return {
        isValid: false,
        message: 'UPI ID must be in format: username@bank',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate Indian landline number
   * Format: STD code (2-5 digits) + number (6-8 digits)
   */
  static landline(value, includeStd = true) {
    if (!value) return { isValid: false, message: 'Landline number is required' };
    
    const cleaned = value.toString().replace(/\D/g, '');
    
    if (includeStd) {
      // With STD code: 011-12345678 or 0141-1234567
      const pattern = /^0[1-9][0-9]{1,3}[0-9]{6,8}$/;
      if (!pattern.test(cleaned)) {
        return {
          isValid: false,
          message: 'Landline with STD must be 10-12 digits starting with 0',
        };
      }
    } else {
      // Without STD: 12345678
      const pattern = /^[0-9]{6,8}$/;
      if (!pattern.test(cleaned)) {
        return {
          isValid: false,
          message: 'Landline number must be 6-8 digits',
        };
      }
    }
    
    return { isValid: true };
  }

  /**
   * Validate passport number
   * Format: 1 letter + 7 digits
   */
  static passport(value) {
    if (!value) return { isValid: false, message: 'Passport number is required' };
    
    const pattern = /^[A-Z][0-9]{7}$/;
    const cleaned = value.toString().toUpperCase().trim();
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'Passport number must be 1 letter followed by 7 digits',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Validate voter ID
   * Format: 3 letters + 7 digits
   */
  static voterId(value) {
    if (!value) return { isValid: false, message: 'Voter ID is required' };
    
    const pattern = /^[A-Z]{3}[0-9]{7}$/;
    const cleaned = value.toString().toUpperCase().trim();
    
    if (!pattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'Voter ID must be 3 letters followed by 7 digits',
      };
    }
    
    return { isValid: true };
  }

  /**
   * Verhoeff algorithm for Aadhaar validation
   */
  static verifyVerhoeff(num) {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];
    
    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];
    
    let c = 0;
    const reversed = num.split('').reverse().join('');
    
    for (let i = 0; i < reversed.length; i++) {
      c = d[c][p[i % 8][parseInt(reversed[i])]];
    }
    
    return c === 0;
  }
}

export default IndianValidators;
