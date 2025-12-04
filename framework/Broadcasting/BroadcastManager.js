/**
 * Broadcasting Manager
 * Laravel-inspired broadcasting for real-time events
 */

export class BroadcastManager {
  constructor(app) {
    this.app = app;
    this.drivers = new Map();
    this.customCreators = new Map();
  }

  /**
   * Get a broadcaster instance
   */
  driver(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.drivers.has(name)) {
      this.drivers.set(name, this.resolve(name));
    }

    return this.drivers.get(name);
  }

  /**
   * Get the default broadcaster
   */
  connection(name = null) {
    return this.driver(name);
  }

  /**
   * Resolve a broadcaster instance
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (this.customCreators.has(config.driver)) {
      return this.customCreators.get(config.driver)(this.app, config);
    }

    const method = `create${this.studly(config.driver)}Driver`;

    if (typeof this[method] !== 'function') {
      throw new Error(`Driver [${config.driver}] is not supported.`);
    }

    return this[method](config);
  }

  /**
   * Create Pusher driver
   */
  createPusherDriver(config) {
    const { PusherBroadcaster } = require('./Broadcasters/PusherBroadcaster.js');
    return new PusherBroadcaster(config);
  }

  /**
   * Create Redis driver
   */
  createRedisDriver(config) {
    const { RedisBroadcaster } = require('./Broadcasters/RedisBroadcaster.js');
    const redis = this.app.make('redis');
    return new RedisBroadcaster(redis, config);
  }

  /**
   * Create Log driver
   */
  createLogDriver(config) {
    const { LogBroadcaster } = require('./Broadcasters/LogBroadcaster.js');
    const logger = this.app.make('log');
    return new LogBroadcaster(logger);
  }

  /**
   * Create Null driver
   */
  createNullDriver(config) {
    const { NullBroadcaster } = require('./Broadcasters/NullBroadcaster.js');
    return new NullBroadcaster();
  }

  /**
   * Queue an event for broadcast
   */
  async queue(event) {
    const queue = this.app.make('queue');
    
    const queueName = event.broadcastQueue || event.queue || null;
    const connection = event.connection || null;

    await queue.connection(connection).push('BroadcastEvent', {
      event: event.constructor.name,
      data: event
    }, queueName);
  }

  /**
   * Broadcast event immediately
   */
  async broadcast(event, channels = null) {
    channels = channels || event.broadcastOn();
    const data = event.broadcastWith ? event.broadcastWith() : event;
    const eventName = event.broadcastAs ? event.broadcastAs() : event.constructor.name;

    const driver = this.driver();
    await driver.broadcast(this.formatChannels(channels), eventName, data);
  }

  /**
   * Format channels array
   */
  formatChannels(channels) {
    if (!Array.isArray(channels)) {
      return [channels];
    }
    return channels;
  }

  /**
   * Get configuration for broadcaster
   */
  getConfig(name) {
    const config = this.app.make('config');
    return config.get(`broadcasting.connections.${name}`);
  }

  /**
   * Get default broadcaster name
   */
  getDefaultDriver() {
    const config = this.app.make('config');
    return config.get('broadcasting.default', 'pusher');
  }

  /**
   * Register a custom driver creator
   */
  extend(driver, callback) {
    this.customCreators.set(driver, callback);
    return this;
  }

  /**
   * Convert string to StudlyCase
   */
  studly(str) {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (_, char) => char.toUpperCase());
  }
}

export default BroadcastManager;
