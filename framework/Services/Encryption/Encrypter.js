/**
 * Encrypter
 * Laravel-inspired encryption service using AES
 */

import crypto from 'crypto';

export class Encrypter {
  constructor(key, cipher = 'aes-256-cbc') {
    this.key = key;
    this.cipher = cipher;

    if (!this.supported(key, cipher)) {
      throw new Error('The only supported ciphers are aes-128-cbc and aes-256-cbc with the correct key lengths.');
    }
  }

  /**
   * Determine if the given key and cipher combination is valid
   */
  supported(key, cipher) {
    const length = Buffer.byteLength(key, 'utf8');
    return (cipher === 'aes-128-cbc' && length === 16) ||
           (cipher === 'aes-256-cbc' && length === 32);
  }

  /**
   * Create a new encryption key for the given cipher
   */
  static generateKey(cipher = 'aes-256-cbc') {
    const length = cipher === 'aes-128-cbc' ? 16 : 32;
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Encrypt the given value
   */
  encrypt(value, serialize = true) {
    const iv = crypto.randomBytes(16);

    const data = serialize ? JSON.stringify(value) : value;

    const cipher = crypto.createCipheriv(this.cipher, Buffer.from(this.key, 'base64'), iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const mac = this.hash(iv.toString('base64'), encrypted);

    const payload = {
      iv: iv.toString('base64'),
      value: encrypted,
      mac
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Encrypt a string without serialization
   */
  encryptString(value) {
    return this.encrypt(value, false);
  }

  /**
   * Decrypt the given value
   */
  decrypt(payload, unserialize = true) {
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    const iv = Buffer.from(decoded.iv, 'base64');

    if (!this.validMac(decoded)) {
      throw new Error('The MAC is invalid.');
    }

    const decipher = crypto.createDecipheriv(this.cipher, Buffer.from(this.key, 'base64'), iv);
    let decrypted = decipher.update(decoded.value, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return unserialize ? JSON.parse(decrypted) : decrypted;
  }

  /**
   * Decrypt a string without unserialization
   */
  decryptString(payload) {
    return this.decrypt(payload, false);
  }

  /**
   * Create a MAC for the given value
   */
  hash(iv, value) {
    return crypto
      .createHmac('sha256', Buffer.from(this.key, 'base64'))
      .update(iv + value)
      .digest('hex');
  }

  /**
   * Determine if the MAC for the given payload is valid
   */
  validMac(payload) {
    const calculated = this.hash(payload.iv, payload.value);
    return crypto.timingSafeEqual(
      Buffer.from(calculated, 'hex'),
      Buffer.from(payload.mac, 'hex')
    );
  }

  /**
   * Get the encryption key
   */
  getKey() {
    return this.key;
  }
}

export default Encrypter;
