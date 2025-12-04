/**
 * Logging Configuration
 * Laravel-inspired logging configuration
 */

const env = (key, fallback = null) => process.env[key] || fallback;

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that gets used when writing
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration array.
  |
  */

  default: env('LOG_CHANNEL', 'stack'),

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application. Out of
  | the box, Laravel uses the Monolog PHP logging library. This gives
  | you a variety of powerful log handlers / formatters to utilize.
  |
  */

  channels: {
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
      ignore_exceptions: false
    },

    console: {
      driver: 'console',
      level: env('LOG_LEVEL', 'debug')
    },

    file: {
      driver: 'file',
      path: 'storage/logs',
      filename: 'app.log',
      level: env('LOG_LEVEL', 'debug'),
      days: 14
    },

    error: {
      driver: 'file',
      path: 'storage/logs',
      filename: 'error.log',
      level: 'error',
      days: 30
    },

    daily: {
      driver: 'file',
      path: 'storage/logs',
      filename: 'daily.log',
      level: env('LOG_LEVEL', 'debug'),
      days: 7
    }
  }
};
