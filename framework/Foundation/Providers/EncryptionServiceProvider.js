/**
 * Encryption Service Provider
 * Laravel-inspired encryption service provider
 */

import { Encrypter } from '../../Services/Encryption/Encrypter.js';

export class EncryptionServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('encrypter', () => {
      const key = this.app.config('app.key');
      const cipher = this.app.config('app.cipher', 'aes-256-cbc');

      if (!key) {
        throw new Error('No application encryption key has been specified.');
      }

      return new Encrypter(key, cipher);
    });

    // Alias for convenience
    this.app.alias('encrypter', 'Encrypter');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Encrypter is ready to use
  }
}

export default EncryptionServiceProvider;
