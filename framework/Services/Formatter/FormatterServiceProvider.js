/**
 * Formatter Service Provider
 */

import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { FormatterManager } from './FormatterManager.js';

export class FormatterServiceProvider extends ServiceProvider {
  /**
   * Register the service provider
   */
  register() {
    this.app.singleton('formatter', (app) => {
      return new FormatterManager(app);
    });
  }

  /**
   * Bootstrap the service provider
   */
  boot() {
    // Optionally add custom formatters
  }
}

export default FormatterServiceProvider;
