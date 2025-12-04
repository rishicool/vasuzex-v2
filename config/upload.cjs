/**
 * Upload Configuration
 * 
 * Configure file upload disks, validation, and security settings.
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Upload Disk
  |--------------------------------------------------------------------------
  |
  | Default disk to use for file uploads.
  | Supported: "local", "s3", "spaces"
  |
  */

  default: env('UPLOAD_DISK', 'local'),

  /*
  |--------------------------------------------------------------------------
  | Upload Disks
  |--------------------------------------------------------------------------
  |
  | Configure different storage disks for file uploads.
  | Each disk can have different drivers and configurations.
  |
  */

  disks: {
    local: {
      driver: 'local',
      root: env('UPLOAD_LOCAL_ROOT', './storage/uploads'),
      url: env('UPLOAD_LOCAL_URL', '/storage/uploads'),
      visibility: 'public',
    },

    s3: {
      driver: 's3',
      region: env('AWS_REGION', 'us-east-1'),
      bucket: env('AWS_BUCKET', 'my-bucket'),
      key: env('AWS_ACCESS_KEY_ID'),
      secret: env('AWS_SECRET_ACCESS_KEY'),
      url: env('AWS_URL'),
      visibility: env('AWS_VISIBILITY', 'public'),
    },

    spaces: {
      driver: 'spaces',
      region: env('DO_SPACES_REGION', 'nyc3'),
      bucket: env('DO_SPACES_BUCKET', 'my-space'),
      key: env('DO_SPACES_KEY'),
      secret: env('DO_SPACES_SECRET'),
      endpoint: env('DO_SPACES_ENDPOINT'),
      cdn: env('DO_SPACES_CDN'),
      url: env('DO_SPACES_URL'),
      use_cdn: env('DO_SPACES_USE_CDN', true),
      visibility: env('DO_SPACES_VISIBILITY', 'public'),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Default Validation Rules
  |--------------------------------------------------------------------------
  |
  | Default validation rules applied to all uploads unless overridden.
  |
  */

  validation: {
    // Maximum file size in bytes (10MB default)
    maxSize: env('UPLOAD_MAX_SIZE', 10 * 1024 * 1024),

    // Minimum file size in bytes
    minSize: env('UPLOAD_MIN_SIZE', 0),

    // Allowed MIME types (empty array = allow all)
    allowedTypes: [],

    // Blocked MIME types
    blockedTypes: [
      'application/x-msdownload',
      'application/x-msdos-program',
      'application/x-executable',
      'application/x-sharedlib',
    ],

    // Allowed file extensions (empty array = allow all)
    allowedExtensions: [],

    // Blocked file extensions
    blockedExtensions: [
      '.exe', '.dll', '.bat', '.cmd', '.com', '.scr',
      '.php', '.phtml', '.php3', '.php4', '.php5',
      '.asp', '.aspx', '.jsp', '.sh', '.bash',
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Image Validation Rules
  |--------------------------------------------------------------------------
  |
  | Validation rules specific to image uploads.
  |
  */

  image: {
    maxSize: env('UPLOAD_IMAGE_MAX_SIZE', 5 * 1024 * 1024), // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    dimensions: {
      minWidth: env('UPLOAD_IMAGE_MIN_WIDTH', 10),
      maxWidth: env('UPLOAD_IMAGE_MAX_WIDTH', 5000),
      minHeight: env('UPLOAD_IMAGE_MIN_HEIGHT', 10),
      maxHeight: env('UPLOAD_IMAGE_MAX_HEIGHT', 5000),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Document Validation Rules
  |--------------------------------------------------------------------------
  |
  | Validation rules specific to document uploads.
  |
  */

  document: {
    maxSize: env('UPLOAD_DOCUMENT_MAX_SIZE', 20 * 1024 * 1024), // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    allowedExtensions: [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv',
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Video Validation Rules
  |--------------------------------------------------------------------------
  |
  | Validation rules specific to video uploads.
  |
  */

  video: {
    maxSize: env('UPLOAD_VIDEO_MAX_SIZE', 100 * 1024 * 1024), // 100MB
    allowedTypes: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo',
    ],
    allowedExtensions: ['.mp4', '.mpeg', '.mov', '.webm', '.avi'],
  },

  /*
  |--------------------------------------------------------------------------
  | Audio Validation Rules
  |--------------------------------------------------------------------------
  |
  | Validation rules specific to audio uploads.
  |
  */

  audio: {
    maxSize: env('UPLOAD_AUDIO_MAX_SIZE', 20 * 1024 * 1024), // 20MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    allowedExtensions: ['.mp3', '.wav', '.ogg', '.webm'],
  },

  /*
  |--------------------------------------------------------------------------
  | Security Settings
  |--------------------------------------------------------------------------
  |
  | Security options for file uploads.
  |
  */

  security: {
    // Enable security scanning
    scan: env('UPLOAD_SECURITY_SCAN', true),

    // Maximum file size for security (prevents zip bombs)
    max_size: env('UPLOAD_SECURITY_MAX_SIZE', 100 * 1024 * 1024), // 100MB

    // Validate file signatures (magic bytes)
    validate_signatures: env('UPLOAD_SECURITY_VALIDATE_SIGNATURES', true),

    // Custom virus scanner (optional)
    custom_scanner: env('UPLOAD_SECURITY_CUSTOM_SCANNER')
      ? {
          type: env('UPLOAD_SECURITY_SCANNER_TYPE', 'clamav'),
          host: env('UPLOAD_SECURITY_SCANNER_HOST', 'localhost'),
          port: env('UPLOAD_SECURITY_SCANNER_PORT', 3310),
          timeout: env('UPLOAD_SECURITY_SCANNER_TIMEOUT', 60000),
        }
      : null,

    // Sanitize filenames
    sanitize_filenames: env('UPLOAD_SECURITY_SANITIZE_FILENAMES', true),
  },

  /*
  |--------------------------------------------------------------------------
  | Image Processing Settings
  |--------------------------------------------------------------------------
  |
  | Default image processing options.
  |
  */

  processing: {
    // Auto-orient images based on EXIF data
    autoOrient: env('UPLOAD_PROCESSING_AUTO_ORIENT', true),

    // Default image quality (1-100)
    quality: env('UPLOAD_PROCESSING_QUALITY', 80),

    // Convert images to WebP by default
    convertToWebP: env('UPLOAD_PROCESSING_CONVERT_WEBP', false),

    // Default resize options
    resize: {
      fit: env('UPLOAD_PROCESSING_RESIZE_FIT', 'cover'),
      position: env('UPLOAD_PROCESSING_RESIZE_POSITION', 'center'),
    },

    // Default thumbnail sizes
    thumbnails: [
      {
        width: 200,
        height: 200,
        suffix: '_thumb',
        fit: 'cover',
      },
      {
        width: 400,
        height: 400,
        suffix: '_medium',
        fit: 'cover',
      },
    ],

    // Watermark settings
    watermark: {
      enabled: env('UPLOAD_PROCESSING_WATERMARK_ENABLED', false),
      image: env('UPLOAD_PROCESSING_WATERMARK_IMAGE'),
      position: env('UPLOAD_PROCESSING_WATERMARK_POSITION', 'bottom-right'),
      opacity: env('UPLOAD_PROCESSING_WATERMARK_OPACITY', 0.5),
      padding: env('UPLOAD_PROCESSING_WATERMARK_PADDING', 10),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Upload Paths
  |--------------------------------------------------------------------------
  |
  | Default paths for different types of uploads.
  |
  */

  paths: {
    images: env('UPLOAD_PATH_IMAGES', 'uploads/images'),
    documents: env('UPLOAD_PATH_DOCUMENTS', 'uploads/documents'),
    videos: env('UPLOAD_PATH_VIDEOS', 'uploads/videos'),
    audio: env('UPLOAD_PATH_AUDIO', 'uploads/audio'),
    avatars: env('UPLOAD_PATH_AVATARS', 'uploads/avatars'),
    products: env('UPLOAD_PATH_PRODUCTS', 'uploads/products'),
    temp: env('UPLOAD_PATH_TEMP', 'uploads/temp'),
  },

  /*
  |--------------------------------------------------------------------------
  | Filename Generation
  |--------------------------------------------------------------------------
  |
  | Options for automatic filename generation.
  |
  */

  filename: {
    // Strategy: 'timestamp', 'uuid', 'hash', 'original'
    strategy: env('UPLOAD_FILENAME_STRATEGY', 'timestamp'),

    // Preserve original filename
    preserveOriginal: env('UPLOAD_FILENAME_PRESERVE_ORIGINAL', false),

    // Add random string to filename
    addRandomString: env('UPLOAD_FILENAME_ADD_RANDOM', true),

    // Random string length
    randomLength: env('UPLOAD_FILENAME_RANDOM_LENGTH', 6),
  },

  /*
  |--------------------------------------------------------------------------
  | CDN Settings
  |--------------------------------------------------------------------------
  |
  | CDN configuration for serving uploaded files.
  |
  */

  cdn: {
    enabled: env('UPLOAD_CDN_ENABLED', false),
    url: env('UPLOAD_CDN_URL'),
    path: env('UPLOAD_CDN_PATH', ''),
  },
};

/**
 * Helper function to get environment variable
 */
function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}
