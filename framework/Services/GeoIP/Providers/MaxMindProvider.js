import maxmind from "maxmind";
import { join } from "path";
import { existsSync } from "fs";
import { GeoIPProvider } from "./GeoIPProvider.js";

/**
 * MaxMindProvider - MaxMind GeoLite2/GeoIP2 database provider
 *
 * Uses MaxMind GeoLite2-City database for IP geolocation
 * Download database from: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
 */
export class MaxMindProvider extends GeoIPProvider {
  /**
   * Create a new MaxMind provider instance
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
    return "MaxMind";
  }

  /**
   * Initialize MaxMind database
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
        `MaxMind GeoIP database not found at ${dbPath}. Please download GeoLite2-City.mmdb from MaxMind.`
      );
    }

    this.lookup = await maxmind.open(dbPath);
    console.log(`✅ MaxMind GeoIP database loaded from: ${dbPath}`);
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
    const result = this.lookup.get(ip);

    if (!result) {
      const notFound = this.buildNotFoundResponse(ip);
      this.setCached(ip, notFound);
      return notFound;
    }

    // Build response
    const location = this.buildLocationResponse(ip, {
      country: {
        code: result.country?.iso_code || null,
        name: result.country?.names?.en || null,
      },
      city: result.city?.names?.en || null,
      location: result.location
        ? {
            latitude: result.location.latitude,
            longitude: result.location.longitude,
            accuracy_radius: result.location.accuracy_radius,
            time_zone: result.location.time_zone,
          }
        : null,
      postal: result.postal?.code || null,
      subdivisions:
        result.subdivisions?.map((s) => ({
          code: s.iso_code,
          name: s.names?.en,
        })) || [],
      continent: {
        code: result.continent?.code || null,
        name: result.continent?.names?.en || null,
      },
    });

    // Additional MaxMind-specific data
    location.registered_country = result.registered_country?.names?.en || null;
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
      throw new Error("MaxMind database path is not configured");
    }

    // If absolute path, use it
    if (dbPath.startsWith("/")) {
      return dbPath;
    }

    // Relative to project root
    return join(process.cwd(), dbPath);
  }

  /**
   * Get database metadata
   *
   * @returns {Promise<Object>} Database metadata
   */
  async getDbInfo() {
    if (!this.lookup) {
      await this.init();
    }

    const metadata = this.lookup.metadata;

    return {
      buildEpoch: metadata.buildEpoch,
      databaseType: metadata.databaseType,
      description: metadata.description,
      ipVersion: metadata.ipVersion,
      nodeCount: metadata.nodeCount,
      recordSize: metadata.recordSize,
    };
  }

  /**
   * Check if database is loaded
   *
   * @returns {boolean}
   */
  isLoaded() {
    return this.lookup !== null;
  }
}
