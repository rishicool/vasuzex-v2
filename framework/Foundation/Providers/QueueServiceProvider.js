/**
 * Queue Service Provider
 * Laravel-inspired queue service provider
 */

import { QueueManager } from '../../Services/Queue/QueueManager.js';

export class QueueServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('queue', () => {
      return new QueueManager(this.app);
    });

    // Alias for convenience
    this.app.alias('queue', 'QueueManager');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Queue is ready to use
  }
}

export default QueueServiceProvider;
