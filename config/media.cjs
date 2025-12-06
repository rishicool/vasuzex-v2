/**
 * Media Configuration
 * 
 * Configure centralized media server settings.
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Cache Configuration
  |--------------------------------------------------------------------------
  |
  | Configure thumbnail cache settings.
  |
  */

  cache: {
    // Cache directory path
    path: env('MEDIA_CACHE_PATH', './storage/media/cache'),

    // Cache TTL in milliseconds (default: 7 days)
    ttl: env('MEDIA_CACHE_TTL', 7 * 24 * 60 * 60 * 1000),
  },

  /*
  |--------------------------------------------------------------------------
  | Thumbnail Configuration
  |--------------------------------------------------------------------------
  |
  | Configure thumbnail generation settings.
  |
  */

  thumbnails: {
    // Maximum dimensions
    max_width: env('MEDIA_MAX_WIDTH', 2048),
    max_height: env('MEDIA_MAX_HEIGHT', 2048),

    // Default quality (1-100)
    quality: env('MEDIA_QUALITY', 85),

    // Resize fit mode: cover, contain, fill, inside, outside
    fit: env('MEDIA_FIT', 'cover'),

    // Position for cropping: center, top, bottom, left, right, etc.
    position: env('MEDIA_POSITION', 'center'),

    // Strict sizes mode (only allow predefined sizes)
    strict_sizes: env('MEDIA_STRICT_SIZES', false),

    // Allowed thumbnail sizes
    allowed_sizes: [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 },
      { name: 'avatar', width: 200, height: 200 },
      { name: 'product', width: 800, height: 800 },
      { name: 'banner', width: 1920, height: 400 },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | CORS Configuration
  |--------------------------------------------------------------------------
  |
  | Configure CORS for media server.
  |
  */

  cors: {
    // Allow all origins for media files
    origin: env('MEDIA_CORS_ORIGIN', '*'),

    // Allowed methods
    methods: ['GET', 'HEAD'],

    // Max age
    maxAge: env('MEDIA_CORS_MAX_AGE', 86400),
  },

  /*
  |--------------------------------------------------------------------------
  | Response Headers
  |--------------------------------------------------------------------------
  |
  | Default headers for media responses.
  |
  */

  headers: {
    // Cache control for browsers
    'Cache-Control': env('MEDIA_CACHE_CONTROL', 'public, max-age=604800, immutable'),

    // Content security policy
    'Cross-Origin-Resource-Policy': 'cross-origin',
    
    // Vary header for content negotiation
    'Vary': 'Accept',
  },

  /*
  |--------------------------------------------------------------------------
  | Format Conversion
  |--------------------------------------------------------------------------
  |
  | Automatic format conversion based on browser support.
  |
  */

  formats: {
    // Enable WebP conversion
    enableWebP: env('MEDIA_ENABLE_WEBP', true),

    // Enable AVIF conversion
    enableAVIF: env('MEDIA_ENABLE_AVIF', false),

    // Enable automatic format detection from Accept header
    autoDetect: env('MEDIA_AUTO_DETECT_FORMAT', true),
  },

  /*
  |--------------------------------------------------------------------------
  | ETag & Last-Modified
  |--------------------------------------------------------------------------
  |
  | Enable browser caching validation headers.
  |
  */

  caching: {
    // Enable ETag headers
    enableETag: env('MEDIA_ENABLE_ETAG', true),

    // Enable Last-Modified headers
    enableLastModified: env('MEDIA_ENABLE_LAST_MODIFIED', true),
  },

  /*
  |--------------------------------------------------------------------------
  | CDN Integration
  |--------------------------------------------------------------------------
  |
  | Enable CDN for media delivery.
  |
  */

  cdn: {
    // Use CDN for media URLs
    enabled: env('MEDIA_CDN_ENABLED', false),

    // CDN base URL (uses config/cdn.cjs if not specified)
    baseUrl: env('MEDIA_CDN_BASE_URL', ''),
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

function env(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined || value === null) return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value) && value !== '') return Number(value);
  return value;
}
