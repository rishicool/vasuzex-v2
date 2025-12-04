/**
 * Filesystem Configuration
 * 
 * Configure storage disks for file management.
 * Supports local, S3, and custom drivers.
 */

function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Filesystem Disk
  |--------------------------------------------------------------------------
  */
  default: env('FILESYSTEM_DRIVER', 'local'),

  /*
  |--------------------------------------------------------------------------
  | Default Cloud Filesystem Disk
  |--------------------------------------------------------------------------
  */
  cloud: env('FILESYSTEM_CLOUD', 's3'),

  /*
  |--------------------------------------------------------------------------
  | Filesystem Disks
  |--------------------------------------------------------------------------
  |
  | Supported Drivers: "local", "s3"
  |
  */
  disks: {
    local: {
      driver: 'local',
      root: env('LOCAL_STORAGE_PATH', 'storage/app'),
      url: env('APP_URL', 'http://localhost') + '/storage',
    },

    public: {
      driver: 'local',
      root: env('PUBLIC_STORAGE_PATH', 'storage/app/public'),
      url: env('APP_URL', 'http://localhost') + '/storage',
    },

    uploads: {
      driver: 'local',
      root: env('UPLOADS_PATH', 'uploads'),
      url: env('APP_URL', 'http://localhost') + '/uploads',
    },

    s3: {
      driver: 's3',
      key: env('AWS_ACCESS_KEY_ID', ''),
      secret: env('AWS_SECRET_ACCESS_KEY', ''),
      region: env('AWS_REGION', 'us-east-1'),
      bucket: env('AWS_S3_BUCKET', ''),
      url: env('AWS_S3_URL', null),
      endpoint: env('AWS_ENDPOINT', null),
    },
  },
};
