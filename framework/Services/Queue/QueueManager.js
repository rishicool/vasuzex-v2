/**
 * Queue Manager
 * Laravel-inspired queue manager with multiple connection support
 */

import { DatabaseQueue } from './Connectors/DatabaseQueue.js';
import { RedisQueue } from './Connectors/RedisQueue.js';
import { SyncQueue } from './Connectors/SyncQueue.js';

export class QueueManager {
  constructor(app) {
    this.app = app;
    this.connections = {};
    this.connectors = {};
  }

  /**
   * Resolve a queue connection instance
   */
  connection(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.connections[name]) {
      this.connections[name] = this.resolve(name);
      this.connections[name].setConnectionName(name);
    }

    return this.connections[name];
  }

  /**
   * Resolve a queue connection
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`Queue connection [${name}] is not defined.`);
    }

    if (this.connectors[config.driver]) {
      return this.callCustomCreator(config);
    }

    const driverMethod = `create${this.capitalize(config.driver)}Driver`;

    if (typeof this[driverMethod] === 'function') {
      return this[driverMethod](config);
    }

    throw new Error(`Driver [${config.driver}] is not supported.`);
  }

  /**
   * Call a custom queue creator
   */
  callCustomCreator(config) {
    return this.connectors[config.driver](this.app, config);
  }

  /**
   * Create an instance of the sync queue driver
   */
  createSyncDriver(config) {
    return new SyncQueue();
  }

  /**
   * Create an instance of the database queue driver
   */
  createDatabaseDriver(config) {
    const database = this.app.make('db');

    return new DatabaseQueue(
      database,
      config.table || 'jobs',
      config.queue || 'default',
      config.retry_after || 60
    );
  }

  /**
   * Create an instance of the Redis queue driver
   */
  createRedisDriver(config) {
    const redis = this.app.make('redis');
    const connection = redis.connection(config.connection || 'default');

    return new RedisQueue(
      connection,
      config.queue || 'default',
      config.connection || 'default',
      config.retry_after || 60
    );
  }

  /**
   * Get the queue connection configuration
   */
  getConfig(name) {
    const queueConfig = this.app.config('queue', {});
    return queueConfig.connections?.[name] || null;
  }

  /**
   * Get the default queue connection name
   */
  getDefaultDriver() {
    return this.app.config('queue.default', 'sync');
  }

  /**
   * Set the default queue connection name
   */
  setDefaultDriver(name) {
    this.app.config.set('queue.default', name);
  }

  /**
   * Register a custom queue connector
   */
  addConnector(driver, resolver) {
    this.connectors[driver] = resolver;
    return this;
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Proxy common queue methods to default connection
  async push(job, data = {}, queue = null) {
    return await this.connection().push(job, data, queue);
  }

  async later(delay, job, data = {}, queue = null) {
    return await this.connection().later(delay, job, data, queue);
  }

  async bulk(jobs, data = {}, queue = null) {
    return await this.connection().bulk(jobs, data, queue);
  }

  async pop(queue = null) {
    return await this.connection().pop(queue);
  }

  async size(queue = null) {
    return await this.connection().size(queue);
  }
}

export default QueueManager;
