/**
 * OtpHelper - OTP generation and verification
 * 
 * Provides utilities for generating and verifying one-time passwords.
 */

import crypto from 'crypto';

/**
 * Generate numeric OTP
 * 
 * @param {number} length - OTP length (default: 6)
 * @returns {string} OTP code
 */
export function generateOTP(length = 6) {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10');
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  
  return Math.floor(min + crypto.randomInt(max - min + 1)).toString();
}

/**
 * Generate alphanumeric OTP
 * 
 * @param {number} length - OTP length (default: 6)
 * @returns {string} OTP code
 */
export function generateAlphanumericOTP(length = 6) {
  if (length < 4 || length > 32) {
    throw new Error('OTP length must be between 4 and 32');
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += characters.charAt(crypto.randomInt(characters.length));
  }

  return otp;
}

/**
 * Generate secure OTP with crypto
 * 
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Secure OTP
 */
export function generateSecureOTP(length = 6) {
  const bytes = crypto.randomBytes(length);
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += (bytes[i] % 10).toString();
  }

  return otp;
}

/**
 * Hash OTP for storage
 * 
 * @param {string} otp - OTP to hash
 * @param {string} secret - Secret key
 * @returns {string} Hashed OTP
 */
export function hashOTP(otp, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(otp)
    .digest('hex');
}

/**
 * Verify OTP hash
 * 
 * @param {string} otp - OTP to verify
 * @param {string} hash - Stored hash
 * @param {string} secret - Secret key
 * @returns {boolean} Valid status
 */
export function verifyOTPHash(otp, hash, secret) {
  const otpHash = hashOTP(otp, secret);
  return crypto.timingSafeEqual(
    Buffer.from(otpHash),
    Buffer.from(hash)
  );
}

/**
 * Create OTP record with expiration
 * 
 * @param {object} options - OTP options
 * @returns {object} OTP record
 */
export function createOTPRecord(options = {}) {
  const {
    length = 6,
    type = 'numeric',
    expiresIn = 300, // 5 minutes
    secret = null,
    metadata = {},
  } = options;

  let otp;
  
  switch (type) {
    case 'alphanumeric':
      otp = generateAlphanumericOTP(length);
      break;
    case 'secure':
      otp = generateSecureOTP(length);
      break;
    default:
      otp = generateOTP(length);
  }

  const record = {
    otp: secret ? hashOTP(otp, secret) : otp,
    plainOtp: otp, // Only return for immediate use, don't store
    expiresAt: new Date(Date.now() + expiresIn * 1000),
    createdAt: new Date(),
    attempts: 0,
    verified: false,
    metadata,
  };

  return record;
}

/**
 * Verify OTP record
 * 
 * @param {string} otp - OTP to verify
 * @param {object} record - Stored OTP record
 * @param {object} options - Verification options
 * @returns {object} Verification result
 */
export function verifyOTPRecord(otp, record, options = {}) {
  const {
    maxAttempts = 3,
    secret = null,
    autoIncrement = true,
  } = options;

  const result = {
    valid: false,
    expired: false,
    maxAttemptsReached: false,
    remainingAttempts: maxAttempts - record.attempts,
  };

  // Check if already verified
  if (record.verified) {
    return result;
  }

  // Increment attempts
  if (autoIncrement) {
    record.attempts += 1;
  }

  // Check max attempts
  if (record.attempts >= maxAttempts) {
    result.maxAttemptsReached = true;
    return result;
  }

  result.remainingAttempts = maxAttempts - record.attempts;

  // Check expiration
  if (new Date() > new Date(record.expiresAt)) {
    result.expired = true;
    return result;
  }

  // Verify OTP
  if (secret) {
    result.valid = verifyOTPHash(otp, record.otp, secret);
  } else {
    result.valid = otp === record.otp;
  }

  if (result.valid) {
    record.verified = true;
  }

  return result;
}

/**
 * Check if OTP is expired
 * 
 * @param {object} record - OTP record
 * @returns {boolean} Expired status
 */
export function isOTPExpired(record) {
  return new Date() > new Date(record.expiresAt);
}

/**
 * Get remaining OTP time in seconds
 * 
 * @param {object} record - OTP record
 * @returns {number} Remaining seconds
 */
export function getRemainingTime(record) {
  const remaining = Math.floor(
    (new Date(record.expiresAt) - new Date()) / 1000
  );
  return remaining > 0 ? remaining : 0;
}

/**
 * Format OTP for display
 * 
 * @param {string} otp - OTP to format
 * @param {number} groupSize - Group size (default: 3)
 * @returns {string} Formatted OTP
 */
export function formatOTP(otp, groupSize = 3) {
  const regex = new RegExp(`.{1,${groupSize}}`, 'g');
  return otp.match(regex)?.join('-') || otp;
}

/**
 * Generate time-based OTP (TOTP)
 * 
 * @param {string} secret - Secret key
 * @param {object} options - TOTP options
 * @returns {string} TOTP code
 */
export function generateTOTP(secret, options = {}) {
  const {
    window = 30, // Time window in seconds
    digits = 6,
    algorithm = 'sha1',
  } = options;

  const counter = Math.floor(Date.now() / 1000 / window);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(buffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Verify time-based OTP (TOTP)
 * 
 * @param {string} token - TOTP token
 * @param {string} secret - Secret key
 * @param {object} options - TOTP options
 * @returns {boolean} Valid status
 */
export function verifyTOTP(token, secret, options = {}) {
  const {
    window = 30,
    tolerance = 1, // Allow tokens from previous/next window
    digits = 6,
    algorithm = 'sha1',
  } = options;

  for (let i = -tolerance; i <= tolerance; i++) {
    const testTime = Date.now() + i * window * 1000;
    const testOtp = generateTOTP(secret, {
      window,
      digits,
      algorithm,
    });

    if (token === testOtp) {
      return true;
    }
  }

  return false;
}

/**
 * Generate backup codes
 * 
 * @param {number} count - Number of codes (default: 10)
 * @param {number} length - Code length (default: 8)
 * @returns {string[]} Backup codes
 */
export function generateBackupCodes(count = 10, length = 8) {
  const codes = [];

  for (let i = 0; i < count; i++) {
    codes.push(generateAlphanumericOTP(length));
  }

  return codes;
}

/**
 * OtpHelper class for OOP approach
 */
export class OtpHelper {
  constructor(secret, options = {}) {
    this.secret = secret;
    this.options = options;
  }

  generate(length = 6, type = 'numeric') {
    switch (type) {
      case 'alphanumeric':
        return generateAlphanumericOTP(length);
      case 'secure':
        return generateSecureOTP(length);
      default:
        return generateOTP(length);
    }
  }

  create(options = {}) {
    return createOTPRecord({
      ...this.options,
      ...options,
      secret: this.secret,
    });
  }

  verify(otp, record, options = {}) {
    return verifyOTPRecord(otp, record, {
      ...this.options,
      ...options,
      secret: this.secret,
    });
  }

  hash(otp) {
    return hashOTP(otp, this.secret);
  }

  verifyHash(otp, hash) {
    return verifyOTPHash(otp, hash, this.secret);
  }

  generateTOTP(options = {}) {
    return generateTOTP(this.secret, { ...this.options, ...options });
  }

  verifyTOTP(token, options = {}) {
    return verifyTOTP(token, this.secret, { ...this.options, ...options });
  }

  static isExpired = isOTPExpired;
  static getRemainingTime = getRemainingTime;
  static formatOTP = formatOTP;
  static generateBackupCodes = generateBackupCodes;
}

export default OtpHelper;
