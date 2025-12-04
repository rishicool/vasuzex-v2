/**
 * Indian Validators Tests
 * Tests for PAN, Aadhaar, IFSC, GST, and other Indian validators
 */

import { describe, test, expect } from '@jest/globals';
import { IndianValidators } from '../framework/Services/Validation/IndianValidators.js';

describe('IndianValidators', () => {
  describe('Phone Number Validation', () => {
    test('validates correct phone numbers', () => {
      expect(IndianValidators.phone('9876543210')).toBe(true);
      expect(IndianValidators.phone('8123456789')).toBe(true);
      expect(IndianValidators.phone('7012345678')).toBe(true);
      expect(IndianValidators.phone('6123456789')).toBe(true);
    });

    test('rejects invalid phone numbers', () => {
      expect(IndianValidators.phone('5123456789')).toBe(false); // Doesn't start with 6-9
      expect(IndianValidators.phone('12345')).toBe(false); // Too short
      expect(IndianValidators.phone('98765432101')).toBe(false); // Too long
      expect(IndianValidators.phone('abcdefghij')).toBe(false); // Not numeric
    });

    test('handles phone with spaces/dashes', () => {
      expect(IndianValidators.phone('98765 43210')).toBe(true);
      expect(IndianValidators.phone('98765-43210')).toBe(true);
    });
  });

  describe('PIN Code Validation', () => {
    test('validates correct PIN codes', () => {
      expect(IndianValidators.pincode('110001')).toBe(true);
      expect(IndianValidators.pincode('400001')).toBe(true);
      expect(IndianValidators.pincode('560001')).toBe(true);
    });

    test('rejects invalid PIN codes', () => {
      expect(IndianValidators.pincode('11001')).toBe(false); // Too short
      expect(IndianValidators.pincode('1100011')).toBe(false); // Too long
      expect(IndianValidators.pincode('ABCDEF')).toBe(false); // Not numeric
    });
  });

  describe('IFSC Code Validation', () => {
    test('validates correct IFSC codes', () => {
      expect(IndianValidators.ifsc('SBIN0001234')).toBe(true);
      expect(IndianValidators.ifsc('HDFC0000123')).toBe(true);
      expect(IndianValidators.ifsc('ICIC0001234')).toBe(true);
    });

    test('rejects invalid IFSC codes', () => {
      expect(IndianValidators.ifsc('SBI001234')).toBe(false); // Too short
      expect(IndianValidators.ifsc('SBIN00012345')).toBe(false); // Too long
      expect(IndianValidators.ifsc('SBIN-001234')).toBe(false); // Invalid format
      expect(IndianValidators.ifsc('sbin0001234')).toBe(false); // Lowercase
    });
  });

  describe('PAN Card Validation', () => {
    test('validates correct PAN numbers', () => {
      expect(IndianValidators.pan('ABCDE1234F')).toBe(true);
      expect(IndianValidators.pan('AAAPL1234C')).toBe(true);
    });

    test('rejects invalid PAN numbers', () => {
      expect(IndianValidators.pan('ABC1234F')).toBe(false); // Too short
      expect(IndianValidators.pan('ABCDE12345F')).toBe(false); // Too long
      expect(IndianValidators.pan('12345ABCDE')).toBe(false); // Invalid format
      expect(IndianValidators.pan('abcde1234f')).toBe(false); // Lowercase
    });

    test('validates PAN structure', () => {
      // First 5: Letters, Next 4: Digits, Last: Letter
      expect(IndianValidators.pan('ABCDE1234F')).toBe(true);
      expect(IndianValidators.pan('A1CDE1234F')).toBe(false); // Digit in first 5
      expect(IndianValidators.pan('ABCDEA234F')).toBe(false); // Letter in middle 4
      expect(IndianValidators.pan('ABCDE12341')).toBe(false); // Digit at end
    });
  });

  describe('Aadhaar Number Validation', () => {
    test('validates correct Aadhaar numbers', () => {
      // Note: Using dummy numbers for testing
      expect(IndianValidators.aadhaar('234123456789')).toBe(true);
      expect(IndianValidators.aadhaar('123456789012')).toBe(true);
    });

    test('rejects invalid Aadhaar numbers', () => {
      expect(IndianValidators.aadhaar('12345678901')).toBe(false); // Too short
      expect(IndianValidators.aadhaar('1234567890123')).toBe(false); // Too long
      expect(IndianValidators.aadhaar('ABCDEFGHIJKL')).toBe(false); // Not numeric
    });

    test('handles Aadhaar with spaces', () => {
      expect(IndianValidators.aadhaar('2341 2345 6789')).toBe(true);
      expect(IndianValidators.aadhaar('1234 5678 9012')).toBe(true);
    });
  });

  describe('GST Number Validation', () => {
    test('validates correct GSTIN', () => {
      expect(IndianValidators.gstin('22AAAAA0000A1Z5')).toBe(true);
      expect(IndianValidators.gstin('27AAAAA0000A1Z5')).toBe(true);
    });

    test('rejects invalid GSTIN', () => {
      expect(IndianValidators.gstin('22AAAAA0000A1Z')).toBe(false); // Too short
      expect(IndianValidators.gstin('22AAAAA0000A1Z56')).toBe(false); // Too long
      expect(IndianValidators.gstin('2AAAAAA0000A1Z5')).toBe(false); // Invalid format
    });

    test('validates GSTIN structure', () => {
      // 2 digits + 10 chars PAN + entity number + Z + checksum
      expect(IndianValidators.gstin('22ABCDE1234F1Z5')).toBe(true);
      expect(IndianValidators.gstin('AA ABCDE1234F1Z5')).toBe(false); // Letters instead of digits
    });
  });

  describe('Vehicle Number Validation', () => {
    test('validates correct vehicle numbers', () => {
      expect(IndianValidators.vehicleNumber('DL01AB1234')).toBe(true);
      expect(IndianValidators.vehicleNumber('MH12CD5678')).toBe(true);
      expect(IndianValidators.vehicleNumber('KA03EF9012')).toBe(true);
    });

    test('rejects invalid vehicle numbers', () => {
      expect(IndianValidators.vehicleNumber('DL1AB1234')).toBe(false); // Invalid format
      expect(IndianValidators.vehicleNumber('DL01A1234')).toBe(false); // Missing letter
      expect(IndianValidators.vehicleNumber('DL01ABC1234')).toBe(false); // Extra letter
    });

    test('handles vehicle numbers with spaces/dashes', () => {
      expect(IndianValidators.vehicleNumber('DL 01 AB 1234')).toBe(true);
      expect(IndianValidators.vehicleNumber('DL-01-AB-1234')).toBe(true);
    });
  });

  describe('UPI ID Validation', () => {
    test('validates correct UPI IDs', () => {
      expect(IndianValidators.upi('user@paytm')).toBe(true);
      expect(IndianValidators.upi('john.doe@oksbi')).toBe(true);
      expect(IndianValidators.upi('9876543210@ybl')).toBe(true);
    });

    test('rejects invalid UPI IDs', () => {
      expect(IndianValidators.upi('userpaytm')).toBe(false); // Missing @
      expect(IndianValidators.upi('@paytm')).toBe(false); // Missing username
      expect(IndianValidators.upi('user@')).toBe(false); // Missing provider
    });
  });

  describe('Passport Number Validation', () => {
    test('validates correct passport numbers', () => {
      expect(IndianValidators.passport('A1234567')).toBe(true);
      expect(IndianValidators.passport('Z9876543')).toBe(true);
    });

    test('rejects invalid passport numbers', () => {
      expect(IndianValidators.passport('1A234567')).toBe(false); // Digit first
      expect(IndianValidators.passport('A123456')).toBe(false); // Too short
      expect(IndianValidators.passport('A12345678')).toBe(false); // Too long
    });
  });

  describe('Voter ID Validation', () => {
    test('validates correct voter IDs', () => {
      expect(IndianValidators.voterId('ABC1234567')).toBe(true);
      expect(IndianValidators.voterId('XYZ9876543')).toBe(true);
    });

    test('rejects invalid voter IDs', () => {
      expect(IndianValidators.voterId('AB1234567')).toBe(false); // Too short
      expect(IndianValidators.voterId('ABCD1234567')).toBe(false); // Too many letters
      expect(IndianValidators.voterId('ABC12345')).toBe(false); // Too few digits
    });
  });

  describe('Landline Number Validation', () => {
    test('validates correct landline numbers', () => {
      expect(IndianValidators.landline('01112345678')).toBe(true); // Delhi
      expect(IndianValidators.landline('02212345678')).toBe(true); // Mumbai
      expect(IndianValidators.landline('08012345678')).toBe(true); // Bangalore
    });

    test('rejects invalid landline numbers', () => {
      expect(IndianValidators.landline('1234567')).toBe(false); // Too short
      expect(IndianValidators.landline('012345678901')).toBe(false); // Too long
    });

    test('handles landline with spaces/dashes', () => {
      expect(IndianValidators.landline('011 1234 5678')).toBe(true);
      expect(IndianValidators.landline('011-1234-5678')).toBe(true);
    });
  });
});
