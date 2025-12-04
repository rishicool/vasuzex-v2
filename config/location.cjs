/**
 * Location Service Configuration
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Latitude/Longitude Columns
  |--------------------------------------------------------------------------
  |
  | Default column names for latitude and longitude in database tables.
  |
  */

  default_lat_column: 'latitude',
  default_lon_column: 'longitude',

  /*
  |--------------------------------------------------------------------------
  | Default Distance Unit
  |--------------------------------------------------------------------------
  |
  | Default unit for distance calculations: 'km' or 'mi'
  |
  */

  default_unit: env('LOCATION_DEFAULT_UNIT', 'km'),

  /*
  |--------------------------------------------------------------------------
  | Default Search Radius
  |--------------------------------------------------------------------------
  |
  | Default radius for nearby searches in kilometers.
  |
  */

  default_radius: env('LOCATION_DEFAULT_RADIUS', 10),

  /*
  |--------------------------------------------------------------------------
  | Geocoding Provider
  |--------------------------------------------------------------------------
  |
  | Configure geocoding provider for address <-> coordinates conversion.
  | Supported: 'google'
  |
  */

  geocoding: {
    provider: env('GEOCODING_PROVIDER', null), // 'google'
    api_key: env('GEOCODING_API_KEY', null),
    
    options: {
      language: env('GEOCODING_LANGUAGE', 'en'),
      region: env('GEOCODING_REGION', null), // e.g., 'IN' for India
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Database Driver
  |--------------------------------------------------------------------------
  |
  | Specify database driver for optimized queries.
  | Supported: 'mysql', 'postgres', 'postgis'
  |
  | Use 'postgis' if you have PostGIS extension enabled in PostgreSQL.
  |
  */

  driver: env('LOCATION_DB_DRIVER', 'mysql'),

  /*
  |--------------------------------------------------------------------------
  | PostGIS Configuration
  |--------------------------------------------------------------------------
  |
  | If using PostGIS, specify the point column name.
  |
  */

  postgis: {
    point_column: 'location', // POINT column name
    srid: 4326, // WGS84
  },
};

function env(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined || value === null) return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value) && value !== '') return Number(value);
  return value;
}
