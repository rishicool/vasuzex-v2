/**
 * Mail Configuration
 * 
 * Configure mail sending through different transports.
 */

function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Mailer
  |--------------------------------------------------------------------------
  */
  default: env('MAIL_MAILER', 'smtp'),

  /*
  |--------------------------------------------------------------------------
  | Mailer Configurations
  |--------------------------------------------------------------------------
  |
  | Supported: "smtp", "sendgrid", "ses", "mailgun"
  |
  */
  mailers: {
    smtp: {
      transport: 'smtp',
      host: env('MAIL_HOST', 'smtp.mailtrap.io'),
      port: parseInt(env('MAIL_PORT', '2525'), 10),
      encryption: env('MAIL_ENCRYPTION', 'tls'),
      username: env('MAIL_USERNAME'),
      password: env('MAIL_PASSWORD'),
      timeout: 3000,
    },

    sendgrid: {
      transport: 'sendgrid',
      api_key: env('SENDGRID_API_KEY'),
    },

    ses: {
      transport: 'ses',
      key: env('AWS_ACCESS_KEY_ID'),
      secret: env('AWS_SECRET_ACCESS_KEY'),
      region: env('AWS_DEFAULT_REGION', 'us-east-1'),
    },

    mailgun: {
      transport: 'mailgun',
      domain: env('MAILGUN_DOMAIN'),
      secret: env('MAILGUN_SECRET'),
      endpoint: env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Global "From" Address
  |--------------------------------------------------------------------------
  */
  from: {
    address: env('MAIL_FROM_ADDRESS', 'noreply@example.com'),
    name: env('MAIL_FROM_NAME', 'Neastore'),
  },
};
