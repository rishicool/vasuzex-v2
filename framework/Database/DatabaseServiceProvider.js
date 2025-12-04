/**
 * Database Service Provider
 * Registers database services and model components
 */

import ServiceProvider from '../Support/ServiceProvider.js';
import Model from './Model.js';

export class DatabaseServiceProvider extends ServiceProvider {
  /**
   * Register services
   */
  register() {
    // Database connection is registered by GuruORM
  }

  /**
   * Bootstrap services
   */
  async boot() {
    // Set event dispatcher on Model
    if (this.app.has('events')) {
      const dispatcher = this.app.make('events');
      Model.setEventDispatcher(dispatcher);
    }

    // Set database connection on Model
    if (this.app.has('db')) {
      const connection = this.app.make('db');
      Model.setConnection(connection);
    }
  }
}

export default DatabaseServiceProvider;
