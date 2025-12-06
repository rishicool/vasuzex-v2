/**
 * GeoIP Manager
 * Multi-provider GeoIP manager with driver pattern
 * Supports MaxMind and IP2Location databases
 */

import { MaxMindProvider } from "./Providers/MaxMindProvider.js";
import { IP2LocationProvider } from "./Providers/IP2LocationProvider.js";

export class GeoIPManager {
  constructor(app) {
    this.app = app;
    this.config = app.config('geoip');
    this.providers = new Map();
    this.customCreators = new Map();
    this.defaultProvider = this.config.default || "maxmind";
    
    // Legacy support - keep lookup property for backward compatibility
    this.lookup = null;
  }

  /**
   * Get a provider instance
   *
   * @param {string|null} name - Provider name
   * @returns {Object} Provider instance
   */
  provider(name = null) {
    name = name || this.getDefaultProvider();

    if (this.providers.has(name)) {
      return this.providers.get(name);
    }

    const provider = this.resolve(name);
    this.providers.set(name, provider);

    return provider;
  }

  /**
   * Resolve a provider instance
   *
   * @private
   * @param {string} name - Provider name
   * @returns {Object} Provider instance
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`GeoIP provider [${name}] is not configured`);
    }

    // Check for custom creator
    if (this.customCreators.has(name)) {
      return this.customCreators.get(name)(config);
    }

    // Use built-in driver
    const driverMethod = `create${this.capitalize(name)}Driver`;

    if (typeof this[driverMethod] === "function") {
      return this[driverMethod](config);
    }

    throw new Error(`GeoIP provider [${name}] is not supported`);
  }

  /**
   * Create MaxMind provider driver
   *
   * @param {Object} config - Provider configuration
   * @returns {Object} MaxMind provider
   */
  createMaxmindDriver(config) {
    const provider = new MaxMindProvider(config);
    return provider;
  }

  /**
   * Create IP2Location provider driver
   *
   * @param {Object} config - Provider configuration
   * @returns {Object} IP2Location provider
   */
  createIp2locationDriver(config) {
    const provider = new IP2LocationProvider(config);
    return provider;
  }

  /**
   * Initialize GeoIP database (legacy support)
   *
   * @returns {Promise<void>}
   */
  async init() {
    const provider = this.provider();
    await provider.init();
    
    // For backward compatibility
    this.lookup = provider.lookup || null;
    
    return this.lookup;
  }

  /**
   * Get location from IP address
   *
   * @param {string} ip - IP address
   * @param {string|null} providerName - Provider name
   * @returns {Promise<Object>} Location data
   */
  async locate(ip, providerName = null) {
    return this.provider(providerName).locate(ip);
  }

  /**
   * Get country from IP
   *
   * @param {string} ip - IP address
   * @param {string|null} providerName - Provider name
   * @returns {Promise<Object|null>} Country data
   */
  async getCountry(ip, providerName = null) {
    return this.provider(providerName).getCountry(ip);
  }

  /**
   * Get city from IP
   *
   * @param {string} ip - IP address
   * @param {string|null} providerName - Provider name
   * @returns {Promise<string|null>} City name
   */
  async getCity(ip, providerName = null) {
    return this.provider(providerName).getCity(ip);
  }

  /**
   * Get coordinates from IP
   *
   * @param {string} ip - IP address
   * @param {string|null} providerName - Provider name
   * @returns {Promise<Object|null>} Coordinates
   */
  async getCoordinates(ip, providerName = null) {
    return this.provider(providerName).getCoordinates(ip);
  }

  /**
   * Check if IP is from specific country
   *
   * @param {string} ip - IP address
   * @param {string} countryCode - Country code
   * @param {string|null} providerName - Provider name
   * @returns {Promise<boolean>} Is from country
   */
  async isFromCountry(ip, countryCode, providerName = null) {
    return this.provider(providerName).isFromCountry(ip, countryCode);
  }

  /**
   * Get provider configuration
   *
   * @private
   * @param {string} name - Provider name
   * @returns {Object|null} Provider configuration
   */
  getConfig(name) {
    return this.config.providers?.[name] || null;
  }

  /**
   * Get default provider name
   *
   * @returns {string} Default provider
   */
  getDefaultProvider() {
    return this.defaultProvider;
  }

  /**
   * Set default provider
   *
   * @param {string} name - Provider name
   * @returns {this}
   */
  setDefaultProvider(name) {
    this.defaultProvider = name;
    return this;
  }

  /**
   * Register a custom provider creator
   *
   * @param {string} name - Provider name
   * @param {Function} creator - Creator function
   * @returns {this}
   */
  extend(name, creator) {
    this.customCreators.set(name, creator);
    return this;
  }

  /**
   * Get all available provider names
   *
   * @returns {Array<string>} Provider names
   */
  getAvailableProviders() {
    const configured = Object.keys(this.config.providers || {});
    const custom = Array.from(this.customCreators.keys());
    return [...new Set([...configured, ...custom])];
  }

  /**
   * Purge a provider instance from cache
   *
   * @param {string|null} name - Provider name
   * @returns {this}
   */
  purge(name = null) {
    if (name) {
      this.providers.delete(name);
    } else {
      this.providers.clear();
    }
    return this;
  }

  /**
   * Clear all provider caches
   *
   * @returns {this}
   */
  clearCache() {
    for (const provider of this.providers.values()) {
      if (typeof provider.clearCache === "function") {
        provider.clearCache();
      }
    }
    return this;
  }

  /**
   * Capitalize first letter
   *
   * @private
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get database info (legacy support for MaxMind)
   *
   * @returns {Promise<Object>} Database info
   */
  async getDbInfo() {
    const provider = this.provider();
    
    if (typeof provider.getDbInfo === "function") {
      return provider.getDbInfo();
    }

    return {
      provider: provider.getName(),
      message: "Database metadata not available for this provider",
    };
  }
}

export default GeoIPManager;
