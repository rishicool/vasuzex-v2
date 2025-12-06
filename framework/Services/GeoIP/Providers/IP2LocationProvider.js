import IP2Location from "ip2location-nodejs";
import { join } from "path";
import { existsSync } from "fs";
import { GeoIPProvider } from "./GeoIPProvider.js";

/**
 * IP2LocationProvider - IP2Location database provider
 *
 * Uses IP2Location BIN database for IP geolocation
 * Download database from: https://lite.ip2location.com/
 */
export class IP2LocationProvider extends GeoIPProvider {
  /**
   * Create a new IP2Location provider instance
   *
   * @param {Object} config - Provider configuration
   */
  constructor(config) {
    super(config);

    this.databasePath = config.databasePath || config.database_path;
    this.lookup = null;
  }

  /**
   * Get provider name
   *
   * @returns {string}
   */
  getName() {
    return "IP2Location";
  }

  /**
   * Initialize IP2Location database
   *
   * @returns {Promise<void>}
   */
  async init() {
    if (this.lookup) {
      return;
    }

    const dbPath = this.getDbPath();

    if (!existsSync(dbPath)) {
      throw new Error(
        `IP2Location database not found at ${dbPath}. Please download IP2LOCATION-LITE-DB11.BIN from IP2Location.`
      );
    }

    this.lookup = new IP2Location.IP2Location();
    this.lookup.open(dbPath);

    console.log(`✅ IP2Location database loaded from: ${dbPath}`);
  }

  /**
   * Locate IP address
   *
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async locate(ip) {
    // Validate IP
    if (!this.isValidIP(ip)) {
      throw new Error(`Invalid IP address: ${ip}`);
    }

    // Check cache
    const cached = this.getCached(ip);
    if (cached) {
      return cached;
    }

    // Initialize if not done
    if (!this.lookup) {
      await this.init();
    }

    // Lookup IP
    const result = this.lookup.getAll(ip);

    // Check if result is valid
    if (!result || result.countryShort === "-" || result.countryShort === "INVALID IP ADDRESS") {
      const notFound = this.buildNotFoundResponse(ip);
      this.setCached(ip, notFound);
      return notFound;
    }

    // Build response
    const location = this.buildLocationResponse(ip, {
      country: {
        code: result.countryShort || null,
        name: result.countryLong || null,
      },
      city: result.city && result.city !== "-" ? result.city : null,
      location:
        result.latitude && result.longitude
          ? {
              latitude: parseFloat(result.latitude),
              longitude: parseFloat(result.longitude),
              time_zone: result.timeZone || null,
            }
          : null,
      postal: result.zipCode && result.zipCode !== "-" ? result.zipCode : null,
      subdivisions:
        result.region && result.region !== "-"
          ? [
              {
                code: null,
                name: result.region,
              },
            ]
          : [],
      continent: null, // IP2Location doesn't provide continent in all packages
    });

    // Additional IP2Location-specific data
    location.isp = result.isp && result.isp !== "-" ? result.isp : null;
    location.domain = result.domain && result.domain !== "-" ? result.domain : null;
    location.usageType = result.usageType && result.usageType !== "-" ? result.usageType : null;
    location.raw = result;

    // Cache and return
    this.setCached(ip, location);
    return location;
  }

  /**
   * Get database path
   *
   * @private
   * @returns {string} Database path
   */
  getDbPath() {
    const dbPath = this.databasePath;

    if (!dbPath) {
      throw new Error("IP2Location database path is not configured");
    }

    // If absolute path, use it
    if (dbPath.startsWith("/")) {
      return dbPath;
    }

    // Relative to project root
    return join(process.cwd(), dbPath);
  }

  /**
   * Get ISP information
   *
   * @param {string} ip - IP address
   * @returns {Promise<string|null>} ISP name
   */
  async getISP(ip) {
    const location = await this.locate(ip);
    return location.isp || null;
  }

  /**
   * Get domain information
   *
   * @param {string} ip - IP address
   * @returns {Promise<string|null>} Domain
   */
  async getDomain(ip) {
    const location = await this.locate(ip);
    return location.domain || null;
  }

  /**
   * Get usage type (COM, ORG, GOV, MIL, EDU, LIB, CDN, ISP, MOB, DCH, SES, RSV)
   *
   * @param {string} ip - IP address
   * @returns {Promise<string|null>} Usage type
   */
  async getUsageType(ip) {
    const location = await this.locate(ip);
    return location.usageType || null;
  }

  /**
   * Check if database is loaded
   *
   * @returns {boolean}
   */
  isLoaded() {
    return this.lookup !== null;
  }

  /**
   * Close database connection
   *
   * @returns {void}
   */
  close() {
    if (this.lookup) {
      this.lookup.close();
      this.lookup = null;
    }
  }
}
