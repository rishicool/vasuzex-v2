/**
 * GeoIP Configuration
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Database Path
  |--------------------------------------------------------------------------
  |
  | Path to GeoLite2-City.mmdb database file.
  | Can be absolute or relative to project root.
  |
  | Download from: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
  |
  */

  database_path: env('GEOIP_DATABASE_PATH', './storage/geoip/GeoLite2-City.mmdb'),

  /*
  |--------------------------------------------------------------------------
  | Auto Initialize
  |--------------------------------------------------------------------------
  |
  | Automatically initialize GeoIP database on application boot.
  |
  */

  auto_init: env('GEOIP_AUTO_INIT', true),

  /*
  |--------------------------------------------------------------------------
  | Cache Results
  |--------------------------------------------------------------------------
  |
  | Cache IP lookup results for faster subsequent requests.
  | TTL in seconds.
  |
  */

  cache: {
    enabled: env('GEOIP_CACHE_ENABLED', true),
    ttl: env('GEOIP_CACHE_TTL', 3600), // 1 hour
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
