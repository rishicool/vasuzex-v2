/**
 * Location Service Tests
 * Tests for distance calculations, geocoding, and geospatial queries
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import LocationManager from '../framework/Services/Location/LocationManager.js';
import LocationQueryBuilder from '../framework/Services/Location/LocationQueryBuilder.js';
import { mockFetch, restoreFetch } from './helpers/utils.js';

describe('LocationManager', () => {
  let location;

  beforeEach(() => {
    location = new LocationManager();
  });

  describe('Distance Calculations', () => {
    test('calculates distance between two points correctly', () => {
      // Delhi to Mumbai
      const distance = location.calculateDistance(
        28.6139, 77.2090, // Delhi
        19.0760, 72.8777  // Mumbai
      );

      // Approximate distance is ~1149 km
      expect(distance).toBeGreaterThan(1140);
      expect(distance).toBeLessThan(1160);
    });

    test('calculates distance in miles', () => {
      const distanceKm = location.calculateDistance(
        28.6139, 77.2090,
        19.0760, 72.8777,
        'km'
      );

      const distanceMi = location.calculateDistance(
        28.6139, 77.2090,
        19.0760, 72.8777,
        'mi'
      );

      // 1 km ≈ 0.621371 mi
      expect(distanceMi).toBeCloseTo(distanceKm * 0.621371, 0);
    });

    test('returns 0 for same coordinates', () => {
      const distance = location.calculateDistance(
        28.6139, 77.2090,
        28.6139, 77.2090
      );

      expect(distance).toBe(0);
    });
  });

  describe('Bearing Calculations', () => {
    test('calculates bearing correctly', () => {
      // Delhi to Mumbai (Southwest direction)
      const bearing = location.calculateBearing(
        28.6139, 77.2090,
        19.0760, 72.8777
      );

      // Should be around 203° (Southwest)
      expect(bearing).toBeGreaterThan(200);
      expect(bearing).toBeLessThan(210);
    });

    test('bearing is within 0-360 range', () => {
      const bearing = location.calculateBearing(
        28.6139, 77.2090,
        19.0760, 72.8777
      );

      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    test('gets correct compass direction', () => {
      expect(location.getDirection(0)).toBe('N');
      expect(location.getDirection(45)).toBe('NE');
      expect(location.getDirection(90)).toBe('E');
      expect(location.getDirection(135)).toBe('SE');
      expect(location.getDirection(180)).toBe('S');
      expect(location.getDirection(225)).toBe('SW');
      expect(location.getDirection(270)).toBe('W');
      expect(location.getDirection(315)).toBe('NW');
    });
  });

  describe('Bounding Box', () => {
    test('calculates bounding box correctly', () => {
      const box = location.getBoundingBox(28.6139, 77.2090, 10); // 10km radius

      expect(box).toHaveProperty('minLat');
      expect(box).toHaveProperty('maxLat');
      expect(box).toHaveProperty('minLon');
      expect(box).toHaveProperty('maxLon');

      // Center should be within box
      expect(28.6139).toBeGreaterThan(box.minLat);
      expect(28.6139).toBeLessThan(box.maxLat);
      expect(77.2090).toBeGreaterThan(box.minLon);
      expect(77.2090).toBeLessThan(box.maxLon);
    });

    test('checks if point is within bounding box', () => {
      const box = location.getBoundingBox(28.6139, 77.2090, 10);

      // Point very close to center should be inside
      expect(location.isWithinBoundingBox(28.6150, 77.2100, box)).toBe(true);

      // Point far away should be outside
      expect(location.isWithinBoundingBox(29.0, 78.0, box)).toBe(false);
    });
  });

  describe('Destination Point', () => {
    test('calculates destination point correctly', () => {
      const dest = location.calculateDestination(
        28.6139, 77.2090, // Start: Delhi
        50,                // Distance: 50km
        180                // Bearing: South
      );

      expect(dest).toHaveProperty('latitude');
      expect(dest).toHaveProperty('longitude');

      // Should be south of Delhi
      expect(dest.latitude).toBeLessThan(28.6139);

      // Longitude should be similar (going straight south)
      expect(Math.abs(dest.longitude - 77.2090)).toBeLessThan(0.1);
    });
  });

  describe('Coordinate Validation', () => {
    test('validates correct coordinates', () => {
      expect(location.isValidCoordinates(28.6139, 77.2090)).toBe(true);
      expect(location.isValidCoordinates(0, 0)).toBe(true);
      expect(location.isValidCoordinates(-90, -180)).toBe(true);
      expect(location.isValidCoordinates(90, 180)).toBe(true);
    });

    test('rejects invalid latitudes', () => {
      expect(location.isValidCoordinates(91, 77.2090)).toBe(false);
      expect(location.isValidCoordinates(-91, 77.2090)).toBe(false);
    });

    test('rejects invalid longitudes', () => {
      expect(location.isValidCoordinates(28.6139, 181)).toBe(false);
      expect(location.isValidCoordinates(28.6139, -181)).toBe(false);
    });
  });

  describe('Distance Formatting', () => {
    test('formats distance in kilometers', () => {
      expect(location.formatDistance(1.5)).toBe('1.50 km');
      expect(location.formatDistance(0.5)).toBe('500 m');
      expect(location.formatDistance(0.1)).toBe('100 m');
    });

    test('formats distance in miles', () => {
      expect(location.formatDistance(1.609, 'mi')).toBe('1.00 mi');
      expect(location.formatDistance(0.805, 'mi')).toBe('2640 ft');
    });
  });

  describe('SQL Generation', () => {
    test('generates correct MySQL distance SQL', () => {
      const sql = location.getDistanceSQL(28.6139, 77.2090);

      expect(sql).toContain('acos');
      expect(sql).toContain('radians');
      expect(sql).toContain('28.6139');
      expect(sql).toContain('77.2090');
      expect(sql).toContain('6371'); // Earth radius in km
    });

    test('generates correct PostGIS distance SQL', () => {
      const sql = location.getPostGISDistanceSQL(28.6139, 77.2090, 'location');

      expect(sql).toContain('ST_Distance');
      expect(sql).toContain('ST_MakePoint');
      expect(sql).toContain('location');
      expect(sql).toContain('77.2090');
      expect(sql).toContain('28.6139');
    });
  });

  describe('Geocoding', () => {
    test('throws error if geocoding provider not set', async () => {
      await expect(location.geocode('Delhi')).rejects.toThrow('Geocoding provider not configured');
    });

    test('calls geocoding provider when set', async () => {
      const mockProvider = {
        geocode: jest.fn().mockResolvedValue({
          latitude: 28.6139,
          longitude: 77.2090,
        }),
      };

      location.setGeocodingProvider(mockProvider);
      const result = await location.geocode('Delhi');

      expect(mockProvider.geocode).toHaveBeenCalledWith('Delhi');
      expect(result.latitude).toBe(28.6139);
      expect(result.longitude).toBe(77.2090);
    });
  });
});

describe('LocationQueryBuilder', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = {
      selectRaw: jest.fn().mockReturnThis(),
      whereRaw: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderByRaw: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
  });

  test('selectDistance adds distance column', () => {
    LocationQueryBuilder.selectDistance(mockQuery, 28.6139, 77.2090);

    expect(mockQuery.selectRaw).toHaveBeenCalled();
    const sql = mockQuery.selectRaw.mock.calls[0][0];
    expect(sql).toContain('acos');
    expect(sql).toContain('as distance');
  });

  test('whereDistance filters by radius', () => {
    LocationQueryBuilder.whereDistance(mockQuery, 28.6139, 77.2090, 5);

    expect(mockQuery.whereRaw).toHaveBeenCalled();
    const sql = mockQuery.whereRaw.mock.calls[0][0];
    expect(sql).toContain('<=');
    expect(mockQuery.whereRaw.mock.calls[0][1]).toEqual([5]);
  });

  test('whereBoundingBox adds box constraints', () => {
    LocationQueryBuilder.whereBoundingBox(mockQuery, 28.6139, 77.2090, 10);

    // Should have 4 where clauses (minLat, maxLat, minLon, maxLon)
    expect(mockQuery.where).toHaveBeenCalledTimes(4);
  });

  test('orderByDistance sorts by distance', () => {
    LocationQueryBuilder.orderByDistance(mockQuery, 28.6139, 77.2090);

    expect(mockQuery.orderByRaw).toHaveBeenCalled();
    const sql = mockQuery.orderByRaw.mock.calls[0][0];
    expect(sql).toContain('asc');
  });

  test('nearest combines distance select, filter, and order', () => {
    LocationQueryBuilder.nearest(mockQuery, 28.6139, 77.2090, 10);

    expect(mockQuery.selectRaw).toHaveBeenCalled();
    expect(mockQuery.limit).toHaveBeenCalledWith(10);
  });

  test('withinRadius combines bounding box and distance', () => {
    LocationQueryBuilder.withinRadius(mockQuery, 28.6139, 77.2090, 5);

    expect(mockQuery.where).toHaveBeenCalled(); // Bounding box
    expect(mockQuery.selectRaw).toHaveBeenCalled(); // Distance select
    expect(mockQuery.whereRaw).toHaveBeenCalled(); // Distance filter
  });
});

describe('Google Geocoding Provider', () => {
  let provider;

  beforeEach(async () => {
    const { default: GoogleGeocodingProvider } = await import('../framework/Services/Location/Providers/GoogleGeocodingProvider.js');
    provider = new GoogleGeocodingProvider('test-api-key');
  });

  afterEach(() => {
    restoreFetch();
  });

  test('geocodes address correctly', async () => {
    mockFetch({
      status: 'OK',
      results: [{
        geometry: {
          location: { lat: 28.6315, lon: 77.2167 }
        },
        formatted_address: 'Connaught Place, New Delhi',
        place_id: 'ChIJtest',
        types: ['locality'],
        address_components: [],
      }]
    });

    const result = await provider.geocode('Connaught Place');

    expect(result.latitude).toBe(28.6315);
    expect(result.longitude).toBe(77.2167);
    expect(result.formatted_address).toBe('Connaught Place, New Delhi');
  });

  test('reverse geocodes coordinates', async () => {
    mockFetch({
      status: 'OK',
      results: [{
        formatted_address: 'Connaught Place, New Delhi',
        place_id: 'ChIJtest',
        types: ['locality'],
        address_components: [],
      }]
    });

    const result = await provider.reverseGeocode(28.6315, 77.2167);

    expect(result.formatted_address).toBe('Connaught Place, New Delhi');
    expect(result.latitude).toBe(28.6315);
    expect(result.longitude).toBe(77.2167);
  });

  test('finds nearby places', async () => {
    mockFetch({
      status: 'OK',
      results: [{
        place_id: 'ChIJtest',
        name: 'Test Restaurant',
        vicinity: 'Connaught Place',
        types: ['restaurant'],
        rating: 4.5,
        geometry: {
          location: { lat: 28.6320, lon: 77.2180 }
        },
      }]
    });

    const places = await provider.nearbySearch(28.6315, 77.2167, 'restaurant', 1000);

    expect(places).toHaveLength(1);
    expect(places[0].name).toBe('Test Restaurant');
    expect(places[0].types).toContain('restaurant');
  });
});
