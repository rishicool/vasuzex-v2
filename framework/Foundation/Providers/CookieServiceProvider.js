/**
 * Cookie Service Provider
 * Laravel-inspired cookie service provider
 */

import { CookieJar } from '../../Services/Cookie/CookieJar.js';

export class CookieServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('cookie', () => {
      const encrypter = this.app.make('encrypter');
      return new CookieJar(encrypter);
    });

    // Alias for convenience
    this.app.alias('cookie', 'CookieJar');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Cookie is ready to use
  }
}

export default CookieServiceProvider;
