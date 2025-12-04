/**
 * Translation Configuration
 */

const path = require('path');
const env = process.env;

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Language
  |--------------------------------------------------------------------------
  |
  | The default language of your application.
  |
  */

  locale: env.APP_LOCALE || 'en',

  /*
  |--------------------------------------------------------------------------
  | Fallback Language
  |--------------------------------------------------------------------------
  |
  | The fallback language used when the current one is not available.
  |
  */

  fallback_locale: env.APP_FALLBACK_LOCALE || 'en',

  /*
  |--------------------------------------------------------------------------
  | Translation File Path
  |--------------------------------------------------------------------------
  |
  | Path where translation files are stored.
  |
  */

  path: path.resolve(process.cwd(), 'resources/lang'),
};
