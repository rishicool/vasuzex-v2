/**
 * GuruORM Query Builder Extensions for Geospatial Queries
 * 
 * Adds location-based query methods to GuruORM
 */

import LocationManager from './LocationManager.js';

export default class LocationQueryBuilder {
  /**
   * Add distance calculation to query
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @param {string} alias - Column alias for distance
   * @returns {object} Query builder
   */
  static selectDistance(query, lat, lon, latCol = 'latitude', lonCol = 'longitude', unit = 'km', alias = 'distance') {
    const locationManager = new LocationManager();
    const distanceSQL = locationManager.getDistanceSQL(lat, lon, latCol, lonCol, unit);
    
    return query.selectRaw(`${distanceSQL} as ${alias}`);
  }

  /**
   * Filter by distance radius
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Radius in km/mi
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @returns {object} Query builder
   */
  static whereDistance(query, lat, lon, radius, latCol = 'latitude', lonCol = 'longitude', unit = 'km') {
    const locationManager = new LocationManager();
    const distanceSQL = locationManager.getDistanceSQL(lat, lon, latCol, lonCol, unit);
    
    return query.whereRaw(`${distanceSQL} <= ?`, [radius]);
  }

  /**
   * Filter by distance radius (alias for whereDistance)
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Radius in km/mi
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @returns {object} Query builder
   */
  static whereRadius(query, lat, lon, radius, latCol = 'latitude', lonCol = 'longitude', unit = 'km') {
    return this.whereDistance(query, lat, lon, radius, latCol, lonCol, unit);
  }

  /**
   * Filter by bounding box (faster than distance calculation)
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Radius in km
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @returns {object} Query builder
   */
  static whereBoundingBox(query, lat, lon, radius, latCol = 'latitude', lonCol = 'longitude') {
    const locationManager = new LocationManager();
    const box = locationManager.getBoundingBox(lat, lon, radius);
    
    return query
      .where(latCol, '>=', box.minLat)
      .where(latCol, '<=', box.maxLat)
      .where(lonCol, '>=', box.minLon)
      .where(lonCol, '<=', box.maxLon);
  }

  /**
   * Order by distance from point
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {string} direction - 'asc' or 'desc'
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @returns {object} Query builder
   */
  static orderByDistance(query, lat, lon, direction = 'asc', latCol = 'latitude', lonCol = 'longitude', unit = 'km') {
    const locationManager = new LocationManager();
    const distanceSQL = locationManager.getDistanceSQL(lat, lon, latCol, lonCol, unit);
    
    return query.orderByRaw(`${distanceSQL} ${direction}`);
  }

  /**
   * Find nearest N items
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} limit - Number of items to return
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @returns {object} Query builder
   */
  static nearest(query, lat, lon, limit = 10, latCol = 'latitude', lonCol = 'longitude', unit = 'km') {
    return this.selectDistance(query, lat, lon, latCol, lonCol, unit)
      .orderByDistance(query, lat, lon, 'asc', latCol, lonCol, unit)
      .limit(limit);
  }

  /**
   * Combine bounding box filter with distance calculation
   * (Performance optimization: filter with bounding box first, then calculate exact distance)
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Radius in km/mi
   * @param {string} latCol - Latitude column name
   * @param {string} lonCol - Longitude column name
   * @param {string} unit - 'km' or 'mi'
   * @returns {object} Query builder
   */
  static withinRadius(query, lat, lon, radius, latCol = 'latitude', lonCol = 'longitude', unit = 'km') {
    // First filter with bounding box (fast)
    this.whereBoundingBox(query, lat, lon, radius, latCol, lonCol);
    
    // Then add exact distance calculation
    this.selectDistance(query, lat, lon, latCol, lonCol, unit);
    
    // Filter by exact distance
    this.whereDistance(query, lat, lon, radius, latCol, lonCol, unit);
    
    // Order by distance
    return this.orderByDistance(query, lat, lon, 'asc', latCol, lonCol, unit);
  }

  /**
   * For PostgreSQL PostGIS point columns
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radius - Radius in km
   * @param {string} column - PostGIS point column name
   * @returns {object} Query builder
   */
  static wherePostGISDistance(query, lat, lon, radius, column = 'location') {
    return query.whereRaw(
      `ST_DWithin(${column}::geography, ST_MakePoint(?, ?)::geography, ?)`,
      [lon, lat, radius * 1000] // Convert km to meters
    );
  }

  /**
   * Select PostGIS distance
   * 
   * @param {object} query - GuruORM query builder instance
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {string} column - PostGIS point column name
   * @param {string} alias - Column alias
   * @returns {object} Query builder
   */
  static selectPostGISDistance(query, lat, lon, column = 'location', alias = 'distance') {
    const locationManager = new LocationManager();
    const distanceSQL = locationManager.getPostGISDistanceSQL(lat, lon, column);
    
    return query.selectRaw(`${distanceSQL} as ${alias}`);
  }
}

/**
 * Install location query methods into GuruORM Query Builder
 * 
 * Usage:
 * import { installLocationMethods } from './LocationQueryBuilder.js';
 * installLocationMethods(QueryBuilder);
 */
export function installLocationMethods(QueryBuilder) {
  /**
   * Select distance as column
   */
  QueryBuilder.prototype.selectDistance = function(lat, lon, latCol, lonCol, unit, alias) {
    return LocationQueryBuilder.selectDistance(this, lat, lon, latCol, lonCol, unit, alias);
  };

  /**
   * Filter by distance
   */
  QueryBuilder.prototype.whereDistance = function(lat, lon, radius, latCol, lonCol, unit) {
    return LocationQueryBuilder.whereDistance(this, lat, lon, radius, latCol, lonCol, unit);
  };

  /**
   * Filter by radius (alias)
   */
  QueryBuilder.prototype.whereRadius = function(lat, lon, radius, latCol, lonCol, unit) {
    return LocationQueryBuilder.whereRadius(this, lat, lon, radius, latCol, lonCol, unit);
  };

  /**
   * Filter by bounding box
   */
  QueryBuilder.prototype.whereBoundingBox = function(lat, lon, radius, latCol, lonCol) {
    return LocationQueryBuilder.whereBoundingBox(this, lat, lon, radius, latCol, lonCol);
  };

  /**
   * Order by distance
   */
  QueryBuilder.prototype.orderByDistance = function(lat, lon, direction, latCol, lonCol, unit) {
    return LocationQueryBuilder.orderByDistance(this, lat, lon, direction, latCol, lonCol, unit);
  };

  /**
   * Find nearest N items
   */
  QueryBuilder.prototype.nearest = function(lat, lon, limit, latCol, lonCol, unit) {
    return LocationQueryBuilder.nearest(this, lat, lon, limit, latCol, lonCol, unit);
  };

  /**
   * Within radius (optimized)
   */
  QueryBuilder.prototype.withinRadius = function(lat, lon, radius, latCol, lonCol, unit) {
    return LocationQueryBuilder.withinRadius(this, lat, lon, radius, latCol, lonCol, unit);
  };

  /**
   * PostGIS distance filter
   */
  QueryBuilder.prototype.wherePostGISDistance = function(lat, lon, radius, column) {
    return LocationQueryBuilder.wherePostGISDistance(this, lat, lon, radius, column);
  };

  /**
   * PostGIS distance select
   */
  QueryBuilder.prototype.selectPostGISDistance = function(lat, lon, column, alias) {
    return LocationQueryBuilder.selectPostGISDistance(this, lat, lon, column, alias);
  };

  return QueryBuilder;
}
