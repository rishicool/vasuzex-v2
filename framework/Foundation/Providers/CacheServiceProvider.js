/**
 * Cache Service Provider
 * Laravel-inspired cache service provider
 */

import { CacheManager } from '../../Services/Cache/CacheManager.js';

export class CacheServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('cache', () => {
      return new CacheManager(this.app);
    });

    // Alias for convenience
    this.app.alias('cache', 'CacheManager');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Cache is ready to use
  }
}

export default CacheServiceProvider;
