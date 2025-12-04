/**
 * Hash Service Provider
 * Laravel-inspired hash service provider
 */

import { HashManager } from '../../Services/Hash/HashManager.js';

export class HashServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('hash', () => {
      return new HashManager(this.app);
    });

    // Alias for convenience
    this.app.alias('hash', 'HashManager');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Hash is ready to use
  }
}

export default HashServiceProvider;
