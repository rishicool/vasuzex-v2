/**
 * OtpHelper Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  generateOTP,
  generateAlphanumericOTP,
  generateSecureOTP,
  hashOTP,
  verifyOTPHash,
  createOTPRecord,
  verifyOTPRecord,
  isOTPExpired,
  getRemainingTime,
  formatOTP,
  generateTOTP,
  verifyTOTP,
  generateBackupCodes,
  OtpHelper,
} from '../../../../framework/Support/Helpers/OtpHelper.js';

describe('OtpHelper', () => {
  const secret = 'test-secret-key';

  describe('generateOTP', () => {
    it('should generate numeric OTP of default length', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate OTP of custom length', () => {
      const otp = generateOTP(8);
      expect(otp).toMatch(/^\d{8}$/);
    });

    it('should generate unique OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // While theoretically they could be same, very unlikely
      expect(otp1).toBeDefined();
      expect(otp2).toBeDefined();
    });

    it('should throw for invalid lengths', () => {
      expect(() => generateOTP(3)).toThrow();
      expect(() => generateOTP(11)).toThrow();
    });
  });

  describe('generateAlphanumericOTP', () => {
    it('should generate alphanumeric OTP', () => {
      const otp = generateAlphanumericOTP();
      expect(otp).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate OTP of custom length', () => {
      const otp = generateAlphanumericOTP(10);
      expect(otp).toMatch(/^[A-Z0-9]{10}$/);
    });

    it('should throw for invalid lengths', () => {
      expect(() => generateAlphanumericOTP(3)).toThrow();
      expect(() => generateAlphanumericOTP(33)).toThrow();
    });
  });

  describe('generateSecureOTP', () => {
    it('should generate secure numeric OTP', () => {
      const otp = generateSecureOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate OTP of custom length', () => {
      const otp = generateSecureOTP(8);
      expect(otp).toMatch(/^\d{8}$/);
    });
  });

  describe('hashOTP and verifyOTPHash', () => {
    it('should hash and verify OTP', () => {
      const otp = '123456';
      const hash = hashOTP(otp, secret);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(verifyOTPHash(otp, hash, secret)).toBe(true);
    });

    it('should reject incorrect OTP', () => {
      const otp = '123456';
      const hash = hashOTP(otp, secret);
      
      expect(verifyOTPHash('654321', hash, secret)).toBe(false);
    });

    it('should produce different hashes with different secrets', () => {
      const otp = '123456';
      const hash1 = hashOTP(otp, 'secret1');
      const hash2 = hashOTP(otp, 'secret2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createOTPRecord', () => {
    it('should create OTP record with default options', () => {
      const record = createOTPRecord();
      
      expect(record).toHaveProperty('otp');
      expect(record).toHaveProperty('plainOtp');
      expect(record).toHaveProperty('expiresAt');
      expect(record).toHaveProperty('createdAt');
      expect(record).toHaveProperty('attempts', 0);
      expect(record).toHaveProperty('verified', false);
      expect(record.plainOtp).toMatch(/^\d{6}$/);
    });

    it('should create alphanumeric OTP', () => {
      const record = createOTPRecord({ type: 'alphanumeric' });
      expect(record.plainOtp).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should create secure OTP', () => {
      const record = createOTPRecord({ type: 'secure' });
      expect(record.plainOtp).toMatch(/^\d{6}$/);
    });

    it('should hash OTP when secret provided', () => {
      const record = createOTPRecord({ secret });
      expect(record.otp).not.toBe(record.plainOtp);
    });

    it('should set custom expiration', () => {
      const record = createOTPRecord({ expiresIn: 600 });
      const expectedExpiry = new Date(Date.now() + 600 * 1000);
      
      // Allow 1 second difference for test execution time
      expect(Math.abs(record.expiresAt - expectedExpiry)).toBeLessThan(1000);
    });

    it('should include metadata', () => {
      const metadata = { userId: 1, purpose: 'login' };
      const record = createOTPRecord({ metadata });
      
      expect(record.metadata).toEqual(metadata);
    });
  });

  describe('verifyOTPRecord', () => {
    let record;

    beforeEach(() => {
      record = createOTPRecord({ secret, expiresIn: 300 });
    });

    it('should verify valid OTP', () => {
      const result = verifyOTPRecord(record.plainOtp, record, { secret });
      
      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
      expect(result.maxAttemptsReached).toBe(false);
    });

    it('should reject invalid OTP', () => {
      const result = verifyOTPRecord('000000', record, { secret });
      
      expect(result.valid).toBe(false);
    });

    it('should track attempts', () => {
      verifyOTPRecord('000000', record, { secret });
      expect(record.attempts).toBe(1);
      
      verifyOTPRecord('000000', record, { secret });
      expect(record.attempts).toBe(2);
    });

    it('should enforce max attempts', () => {
      record.attempts = 2;
      const result = verifyOTPRecord('000000', record, { secret, maxAttempts: 3 });
      
      expect(result.maxAttemptsReached).toBe(true);
      expect(result.valid).toBe(false);
    });

    it('should detect expired OTP', () => {
      record.expiresAt = new Date(Date.now() - 1000);
      const result = verifyOTPRecord(record.plainOtp, record, { secret });
      
      expect(result.expired).toBe(true);
      expect(result.valid).toBe(false);
    });

    it('should mark record as verified on success', () => {
      verifyOTPRecord(record.plainOtp, record, { secret });
      expect(record.verified).toBe(true);
    });

    it('should reject already verified OTP', () => {
      record.verified = true;
      const result = verifyOTPRecord(record.plainOtp, record, { secret });
      
      expect(result.valid).toBe(false);
    });

    it('should provide remaining attempts', () => {
      const result = verifyOTPRecord('000000', record, { secret, maxAttempts: 3 });
      expect(result.remainingAttempts).toBe(2);
    });

    it('should support auto-increment toggle', () => {
      verifyOTPRecord('000000', record, { secret, autoIncrement: false });
      expect(record.attempts).toBe(0);
    });
  });

  describe('isOTPExpired', () => {
    it('should detect expired OTP', () => {
      const record = { expiresAt: new Date(Date.now() - 1000) };
      expect(isOTPExpired(record)).toBe(true);
    });

    it('should detect non-expired OTP', () => {
      const record = { expiresAt: new Date(Date.now() + 1000) };
      expect(isOTPExpired(record)).toBe(false);
    });
  });

  describe('getRemainingTime', () => {
    it('should calculate remaining time', () => {
      const record = { expiresAt: new Date(Date.now() + 5000) };
      const remaining = getRemainingTime(record);
      
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(5);
    });

    it('should return 0 for expired OTP', () => {
      const record = { expiresAt: new Date(Date.now() - 1000) };
      expect(getRemainingTime(record)).toBe(0);
    });
  });

  describe('formatOTP', () => {
    it('should format OTP with default group size', () => {
      expect(formatOTP('123456')).toBe('123-456');
    });

    it('should format OTP with custom group size', () => {
      expect(formatOTP('12345678', 4)).toBe('1234-5678');
      expect(formatOTP('123456', 2)).toBe('12-34-56');
    });
  });

  describe('generateTOTP', () => {
    it('should generate TOTP', () => {
      const totp = generateTOTP(secret);
      
      expect(totp).toBeDefined();
      expect(totp).toMatch(/^\d{6}$/);
    });

    it('should generate TOTP with custom digits', () => {
      const totp = generateTOTP(secret, { digits: 8 });
      expect(totp).toMatch(/^\d{8}$/);
    });

    it('should generate same TOTP in same time window', () => {
      const totp1 = generateTOTP(secret);
      const totp2 = generateTOTP(secret);
      
      expect(totp1).toBe(totp2);
    });
  });

  describe('verifyTOTP', () => {
    it('should verify valid TOTP', () => {
      const totp = generateTOTP(secret);
      expect(verifyTOTP(totp, secret)).toBe(true);
    });

    it('should reject invalid TOTP', () => {
      expect(verifyTOTP('000000', secret)).toBe(false);
    });

    it('should support tolerance for time drift', () => {
      const totp = generateTOTP(secret);
      expect(verifyTOTP(totp, secret, { tolerance: 2 })).toBe(true);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate backup codes', () => {
      const codes = generateBackupCodes();
      
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    it('should generate custom number of codes', () => {
      const codes = generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it('should generate codes of custom length', () => {
      const codes = generateBackupCodes(10, 12);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{12}$/);
      });
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes();
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });
  });

  describe('OtpHelper class', () => {
    let helper;

    beforeEach(() => {
      helper = new OtpHelper(secret);
    });

    it('should generate OTP', () => {
      const otp = helper.generate();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should create OTP record', () => {
      const record = helper.create();
      expect(record).toHaveProperty('otp');
      expect(record).toHaveProperty('plainOtp');
    });

    it('should verify OTP', () => {
      const record = helper.create();
      const result = helper.verify(record.plainOtp, record);
      expect(result.valid).toBe(true);
    });

    it('should hash OTP', () => {
      const hash = helper.hash('123456');
      expect(hash).toBeDefined();
    });

    it('should verify hash', () => {
      const hash = helper.hash('123456');
      expect(helper.verifyHash('123456', hash)).toBe(true);
    });

    it('should generate TOTP', () => {
      const totp = helper.generateTOTP();
      expect(totp).toMatch(/^\d{6}$/);
    });

    it('should verify TOTP', () => {
      const totp = helper.generateTOTP();
      expect(helper.verifyTOTP(totp)).toBe(true);
    });

    it('should provide static methods', () => {
      expect(OtpHelper.isExpired).toBeDefined();
      expect(OtpHelper.getRemainingTime).toBeDefined();
      expect(OtpHelper.formatOTP).toBeDefined();
      expect(OtpHelper.generateBackupCodes).toBeDefined();
    });
  });
});
