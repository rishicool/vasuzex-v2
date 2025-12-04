/**
 * Auth Manager
 * Laravel-inspired authentication manager
 */

export class AuthManager {
  constructor(app) {
    this.app = app;
    this.guards = new Map();
    this.customCreators = new Map();
    this.userResolver = (guard = null) => this.guard(guard).user();
  }

  /**
   * Get a guard instance
   */
  guard(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.guards.has(name)) {
      this.guards.set(name, this.resolve(name));
    }

    return this.guards.get(name);
  }

  /**
   * Resolve a guard instance
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`Auth guard [${name}] is not defined.`);
    }

    if (this.customCreators.has(config.driver)) {
      return this.customCreators.get(config.driver)(this.app, name, config);
    }

    const method = `create${this.studly(config.driver)}Driver`;

    if (typeof this[method] !== 'function') {
      throw new Error(`Auth driver [${config.driver}] for guard [${name}] is not defined.`);
    }

    return this[method](name, config);
  }

  /**
   * Create session guard
   */
  createSessionDriver(name, config) {
    const { SessionGuard } = require('./Guards/SessionGuard.js');
    
    const provider = this.createUserProvider(config.provider || null);
    const session = this.app.make('session');
    
    const guard = new SessionGuard(name, provider, session);

    guard.setCookieJar(this.app.make('cookie'));
    guard.setDispatcher(this.app.make('events'));

    return guard;
  }

  /**
   * Create token guard
   */
  createTokenDriver(name, config) {
    const { TokenGuard } = require('./Guards/TokenGuard.js');
    
    const provider = this.createUserProvider(config.provider || null);
    
    const guard = new TokenGuard(
      provider,
      config.input_key || 'api_token',
      config.storage_key || 'api_token',
      config.hash || false
    );

    return guard;
  }

  /**
   * Create a user provider
   */
  createUserProvider(provider = null) {
    if (!provider) {
      return null;
    }

    const config = this.getProviderConfig(provider);

    if (!config) {
      throw new Error(`User provider [${provider}] is not defined.`);
    }

    const method = `create${this.studly(config.driver)}Provider`;

    if (typeof this[method] !== 'function') {
      throw new Error(`User provider driver [${config.driver}] is not defined.`);
    }

    return this[method](config);
  }

  /**
   * Create database user provider
   */
  createDatabaseProvider(config) {
    const { DatabaseUserProvider } = require('./UserProviders/DatabaseUserProvider.js');
    const hash = this.app.make('hash');
    
    return new DatabaseUserProvider(hash, config.model);
  }

  /**
   * Create model user provider (for GuruORM)
   */
  createModelProvider(config) {
    const { ModelUserProvider } = require('./UserProviders/ModelUserProvider.js');
    const hash = this.app.make('hash');
    
    return new ModelUserProvider(hash, config.model);
  }

  /**
   * Get guard configuration
   */
  getConfig(name) {
    const config = this.app.make('config');
    return config.get(`auth.guards.${name}`);
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider) {
    const config = this.app.make('config');
    return config.get(`auth.providers.${provider}`);
  }

  /**
   * Get default guard name
   */
  getDefaultDriver() {
    const config = this.app.make('config');
    return config.get('auth.defaults.guard', 'web');
  }

  /**
   * Set default guard
   */
  shouldUse(name) {
    const guard = this.guard(name);
    this.userResolver = (guardName = null) => this.guard(guardName).user();
    return guard;
  }

  /**
   * Register custom guard creator
   */
  extend(driver, callback) {
    this.customCreators.set(driver, callback);
    return this;
  }

  /**
   * Get user resolver
   */
  userResolver() {
    return this.userResolver;
  }

  /**
   * Resolve user
   */
  resolveUsersUsing(callback) {
    this.userResolver = callback;
    return this;
  }

  /**
   * Convert to StudlyCase
   */
  studly(str) {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (_, char) => char.toUpperCase());
  }

  /**
   * Proxy to default guard
   */
  user() {
    return this.guard().user();
  }

  id() {
    return this.guard().id();
  }

  check() {
    return this.guard().check();
  }

  guest() {
    return this.guard().guest();
  }

  async attempt(credentials, remember = false) {
    return await this.guard().attempt(credentials, remember);
  }

  async login(user, remember = false) {
    return await this.guard().login(user, remember);
  }

  async loginUsingId(id, remember = false) {
    return await this.guard().loginUsingId(id, remember);
  }

  async logout() {
    return await this.guard().logout();
  }

  async validate(credentials) {
    return await this.guard().validate(credentials);
  }
}

export default AuthManager;
