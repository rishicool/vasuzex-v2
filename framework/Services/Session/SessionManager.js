/**
 * Session Manager
 * Laravel-inspired session manager
 */

export class SessionManager {
  constructor(app) {
    this.app = app;
    this.drivers = {};
    this.customCreators = {};
  }

  /**
   * Get a session driver instance
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

    if (!config) {
      throw new Error(`Session driver [${name}] is not defined.`);
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
   * Create cookie session driver
   */
  createCookieDriver(config) {
    return {
      type: 'cookie',
      config
    };
  }

  /**
   * Create file session driver
   */
  createFileDriver(config) {
    return {
      type: 'file',
      config
    };
  }

  /**
   * Create database session driver
   */
  createDatabaseDriver(config) {
    return {
      type: 'database',
      config
    };
  }

  /**
   * Create Redis session driver
   */
  createRedisDriver(config) {
    return {
      type: 'redis',
      config
    };
  }

  /**
   * Get the session configuration
   */
  getConfig(name) {
    const sessionConfig = this.app.config('session', {});
    return sessionConfig.drivers?.[name] || null;
  }

  /**
   * Get the default session driver name
   */
  getDefaultDriver() {
    return this.app.config('session.driver', 'cookie');
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

  /**
   * Get Express session middleware configuration
   */
  getMiddlewareConfig() {
    const driver = this.getDefaultDriver();
    const config = this.app.config('session', {});

    return {
      secret: config.secret || this.app.config('app.key'),
      name: config.cookie?.name || 'session',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: (config.lifetime || 120) * 60 * 1000,
        httpOnly: config.cookie?.http_only !== false,
        secure: config.cookie?.secure || false,
        sameSite: config.cookie?.same_site || 'lax'
      }
    };
  }
}

export default SessionManager;
