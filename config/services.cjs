/**
 * Services Configuration
 * 
 * Third-party service integrations and API keys.
 */

function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | JWT Authentication
  |--------------------------------------------------------------------------
  */
  jwt: {
    secret: env('JWT_SECRET', 'your_secret_key'),
    expires_in: env('JWT_EXPIRES_IN', '24h'),
    refresh_expires_in: env('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  /*
  |--------------------------------------------------------------------------
  | Storage Driver
  |--------------------------------------------------------------------------
  */
  storage: {
    driver: env('STORAGE_DRIVER', 'local'),
    
    local: {
      path: env('LOCAL_UPLOAD_PATH', 'uploads'),
    },

    s3: {
      key: env('AWS_ACCESS_KEY_ID', ''),
      secret: env('AWS_SECRET_ACCESS_KEY', ''),
      region: env('AWS_REGION', 'us-east-1'),
      bucket: env('AWS_S3_BUCKET', ''),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Email Service
  |--------------------------------------------------------------------------
  */
  mail: {
    driver: env('MAIL_DRIVER', 'smtp'),
    
    smtp: {
      host: env('MAIL_HOST', 'smtp.mailtrap.io'),
      port: parseInt(env('MAIL_PORT', '2525'), 10),
      username: env('MAIL_USERNAME', ''),
      password: env('MAIL_PASSWORD', ''),
      encryption: env('MAIL_ENCRYPTION', 'tls'),
    },

    sendgrid: {
      api_key: env('SENDGRID_API_KEY', ''),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | SMS Service
  |--------------------------------------------------------------------------
  */
  sms: {
    driver: env('SMS_DRIVER', 'twilio'),
    
    twilio: {
      account_sid: env('TWILIO_ACCOUNT_SID', ''),
      auth_token: env('TWILIO_AUTH_TOKEN', ''),
      from: env('TWILIO_FROM', ''),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Rate Limiting
  |--------------------------------------------------------------------------
  */
  rate_limit: {
    window_ms: parseInt(env('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
    max_requests: parseInt(env('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
};
