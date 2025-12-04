/**
 * Validation Service Provider
 * Laravel-inspired validation service provider
 */

import { ValidationFactory } from '../../Services/Validation/ValidationFactory.js';

export class ValidationServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('validator', () => {
      return new ValidationFactory();
    });

    // Alias for convenience
    this.app.alias('validator', 'ValidationFactory');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Validator is ready to use
  }
}

export default ValidationServiceProvider;
