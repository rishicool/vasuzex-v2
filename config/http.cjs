/**
 * HTTP Configuration
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Base URL
  |--------------------------------------------------------------------------
  |
  | Default base URL for HTTP requests.
  |
  */

  base_url: env('HTTP_BASE_URL', null),

  /*
  |--------------------------------------------------------------------------
  | Timeout
  |--------------------------------------------------------------------------
  |
  | Default request timeout in milliseconds.
  |
  */

  timeout: env('HTTP_TIMEOUT', 30000),

  /*
  |--------------------------------------------------------------------------
  | Headers
  |--------------------------------------------------------------------------
  |
  | Default headers to include in all requests.
  |
  */

  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },

  /*
  |--------------------------------------------------------------------------
  | Retry
  |--------------------------------------------------------------------------
  |
  | Default retry configuration.
  |
  */

  retry: {
    times: env('HTTP_RETRY_TIMES', 0),
    delay: env('HTTP_RETRY_DELAY', 1000),
  },
};

function env(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined || value === null) return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(value)) return Number(value);
  return value;
}
