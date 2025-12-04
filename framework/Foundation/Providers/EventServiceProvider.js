/**
 * Event Service Provider
 * Laravel-inspired event service provider
 */

import { EventDispatcher } from '../../Services/Events/EventDispatcher.js';

export class EventServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service provider
   */
  async register() {
    this.app.singleton('events', () => {
      return new EventDispatcher(this.app);
    });

    // Alias for convenience
    this.app.alias('events', 'EventDispatcher');
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Events is ready to use
  }
}

export default EventServiceProvider;
