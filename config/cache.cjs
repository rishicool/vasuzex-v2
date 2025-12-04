/**
 * Cache Configuration
 * Laravel-inspired cache configuration
 */

const env = (key, fallback = null) => process.env[key] || fallback;

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Cache Store
  |--------------------------------------------------------------------------
  |
  | This option controls the default cache connection that gets used while
  | using this caching library. This connection is used when another is
  | not explicitly specified when executing a given caching function.
  |
  */

  default: env('CACHE_DRIVER', 'redis'),

  /*
  |--------------------------------------------------------------------------
  | Cache Stores
  |--------------------------------------------------------------------------
  |
  | Here you may define all of the cache "stores" for your application as
  | well as their drivers. You may even define multiple stores for the
  | same cache driver to group types of items stored in your caches.
  |
  */

  stores: {
    array: {
      driver: 'array',
      prefix: 'cache:'
    },

    redis: {
      driver: 'redis',
      connection: 'cache',
      prefix: env('CACHE_PREFIX', 'vasuzex_cache:')
    },

    // Database cache store (if needed)
    database: {
      driver: 'database',
      table: 'cache',
      connection: null,
      prefix: env('CACHE_PREFIX', 'vasuzex_cache:')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Cache Key Prefix
  |--------------------------------------------------------------------------
  |
  | When utilizing a RAM based store such as APC or Memcached, there might
  | be other applications utilizing the same cache. So, we'll specify a
  | value to get prefixed to all our keys so we can avoid collisions.
  |
  */

  prefix: env('CACHE_PREFIX', 'vasuzex_cache')
};
