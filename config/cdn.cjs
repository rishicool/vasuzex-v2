/**
 * CDN Configuration
 *
 * Configure Content Delivery Network settings for static assets
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | CDN Provider
  |--------------------------------------------------------------------------
  |
  | CDN provider to use for asset delivery.
  |
  | Supported: "cloudfront", "cloudflare", "custom"
  |
  */

  provider: env("CDN_PROVIDER", "cloudfront"),

  /*
  |--------------------------------------------------------------------------
  | Enable CDN
  |--------------------------------------------------------------------------
  |
  | Enable or disable CDN usage. When disabled, local URLs will be used.
  |
  */

  enabled: env("CDN_ENABLED", false),

  /*
  |--------------------------------------------------------------------------
  | CDN Base URL
  |--------------------------------------------------------------------------
  |
  | Base URL for your CDN. All asset URLs will be prefixed with this.
  |
  | Examples:
  | - CloudFront: https://d123456abcdef.cloudfront.net
  | - Cloudflare: https://assets.yourdomain.com
  | - Custom CDN: https://cdn.yourdomain.com
  |
  */

  baseUrl: env("CDN_BASE_URL", ""),

  /*
  |--------------------------------------------------------------------------
  | CloudFront Configuration
  |--------------------------------------------------------------------------
  |
  | AWS CloudFront specific settings.
  |
  */

  cloudfront: {
    // Distribution ID for cache invalidation
    distributionId: env("CLOUDFRONT_DISTRIBUTION_ID", ""),

    // Key Pair ID for signed URLs
    keyPairId: env("CLOUDFRONT_KEY_PAIR_ID", ""),

    // Private key path for signed URLs
    privateKeyPath: env("CLOUDFRONT_PRIVATE_KEY_PATH", ""),

    // Default expiration for signed URLs (seconds)
    signedUrlExpiration: env("CLOUDFRONT_SIGNED_URL_EXPIRATION", 3600),
  },

  /*
  |--------------------------------------------------------------------------
  | Cloudflare Configuration
  |--------------------------------------------------------------------------
  |
  | Cloudflare specific settings.
  |
  */

  cloudflare: {
    // Zone ID for cache purge
    zoneId: env("CLOUDFLARE_ZONE_ID", ""),

    // API email
    email: env("CLOUDFLARE_EMAIL", ""),

    // API key
    apiKey: env("CLOUDFLARE_API_KEY", ""),

    // Enable automatic image optimization
    imageOptimization: env("CLOUDFLARE_IMAGE_OPTIMIZATION", true),
  },

  /*
  |--------------------------------------------------------------------------
  | Custom CDN Configuration
  |--------------------------------------------------------------------------
  |
  | Settings for custom CDN providers.
  |
  */

  custom: {
    // Base URL
    baseUrl: env("CUSTOM_CDN_BASE_URL", ""),

    // Cache purge endpoint
    purgeEndpoint: env("CUSTOM_CDN_PURGE_ENDPOINT", ""),

    // API key
    apiKey: env("CUSTOM_CDN_API_KEY", ""),
  },

  /*
  |--------------------------------------------------------------------------
  | Asset Paths
  |--------------------------------------------------------------------------
  |
  | Define which paths should use CDN.
  |
  */

  paths: {
    // Images
    images: env("CDN_IMAGES_PATH", "images"),

    // CSS files
    css: env("CDN_CSS_PATH", "css"),

    // JavaScript files
    js: env("CDN_JS_PATH", "js"),

    // Fonts
    fonts: env("CDN_FONTS_PATH", "fonts"),

    // Other static assets
    static: env("CDN_STATIC_PATH", "static"),
  },

  /*
  |--------------------------------------------------------------------------
  | Image Transformation
  |--------------------------------------------------------------------------
  |
  | Default image transformation settings.
  |
  */

  images: {
    // Default quality (1-100)
    defaultQuality: env("CDN_IMAGE_QUALITY", 85),

    // Auto WebP conversion
    autoWebP: env("CDN_AUTO_WEBP", true),

    // Auto AVIF conversion
    autoAVIF: env("CDN_AUTO_AVIF", false),

    // Responsive breakpoints
    breakpoints: [320, 640, 768, 1024, 1280, 1920],

    // Max dimensions
    maxWidth: env("CDN_MAX_WIDTH", 2048),
    maxHeight: env("CDN_MAX_HEIGHT", 2048),
  },

  /*
  |--------------------------------------------------------------------------
  | Cache Settings
  |--------------------------------------------------------------------------
  |
  | CDN caching behavior configuration.
  |
  */

  cache: {
    // Default TTL (seconds)
    ttl: env("CDN_CACHE_TTL", 604800), // 7 days

    // Cache immutable assets
    immutable: env("CDN_CACHE_IMMUTABLE", true),

    // Browser cache max-age (seconds)
    browserMaxAge: env("CDN_BROWSER_MAX_AGE", 604800),

    // CDN edge cache max-age (seconds)
    edgeMaxAge: env("CDN_EDGE_MAX_AGE", 2592000), // 30 days
  },

  /*
  |--------------------------------------------------------------------------
  | Security
  |--------------------------------------------------------------------------
  |
  | CDN security settings.
  |
  */

  security: {
    // Enable signed URLs for protected content
    enableSignedUrls: env("CDN_SIGNED_URLS", false),

    // CORS allowed origins
    corsOrigins: env("CDN_CORS_ORIGINS", "*"),

    // Enable hotlink protection
    hotlinkProtection: env("CDN_HOTLINK_PROTECTION", false),

    // Allowed referrers for hotlink protection
    allowedReferrers: [],
  },
};

function env(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined || value === null) return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;
  if (!isNaN(value) && value !== "") return Number(value);
  return value;
}
