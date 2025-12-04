/**
 * Session Service Provider
 * Laravel-inspired session service provider
 */

import { SessionManager } from '../../Services/Session/SessionManager.js';

export class SessionServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('session', () => {
      return new SessionManager(this.app);
    });

    // Alias for convenience
    this.app.alias('session', 'SessionManager');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Session is ready to use
  }
}

export default SessionServiceProvider;
