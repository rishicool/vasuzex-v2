/**
 * Hash Manager
 * Laravel-inspired hash manager with multiple hasher support
 */

import { BcryptHasher } from './BcryptHasher.js';

export class HashManager {
  constructor(app) {
    this.app = app;
    this.drivers = {};
    this.customCreators = {};
  }

  /**
   * Get a hash driver instance
   */
  driver(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.drivers[name]) {
      this.drivers[name] = this.resolve(name);
    }

    return this.drivers[name];
  }

  /**
   * Resolve the given driver
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (this.customCreators[name]) {
      return this.callCustomCreator(name);
    }

    const driverMethod = `create${this.capitalize(name)}Driver`;

    if (typeof this[driverMethod] === 'function') {
      return this[driverMethod](config);
    }

    throw new Error(`Driver [${name}] is not supported.`);
  }

  /**
   * Call a custom driver creator
   */
  callCustomCreator(name) {
    return this.customCreators[name](this.app);
  }

  /**
   * Create an instance of the Bcrypt hash Driver
   */
  createBcryptDriver(config = {}) {
    return new BcryptHasher(config);
  }

  /**
   * Get the hash driver configuration
   */
  getConfig(name) {
    const hashConfig = this.app.config('hashing', {});
    return hashConfig[name] || {};
  }

  /**
   * Get the default hash driver name
   */
  getDefaultDriver() {
    return this.app.config('hashing.driver', 'bcrypt');
  }

  /**
   * Register a custom driver creator
   */
  extend(name, callback) {
    this.customCreators[name] = callback;
    return this;
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Proxy common hash methods to default driver
  async make(value, options = {}) {
    return await this.driver().make(value, options);
  }

  async check(value, hashedValue, options = {}) {
    return await this.driver().check(value, hashedValue, options);
  }

  needsRehash(hashedValue, options = {}) {
    return this.driver().needsRehash(hashedValue, options);
  }

  info(hashedValue) {
    return this.driver().info(hashedValue);
  }
}

export default HashManager;
