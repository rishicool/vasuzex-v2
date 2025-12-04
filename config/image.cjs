/**
 * Image Configuration
 * 
 * Configure image processing, optimization, and thumbnail generation.
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Image Processing Library
  |--------------------------------------------------------------------------
  |
  | The underlying library used for image processing.
  | Currently only 'sharp' is supported.
  |
  */

  driver: env('IMAGE_DRIVER', 'sharp'),

  /*
  |--------------------------------------------------------------------------
  | Default Quality
  |--------------------------------------------------------------------------
  |
  | Default quality for image compression (1-100).
  | Higher values = better quality but larger file size.
  |
  */

  quality: env('IMAGE_QUALITY', 80),

  /*
  |--------------------------------------------------------------------------
  | Optimization Settings
  |--------------------------------------------------------------------------
  |
  | Default optimization settings for images.
  |
  */

  optimization: {
    // Enable progressive/interlaced encoding
    progressive: env('IMAGE_PROGRESSIVE', true),

    // Strip EXIF/metadata by default
    stripMetadata: env('IMAGE_STRIP_METADATA', true),

    // PNG compression level (0-9)
    compressionLevel: env('IMAGE_COMPRESSION_LEVEL', 9),

    // WebP lossless mode
    lossless: env('IMAGE_LOSSLESS', false),

    // Auto-orient images based on EXIF
    autoOrient: env('IMAGE_AUTO_ORIENT', true),
  },

  /*
  |--------------------------------------------------------------------------
  | Resize Settings
  |--------------------------------------------------------------------------
  |
  | Default settings for image resizing.
  |
  */

  resize: {
    // Fit mode: cover, contain, fill, inside, outside
    fit: env('IMAGE_RESIZE_FIT', 'cover'),

    // Position: center, top, bottom, left, right
    position: env('IMAGE_RESIZE_POSITION', 'center'),

    // Don't enlarge images smaller than target size
    withoutEnlargement: env('IMAGE_RESIZE_NO_ENLARGE', false),

    // Background color for transparent areas
    background: {
      r: 255,
      g: 255,
      b: 255,
      alpha: 1,
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Thumbnail Presets
  |--------------------------------------------------------------------------
  |
  | Predefined thumbnail configurations for common use cases.
  |
  */

  thumbnails: {
    avatar: [
      { width: 32, height: 32, suffix: '_tiny' },
      { width: 64, height: 64, suffix: '_small' },
      { width: 128, height: 128, suffix: '_medium' },
      { width: 256, height: 256, suffix: '_large' },
    ],

    product: [
      { width: 150, height: 150, suffix: '_thumb' },
      { width: 300, height: 300, suffix: '_small' },
      { width: 600, height: 600, suffix: '_medium' },
      { width: 1200, height: 1200, suffix: '_large' },
    ],

    blog: [
      { width: 400, height: 300, suffix: '_thumb', fit: 'cover' },
      { width: 800, height: 600, suffix: '_medium', fit: 'cover' },
      { width: 1600, height: 1200, suffix: '_large', fit: 'cover' },
    ],

    gallery: [
      { width: 200, height: 200, suffix: '_thumb', fit: 'cover' },
      { width: 400, height: 400, suffix: '_small', fit: 'cover' },
      { width: 800, height: 800, suffix: '_medium', fit: 'cover' },
      { width: 1600, height: 1600, suffix: '_large', fit: 'inside' },
    ],

    responsive: [
      { width: 320, suffix: '_xs' },
      { width: 640, suffix: '_sm' },
      { width: 1024, suffix: '_md' },
      { width: 1920, suffix: '_lg' },
      { width: 2560, suffix: '_xl' },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Watermark Settings
  |--------------------------------------------------------------------------
  |
  | Default watermark configuration.
  |
  */

  watermark: {
    enabled: env('IMAGE_WATERMARK_ENABLED', false),
    image: env('IMAGE_WATERMARK_PATH'),
    position: env('IMAGE_WATERMARK_POSITION', 'bottom-right'),
    opacity: env('IMAGE_WATERMARK_OPACITY', 0.5),
    padding: env('IMAGE_WATERMARK_PADDING', 10),
    width: env('IMAGE_WATERMARK_WIDTH'),
    height: env('IMAGE_WATERMARK_HEIGHT'),
  },

  /*
  |--------------------------------------------------------------------------
  | Format Conversion
  |--------------------------------------------------------------------------
  |
  | Settings for format conversion.
  |
  */

  conversion: {
    // Automatically convert to WebP
    autoWebP: env('IMAGE_AUTO_WEBP', false),

    // Automatically convert to AVIF
    autoAVIF: env('IMAGE_AUTO_AVIF', false),

    // Quality for converted images
    webpQuality: env('IMAGE_WEBP_QUALITY', 85),
    avifQuality: env('IMAGE_AVIF_QUALITY', 85),

    // Preserve original along with converted
    preserveOriginal: env('IMAGE_PRESERVE_ORIGINAL', false),
  },

  /*
  |--------------------------------------------------------------------------
  | Smart Optimization
  |--------------------------------------------------------------------------
  |
  | Automatically adjust quality based on image characteristics.
  |
  */

  smartOptimization: {
    enabled: env('IMAGE_SMART_OPTIMIZATION', false),

    // Use modern formats (WebP, AVIF) when beneficial
    modernFormats: env('IMAGE_USE_MODERN_FORMATS', false),

    // Maximum dimensions before reducing quality
    maxDimension: env('IMAGE_MAX_DIMENSION', 2000),

    // Quality reduction for large images
    largeImageQuality: env('IMAGE_LARGE_QUALITY', 75),
  },

  /*
  |--------------------------------------------------------------------------
  | Limits
  |--------------------------------------------------------------------------
  |
  | Processing limits to prevent resource exhaustion.
  |
  */

  limits: {
    // Maximum image dimensions
    maxWidth: env('IMAGE_MAX_WIDTH', 5000),
    maxHeight: env('IMAGE_MAX_HEIGHT', 5000),

    // Maximum file size (bytes)
    maxFileSize: env('IMAGE_MAX_FILE_SIZE', 20 * 1024 * 1024), // 20MB

    // Maximum concurrent processing
    maxConcurrent: env('IMAGE_MAX_CONCURRENT', 5),
  },

  /*
  |--------------------------------------------------------------------------
  | Output Settings
  |--------------------------------------------------------------------------
  |
  | Default output settings for processed images.
  |
  */

  output: {
    // Default output directory
    directory: env('IMAGE_OUTPUT_DIR', './storage/images'),

    // Filename strategy: 'original', 'timestamp', 'hash'
    filenameStrategy: env('IMAGE_FILENAME_STRATEGY', 'timestamp'),

    // Preserve directory structure
    preserveStructure: env('IMAGE_PRESERVE_STRUCTURE', false),
  },

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  |
  | Available image filters and their default settings.
  |
  */

  filters: {
    // Blur amount (0.3-1000)
    blur: {
      default: 5,
      min: 0.3,
      max: 1000,
    },

    // Sharpen amount
    sharpen: {
      default: 1,
      min: 0.1,
      max: 10,
    },

    // Brightness adjustment (-1 to 1)
    brightness: {
      default: 0,
      min: -1,
      max: 1,
    },

    // Saturation adjustment (-1 to 1)
    saturation: {
      default: 0,
      min: -1,
      max: 1,
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Crop Settings
  |--------------------------------------------------------------------------
  |
  | Settings for image cropping.
  |
  */

  crop: {
    // Enable smart crop (focus on important areas)
    smart: env('IMAGE_SMART_CROP', false),

    // Default crop gravity
    gravity: env('IMAGE_CROP_GRAVITY', 'center'),
  },

  /*
  |--------------------------------------------------------------------------
  | Cache Settings
  |--------------------------------------------------------------------------
  |
  | Cache processed images to avoid repeated processing.
  |
  */

  cache: {
    enabled: env('IMAGE_CACHE_ENABLED', false),
    driver: env('IMAGE_CACHE_DRIVER', 'file'),
    ttl: env('IMAGE_CACHE_TTL', 86400), // 24 hours
    directory: env('IMAGE_CACHE_DIR', './storage/cache/images'),
  },
};

/**
 * Helper function to get environment variable
 */
function env(key, defaultValue = null) {
  const value = process.env[key];
  
  if (value === undefined || value === null) {
    return defaultValue;
  }

  // Convert string booleans
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Convert string numbers
  if (!isNaN(value)) return Number(value);

  return value;
}
