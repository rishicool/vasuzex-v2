/**
 * Session Configuration
 * Laravel-inspired session configuration
 */

const env = (key, fallback = null) => process.env[key] || fallback;

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Session Driver
  |--------------------------------------------------------------------------
  |
  | This option controls the default session "driver" that will be used on
  | requests. By default, we will use the lightweight native driver but
  | you may specify any of the other wonderful drivers provided here.
  |
  */

  driver: env('SESSION_DRIVER', 'cookie'),

  /*
  |--------------------------------------------------------------------------
  | Session Lifetime
  |--------------------------------------------------------------------------
  |
  | Here you may specify the number of minutes that you wish the session
  | to be allowed to remain idle before it expires. If you want them
  | to immediately expire on the browser closing, set that option.
  |
  */

  lifetime: 120, // minutes

  expire_on_close: false,

  /*
  |--------------------------------------------------------------------------
  | Session Encryption
  |--------------------------------------------------------------------------
  |
  | This option allows you to easily specify that all of your session data
  | should be encrypted before it is stored. All encryption will be run
  | automatically by Laravel and you can use the Session like normal.
  |
  */

  encrypt: false,

  /*
  |--------------------------------------------------------------------------
  | Session Cookie Configuration
  |--------------------------------------------------------------------------
  |
  | Here you may configure the cookie settings for session management.
  |
  */

  cookie: {
    name: env('SESSION_COOKIE', 'vasuzex_session'),
    path: '/',
    domain: env('SESSION_DOMAIN', null),
    secure: env('SESSION_SECURE_COOKIE', false),
    http_only: true,
    same_site: 'lax'
  },

  /*
  |--------------------------------------------------------------------------
  | Session Secret
  |--------------------------------------------------------------------------
  |
  | This is the secret key used to sign the session ID cookie. Should be
  | a random string, usually the same as APP_KEY.
  |
  */

  secret: env('SESSION_SECRET', env('APP_KEY')),

  /*
  |--------------------------------------------------------------------------
  | Session Drivers
  |--------------------------------------------------------------------------
  |
  | Configuration for various session drivers
  |
  */

  drivers: {
    cookie: {
      driver: 'cookie'
    },

    file: {
      driver: 'file',
      path: 'storage/framework/sessions'
    },

    database: {
      driver: 'database',
      table: 'sessions',
      connection: null
    },

    redis: {
      driver: 'redis',
      connection: 'session'
    }
  }
};
