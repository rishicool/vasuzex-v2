/**
 * GeoIPProvider - Abstract base class for GeoIP providers
 *
 * @abstract
 */
export class GeoIPProvider {
  /**
   * Create a new GeoIP provider instance
   *
   * @param {Object} config - Provider configuration
   */
  constructor(config = {}) {
    if (new.target === GeoIPProvider) {
      throw new Error("GeoIPProvider is an abstract class and cannot be instantiated directly");
    }

    this.config = config;
    this.cache = new Map();
    this.cacheEnabled = config.cache?.enabled !== false;
    this.cacheTTL = config.cache?.ttl || 3600; // 1 hour default
  }

  /**
   * Initialize the provider
   *
   * @abstract
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error("Method init() must be implemented by subclass");
  }

  /**
   * Locate IP address
   *
   * @abstract
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async locate(ip) {
    throw new Error("Method locate() must be implemented by subclass");
  }

  /**
   * Get provider name
   *
   * @abstract
   * @returns {string} Provider name
   */
  getName() {
    throw new Error("Method getName() must be implemented by subclass");
  }

  /**
   * Get country from IP
   *
   * @param {string} ip - IP address
   * @returns {Promise<Object|null>} Country data
   */
  async getCountry(ip) {
    const location = await this.locate(ip);
    return location.country || null;
  }

  /**
   * Get city from IP
   *
   * @param {string} ip - IP address
   * @returns {Promise<string|null>} City name
   */
  async getCity(ip) {
    const location = await this.locate(ip);
    return location.city || null;
  }

  /**
   * Get coordinates from IP
   *
   * @param {string} ip - IP address
   * @returns {Promise<Object|null>} Coordinates {lat, lon}
   */
  async getCoordinates(ip) {
    const location = await this.locate(ip);
    if (location.location) {
      return {
        lat: location.location.latitude,
        lon: location.location.longitude,
      };
    }
    return null;
  }

  /**
   * Check if IP is from specific country
   *
   * @param {string} ip - IP address
   * @param {string} countryCode - Country code (ISO 3166-1 alpha-2)
   * @returns {Promise<boolean>} Is from country
   */
  async isFromCountry(ip, countryCode) {
    const location = await this.locate(ip);
    return location.country?.code === countryCode.toUpperCase();
  }

  /**
   * Get cached result
   *
   * @protected
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null
   */
  getCached(key) {
    if (!this.cacheEnabled) {
      return null;
    }

    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Store result in cache
   *
   * @protected
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCached(key, data) {
    if (!this.cacheEnabled) {
      return;
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheTTL * 1000,
    });
  }

  /**
   * Clear cache
   *
   * @returns {void}
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Validate IP address format
   *
   * @protected
   * @param {string} ip - IP address
   * @returns {boolean} Is valid
   */
  isValidIP(ip) {
    // IPv4
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Build standard not found response
   *
   * @protected
   * @param {string} ip - IP address
   * @returns {Object} Not found response
   */
  buildNotFoundResponse(ip) {
    return {
      found: false,
      ip,
      country: null,
      city: null,
      location: null,
      postal: null,
      subdivisions: [],
      continent: null,
      provider: this.getName(),
    };
  }

  /**
   * Build standard location response
   *
   * @protected
   * @param {string} ip - IP address
   * @param {Object} data - Location data
   * @returns {Object} Location response
   */
  buildLocationResponse(ip, data) {
    return {
      found: true,
      ip,
      country: data.country || null,
      city: data.city || null,
      location: data.location || null,
      postal: data.postal || null,
      subdivisions: data.subdivisions || [],
      continent: data.continent || null,
      provider: this.getName(),
    };
  }
}
