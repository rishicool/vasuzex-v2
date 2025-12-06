/**
 * GeoIP Configuration
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Provider
  |--------------------------------------------------------------------------
  |
  | Default GeoIP provider to use for IP lookups.
  |
  | Supported: "maxmind", "ip2location"
  |
  */

  default: env('GEOIP_DEFAULT_PROVIDER', 'maxmind'),

  /*
  |--------------------------------------------------------------------------
  | GeoIP Providers
  |--------------------------------------------------------------------------
  |
  | Configure each GeoIP provider with their database paths.
  |
  */

  providers: {
    /*
    |--------------------------------------------------------------------------
    | MaxMind Provider
    |--------------------------------------------------------------------------
    |
    | MaxMind GeoLite2/GeoIP2 database provider
    | Download: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
    |
    */

    maxmind: {
      databasePath: env('GEOIP_MAXMIND_DATABASE_PATH', './storage/geoip/GeoLite2-City.mmdb'),
      
      cache: {
        enabled: env('GEOIP_CACHE_ENABLED', true),
        ttl: env('GEOIP_CACHE_TTL', 3600), // 1 hour
      },
    },

    /*
    |--------------------------------------------------------------------------
    | IP2Location Provider
    |--------------------------------------------------------------------------
    |
    | IP2Location BIN database provider
    | Download: https://lite.ip2location.com/
    | Recommended: IP2LOCATION-LITE-DB11.BIN (includes ISP, domain, usage type)
    |
    */

    ip2location: {
      databasePath: env('GEOIP_IP2LOCATION_DATABASE_PATH', './storage/geoip/IP2LOCATION-LITE-DB11.BIN'),
      
      cache: {
        enabled: env('GEOIP_CACHE_ENABLED', true),
        ttl: env('GEOIP_CACHE_TTL', 3600), // 1 hour
      },
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Legacy Support
  |--------------------------------------------------------------------------
  |
  | For backward compatibility with old GeoIPManager API
  |
  */

  database_path: env('GEOIP_DATABASE_PATH', './storage/geoip/GeoLite2-City.mmdb'),
  auto_init: env('GEOIP_AUTO_INIT', true),
  cache: {
    enabled: env('GEOIP_CACHE_ENABLED', true),
    ttl: env('GEOIP_CACHE_TTL', 3600),
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

