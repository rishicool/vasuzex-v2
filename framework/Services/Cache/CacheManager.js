/**
 * Cache Manager
 * Laravel-inspired cache manager with multiple store support
 */

import { Repository } from './Repository.js';
import { ArrayStore } from './Stores/ArrayStore.js';
import { RedisStore } from './Stores/RedisStore.js';

export class CacheManager {
  constructor(app) {
    this.app = app;
    this.stores = {};
    this.customCreators = {};
  }

  /**
   * Get a cache store instance
   */
  store(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.stores[name]) {
      this.stores[name] = this.resolve(name);
    }

    return this.stores[name];
  }

  /**
   * Get a cache driver instance (alias for store)
   */
  driver(name = null) {
    return this.store(name);
  }

  /**
   * Resolve the given store
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`Cache store [${name}] is not defined.`);
    }

    if (this.customCreators[config.driver]) {
      return this.callCustomCreator(config);
    }

    const driverMethod = `create${this.capitalize(config.driver)}Driver`;

    if (typeof this[driverMethod] === 'function') {
      return this[driverMethod](config);
    }

    throw new Error(`Driver [${config.driver}] is not supported.`);
  }

  /**
   * Call a custom driver creator
   */
  callCustomCreator(config) {
    return this.customCreators[config.driver](this.app, config);
  }

  /**
   * Create an instance of the array cache driver
   */
  createArrayDriver(config) {
    return this.repository(new ArrayStore({
      prefix: this.getPrefix(config)
    }));
  }

  /**
   * Create an instance of the Redis cache driver
   */
  createRedisDriver(config) {
    const redis = this.app.make('redis');
    const connection = redis.connection(config.connection || 'cache');

    return this.repository(new RedisStore(connection, {
      prefix: this.getPrefix(config)
    }));
  }

  /**
   * Create a new cache repository with the given implementation
   */
  repository(store) {
    return new Repository(store);
  }

  /**
   * Get the cache prefix
   */
  getPrefix(config) {
    return config.prefix || 'cache:';
  }

  /**
   * Get the cache connection configuration
   */
  getConfig(name) {
    const cacheConfig = this.app.config('cache', {});
    return cacheConfig.stores?.[name] || null;
  }

  /**
   * Get the default cache driver name
   */
  getDefaultDriver() {
    return this.app.config('cache.default', 'array');
  }

  /**
   * Set the default cache driver name
   */
  setDefaultDriver(name) {
    this.app.config.set('cache.default', name);
  }

  /**
   * Unset the given driver instances
   */
  purge(name = null) {
    if (name) {
      delete this.stores[name];
    } else {
      this.stores = {};
    }
  }

  /**
   * Register a custom driver creator Closure
   */
  extend(driver, callback) {
    this.customCreators[driver] = callback;
    return this;
  }

  /**
   * Dynamically call the default driver instance
   */
  async __call(method, parameters) {
    return await this.store()[method](...parameters);
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Proxy common cache methods to default store
  async get(key, defaultValue = null) {
    return await this.store().get(key, defaultValue);
  }

  async put(key, value, ttl = null) {
    return await this.store().put(key, value, ttl);
  }

  async has(key) {
    return await this.store().has(key);
  }

  async forget(key) {
    return await this.store().forget(key);
  }

  async flush() {
    return await this.store().flush();
  }

  async remember(key, ttl, callback) {
    return await this.store().remember(key, ttl, callback);
  }

  async rememberForever(key, callback) {
    return await this.store().rememberForever(key, callback);
  }
}

export default CacheManager;
