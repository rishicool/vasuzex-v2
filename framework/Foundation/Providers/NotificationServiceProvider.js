/**
 * Notification Service Provider
 * Laravel-inspired notification service provider
 */

import { NotificationManager } from '../../Services/Notification/NotificationManager.js';

export class NotificationServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('notification', () => {
      return new NotificationManager(this.app);
    });

    // Alias for convenience
    this.app.alias('notification', 'NotificationManager');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Notification is ready to use
  }
}

export default NotificationServiceProvider;
