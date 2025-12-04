/**
 * AuthServiceProvider
 * Register Authentication service
 */

import { AuthManager } from '../../Auth/AuthManager.js';

export class AuthServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('auth', (app) => {
      return new AuthManager(app);
    });

    this.app.alias('auth', 'AuthManager');
  }

  boot() {
    // Boot logic if needed
  }
}

export default AuthServiceProvider;
