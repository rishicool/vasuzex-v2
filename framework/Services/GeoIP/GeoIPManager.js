/**
 * GeoIP Manager
 * MaxMind GeoLite2 integration for IP geolocation
 */

import maxmind from 'maxmind';
import { join } from 'path';
import { existsSync } from 'fs';

export class GeoIPManager {
  constructor(app) {
    this.app = app;
    this.config = app.config('geoip');
    this.lookup = null;
  }

  /**
   * Initialize GeoIP database
   */
  async init() {
    if (this.lookup) {
      return this.lookup;
    }

    const dbPath = this.getDbPath();

    if (!existsSync(dbPath)) {
      throw new Error(
        `GeoIP database not found at ${dbPath}. Please download GeoLite2-City.mmdb.`
      );
    }

    this.lookup = await maxmind.open(dbPath);
    console.log('✅ MaxMind GeoIP DB loaded from:', dbPath);
    
    return this.lookup;
  }

  /**
   * Get location from IP address
   */
  async locate(ip) {
    if (!this.lookup) {
      await this.init();
    }

    const result = this.lookup.get(ip);

    if (!result) {
      return {
        found: false,
        ip,
        country: null,
        city: null,
        location: null,
      };
    }

    return {
      found: true,
      ip,
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
      subdivisions: result.subdivisions?.map(s => ({
        code: s.iso_code,
        name: s.names?.en,
      })) || [],
      continent: {
        code: result.continent?.code || null,
        name: result.continent?.names?.en || null,
      },
      registered_country: result.registered_country?.names?.en || null,
    };
  }

  /**
   * Get country from IP
   */
  async getCountry(ip) {
    const location = await this.locate(ip);
    return location.country;
  }

  /**
   * Get city from IP
   */
  async getCity(ip) {
    const location = await this.locate(ip);
    return location.city;
  }

  /**
   * Get coordinates from IP
   */
  async getCoordinates(ip) {
    const location = await this.locate(ip);
    return location.location
      ? {
          lat: location.location.latitude,
          lon: location.location.longitude,
        }
      : null;
  }

  /**
   * Check if IP is from specific country
   */
  async isFromCountry(ip, countryCode) {
    const location = await this.locate(ip);
    return location.country?.code === countryCode.toUpperCase();
  }

  /**
   * Get database path
   */
  getDbPath() {
    const dbPath = this.config.database_path;
    
    // If absolute path, use it
    if (dbPath.startsWith('/')) {
      return dbPath;
    }

    // Relative to project root
    return join(process.cwd(), dbPath);
  }

  /**
   * Get database info
   */
  async getDbInfo() {
    if (!this.lookup) {
      await this.init();
    }

    const metadata = this.lookup.metadata;

    return {
      type: metadata.databaseType,
      build: new Date(metadata.buildEpoch * 1000).toISOString(),
      languages: metadata.languages,
      nodeCount: metadata.nodeCount,
      recordSize: metadata.recordSize,
    };
  }
}

export default GeoIPManager;
