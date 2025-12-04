/**
 * LocationManager
 * 
 * Geospatial calculations and location-based queries
 * Supports distance calculations, radius search, and geocoding
 */

export default class LocationManager {
  /**
   * Earth's radius in kilometers
   */
  static EARTH_RADIUS_KM = 6371;
  
  /**
   * Earth's radius in miles
   */
  static EARTH_RADIUS_MI = 3959;

  constructor(config = {}) {
    this.config = config;
    this.geocodingProvider = null;
  }

  /**
   * Set geocoding provider (Google Maps, etc.)
   */
  setGeocodingProvider(provider) {
    this.geocodingProvider = provider;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * 
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @param {string} unit - 'km' or 'mi'
   * @returns {number} Distance
   */
  calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
    const radius = unit === 'mi' ? LocationManager.EARTH_RADIUS_MI : LocationManager.EARTH_RADIUS_KM;

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
  }

  /**
   * Calculate bearing between two coordinates
   * 
   * @param {number} lat1 - Start latitude
   * @param {number} lon1 - Start longitude
   * @param {number} lat2 - End latitude
   * @param {number} lon2 - End longitude
   * @returns {number} Bearing in degrees (0-360)
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
    const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
      Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return (this.toDegrees(bearing) + 360) % 360;
  }

  /**
   * Get compass direction from bearing
   * 
   * @param {number} bearing - Bearing in degrees
   * @returns {string} Direction (N, NE, E, SE, S, SW, W, NW)
   */
  getDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  /**
   * Calculate bounding box for radius search
   * 
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Radius in km
   * @returns {object} {minLat, maxLat, minLon, maxLon}
   */
  getBoundingBox(lat, lon, radius) {
    const latChange = radius / 111.12; // 1 degree latitude ≈ 111.12 km
    const lonChange = radius / (111.12 * Math.cos(this.toRadians(lat)));

    return {
      minLat: lat - latChange,
      maxLat: lat + latChange,
      minLon: lon - lonChange,
      maxLon: lon + lonChange,
    };
  }

  /**
   * Check if coordinates are within bounding box
   * 
   * @param {number} lat - Latitude to check
   * @param {number} lon - Longitude to check
   * @param {object} box - Bounding box from getBoundingBox()
   * @returns {boolean}
   */
  isWithinBoundingBox(lat, lon, box) {
    return lat >= box.minLat && lat <= box.maxLat &&
      lon >= box.minLon && lon <= box.maxLon;
  }

  /**
   * Calculate destination point given distance and bearing
   * 
   * @param {number} lat - Start latitude
   * @param {number} lon - Start longitude
   * @param {number} distance - Distance in km
   * @param {number} bearing - Bearing in degrees
   * @returns {object} {latitude, longitude}
   */
  calculateDestination(lat, lon, distance, bearing) {
    const radius = LocationManager.EARTH_RADIUS_KM;
    const δ = distance / radius;
    const θ = this.toRadians(bearing);

    const φ1 = this.toRadians(lat);
    const λ1 = this.toRadians(lon);

    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) +
      Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );

    const λ2 = λ1 + Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

    return {
      latitude: this.toDegrees(φ2),
      longitude: this.toDegrees(λ2),
    };
  }

  /**
   * Validate coordinates
   * 
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {boolean}
   */
  isValidCoordinates(lat, lon) {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Normalize longitude to -180 to 180 range
   * 
   * @param {number} lon - Longitude
   * @returns {number}
   */
  normalizeLongitude(lon) {
    return ((lon + 540) % 360) - 180;
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Format distance for human readability
   * 
   * @param {number} distance - Distance in km
   * @param {string} unit - 'km' or 'mi'
   * @returns {string}
   */
  formatDistance(distance, unit = 'km') {
    if (unit === 'mi') {
      distance = distance * 0.621371; // Convert km to miles
      return distance < 1
        ? `${Math.round(distance * 5280)} ft`
        : `${distance.toFixed(2)} mi`;
    }

    return distance < 1
      ? `${Math.round(distance * 1000)} m`
      : `${distance.toFixed(2)} km`;
  }

  /**
   * Get SQL distance calculation expression (for MySQL/PostgreSQL)
   * 
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @returns {string} SQL expression
   */
  getDistanceSQL(lat, lon, latCol = 'latitude', lonCol = 'longitude', unit = 'km') {
    const radius = unit === 'mi' ? LocationManager.EARTH_RADIUS_MI : LocationManager.EARTH_RADIUS_KM;

    return `(
      ${radius} * acos(
        cos(radians(${lat})) * 
        cos(radians(${latCol})) * 
        cos(radians(${lonCol}) - radians(${lon})) + 
        sin(radians(${lat})) * 
        sin(radians(${latCol}))
      )
    )`;
  }

  /**
   * Get PostgreSQL PostGIS distance expression
   * 
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {string} column - Point column name
   * @returns {string} SQL expression
   */
  getPostGISDistanceSQL(lat, lon, column = 'location') {
    return `ST_Distance(${column}::geography, ST_MakePoint(${lon}, ${lat})::geography) / 1000`;
  }

  /**
   * Geocode address to coordinates
   * Requires geocoding provider to be set
   * 
   * @param {string} address - Address to geocode
   * @returns {Promise<object>} {latitude, longitude, formatted_address}
   */
  async geocode(address) {
    if (!this.geocodingProvider) {
      throw new Error('Geocoding provider not configured');
    }

    return await this.geocodingProvider.geocode(address);
  }

  /**
   * Reverse geocode coordinates to address
   * 
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<object>} Address information
   */
  async reverseGeocode(lat, lon) {
    if (!this.geocodingProvider) {
      throw new Error('Geocoding provider not configured');
    }

    return await this.geocodingProvider.reverseGeocode(lat, lon);
  }

  /**
   * Find nearby places using geocoding provider
   * 
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} type - Place type (restaurant, hospital, etc.)
   * @param {number} radius - Search radius in meters
   * @returns {Promise<array>} Nearby places
   */
  async findNearbyPlaces(lat, lon, type, radius = 1000) {
    if (!this.geocodingProvider) {
      throw new Error('Geocoding provider not configured');
    }

    return await this.geocodingProvider.nearbySearch(lat, lon, type, radius);
  }
}
