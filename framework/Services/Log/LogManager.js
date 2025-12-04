/**
 * Log Manager
 * Laravel-inspired log manager with multiple channel support
 */

import { ConsoleLogger } from './Drivers/ConsoleLogger.js';
import { FileLogger } from './Drivers/FileLogger.js';

export class LogManager {
  constructor(app) {
    this.app = app;
    this.channels = {};
    this.customCreators = {};
  }

  /**
   * Get a log channel instance
   */
  channel(name = null) {
    return this.driver(name);
  }

  /**
   * Get a log driver instance
   */
  driver(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.channels[name]) {
      this.channels[name] = this.resolve(name);
    }

    return this.channels[name];
  }

  /**
   * Create a new, on-demand stack channel
   */
  stack(channels, channel = null) {
    return this.createStackDriver({ channels, channel });
  }

  /**
   * Resolve the given channel
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`Log channel [${name}] is not defined.`);
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
   * Create console driver
   */
  createConsoleDriver(config) {
    return new ConsoleLogger({
      level: config.level || 'debug'
    });
  }

  /**
   * Create file driver
   */
  createFileDriver(config) {
    return new FileLogger({
      path: config.path || 'storage/logs',
      filename: config.filename || 'app.log',
      level: config.level || 'debug',
      days: config.days || 7
    });
  }

  /**
   * Create stack driver
   */
  createStackDriver(config) {
    const channels = config.channels.map(name => this.channel(name));

    return {
      emergency: (message, context) => channels.forEach(c => c.emergency(message, context)),
      alert: (message, context) => channels.forEach(c => c.alert(message, context)),
      critical: (message, context) => channels.forEach(c => c.critical(message, context)),
      error: (message, context) => channels.forEach(c => c.error(message, context)),
      warning: (message, context) => channels.forEach(c => c.warning(message, context)),
      notice: (message, context) => channels.forEach(c => c.notice(message, context)),
      info: (message, context) => channels.forEach(c => c.info(message, context)),
      debug: (message, context) => channels.forEach(c => c.debug(message, context)),
      log: (level, message, context) => channels.forEach(c => c.log(level, message, context))
    };
  }

  /**
   * Get the log channel configuration
   */
  getConfig(name) {
    const logConfig = this.app.config('logging', {});
    return logConfig.channels?.[name] || null;
  }

  /**
   * Get the default log driver name
   */
  getDefaultDriver() {
    return this.app.config('logging.default', 'console');
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

  // Proxy PSR-3 methods to default channel
  emergency(message, context = {}) {
    return this.channel().emergency(message, context);
  }

  alert(message, context = {}) {
    return this.channel().alert(message, context);
  }

  critical(message, context = {}) {
    return this.channel().critical(message, context);
  }

  error(message, context = {}) {
    return this.channel().error(message, context);
  }

  warning(message, context = {}) {
    return this.channel().warning(message, context);
  }

  notice(message, context = {}) {
    return this.channel().notice(message, context);
  }

  info(message, context = {}) {
    return this.channel().info(message, context);
  }

  debug(message, context = {}) {
    return this.channel().debug(message, context);
  }

  log(level, message, context = {}) {
    return this.channel().log(level, message, context);
  }
}

export default LogManager;
