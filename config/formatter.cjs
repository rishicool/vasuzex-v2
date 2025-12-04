/**
 * Formatter Configuration
 * 
 * Configure formatting options for dates, currency, numbers, etc.
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Locale
  |--------------------------------------------------------------------------
  |
  | This option controls the default locale for formatting.
  | Supported: BCP 47 language tags (e.g., 'en-IN', 'en-US', 'hi-IN')
  |
  */

  locale: process.env.APP_LOCALE || 'en-IN',

  /*
  |--------------------------------------------------------------------------
  | Default Timezone
  |--------------------------------------------------------------------------
  |
  | This option controls the default timezone for date/time formatting.
  | Supported: IANA timezone identifiers
  |
  */

  timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',

  /*
  |--------------------------------------------------------------------------
  | Default Currency
  |--------------------------------------------------------------------------
  |
  | This option controls the default currency for formatting.
  | Supported: ISO 4217 currency codes
  |
  */

  currency: process.env.APP_CURRENCY || 'INR',

  /*
  |--------------------------------------------------------------------------
  | Date Formats
  |--------------------------------------------------------------------------
  |
  | Predefined date format options
  |
  */

  dateFormats: {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Time Formats
  |--------------------------------------------------------------------------
  |
  | Predefined time format options
  |
  */

  timeFormats: {
    short: { hour: '2-digit', minute: '2-digit' },
    medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    long: { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      timeZoneName: 'short' 
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Number Formats
  |--------------------------------------------------------------------------
  |
  | Configuration for number formatting
  |
  */

  numberFormat: {
    decimals: 2,
    decimalSeparator: '.',
    thousandSeparator: ',',
  },

  /*
  |--------------------------------------------------------------------------
  | Phone Format
  |--------------------------------------------------------------------------
  |
  | Default phone number format
  | Options: 'spaced', 'dashed', 'grouped'
  |
  */

  phoneFormat: 'spaced',

  /*
  |--------------------------------------------------------------------------
  | File Size Units
  |--------------------------------------------------------------------------
  |
  | Configuration for file size formatting
  |
  */

  fileSizeUnits: ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],

  /*
  |--------------------------------------------------------------------------
  | Truncate Settings
  |--------------------------------------------------------------------------
  |
  | Default settings for text truncation
  |
  */

  truncate: {
    length: 100,
    suffix: '...',
  },
};
