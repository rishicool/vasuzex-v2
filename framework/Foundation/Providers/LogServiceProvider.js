/**
 * Log Service Provider
 * Laravel-inspired log service provider
 */

import { LogManager } from '../../Services/Log/LogManager.js';

export class LogServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('log', () => {
      return new LogManager(this.app);
    });

    // Alias for convenience
    this.app.alias('log', 'LogManager');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Log is ready to use
  }
}

export default LogServiceProvider;
