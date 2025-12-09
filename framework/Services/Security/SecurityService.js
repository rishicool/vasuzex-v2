/**
 * Security Service
 * Handles JWT, OTP, hashing, and other security-related operations
 * Laravel-inspired security utilities for Node.js
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class SecurityService {
  constructor(config = {}) {
    this.jwtSecret = config.jwtSecret || process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = config.jwtExpiresIn || process.env.JWT_EXPIRES_IN || '7d';
    this.otpLength = config.otpLength || 6;
    this.otpExpiryMinutes = config.otpExpiryMinutes || 10;
    this.bcryptRounds = config.bcryptRounds || 10;
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Data to encode in token
   * @param {string} secret - Optional JWT secret (uses config if not provided)
   * @param {string|number} expiresIn - Optional expiry time (uses config if not provided)
   * @returns {string} JWT token
   */
  generateToken(payload, secret = null, expiresIn = null) {
    const jwtSecret = secret || this.jwtSecret;
    const jwtExpiresIn = expiresIn || this.jwtExpiresIn;

    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @param {string} secret - Optional JWT secret (uses config if not provided)
   * @returns {Object|null} Decoded payload or null if invalid
   */
  verifyToken(token, secret = null) {
    const jwtSecret = secret || this.jwtSecret;
    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return null;
    }
  }

  /**
   * Decode JWT token without verification
   * @param {string} token - JWT token to decode
   * @returns {Object|null} Decoded payload or null if invalid
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate numeric OTP
   * @param {number} length - OTP length (default: 6)
   * @returns {string} OTP code
   */
  generateOtp(length = this.otpLength) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Generate alphanumeric OTP
   * @param {number} length - OTP length
   * @returns {string} Alphanumeric OTP
   */
  generateAlphanumericOtp(length = this.otpLength) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return otp;
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} Match result
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate random string
   * @param {number} length - String length
   * @returns {string} Random string
   */
  generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  /**
   * Generate UUID v4
   * @returns {string} UUID
   */
  generateUuid() {
    return crypto.randomUUID();
  }

  /**
   * Hash string using SHA256
   * @param {string} data - Data to hash
   * @returns {string} Hash
   */
  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash string using MD5
   * @param {string} data - Data to hash
   * @returns {string} Hash
   */
  md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   * @param {string} data - Data to sign
   * @param {string} secret - Secret key
   * @param {string} algorithm - Hash algorithm (default: sha256)
   * @returns {string} Signature
   */
  createHmac(data, secret, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param {string} data - Original data
   * @param {string} signature - Signature to verify
   * @param {string} secret - Secret key
   * @param {string} algorithm - Hash algorithm
   * @returns {boolean} Verification result
   */
  verifyHmac(data, signature, secret, algorithm = 'sha256') {
    const expectedSignature = this.createHmac(data, secret, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Encrypt data using AES-256-CBC
   * @param {string} data - Data to encrypt
   * @param {string} key - Encryption key (32 bytes)
   * @returns {string} Encrypted data (iv:encrypted format)
   */
  encrypt(data, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data using AES-256-CBC
   * @param {string} encrypted - Encrypted data (iv:encrypted format)
   * @param {string} key - Encryption key (32 bytes)
   * @returns {string} Decrypted data
   */
  decrypt(encrypted, key) {
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Mask phone number for display
   * @param {string} phone - Phone number
   * @returns {string} Masked phone
   */
  maskPhone(phone) {
    if (phone.length !== 10) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }

  /**
   * Mask email for display
   * @param {string} email - Email address
   * @returns {string} Masked email
   */
  maskEmail(email) {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;

    const maskedUsername =
      username.length > 2
        ? `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
        : username;

    return `${maskedUsername}@${domain}`;
  }

  /**
   * Generate OTP with expiry timestamp
   * @param {number} length - OTP length
   * @returns {Object} {otp, expiresAt}
   */
  generateOtpWithExpiry(length = this.otpLength) {
    const otp = this.generateOtp(length);
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);
    return { otp, expiresAt };
  }

  /**
   * Verify OTP with expiry check
   * @param {string} inputOtp - User input OTP
   * @param {string} storedOtp - Stored OTP
   * @param {Date} expiresAt - Expiry timestamp
   * @returns {Object} {valid, expired}
   */
  verifyOtp(inputOtp, storedOtp, expiresAt) {
    const now = new Date();
    const expired = now > new Date(expiresAt);
    const valid = inputOtp === storedOtp;

    return { valid: valid && !expired, expired };
  }
}

export default SecurityService;
