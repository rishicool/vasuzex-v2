/**
 * SMS Configuration
 * 
 * Configure SMS sending through different drivers.
 * 
 * Supported drivers: "twilio", "aws-sns", "twofactor", "vonage", "log"
 */

function env(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default SMS Driver
  |--------------------------------------------------------------------------
  |
  | This option controls the default SMS driver that will be used to send
  | any SMS messages. You may change this default when needed or use
  | multiple drivers.
  |
  | Supported: "twilio", "aws-sns", "twofactor", "vonage", "log"
  |
  */
  default: env('SMS_DRIVER', 'log'),

  /*
  |--------------------------------------------------------------------------
  | SMS Driver Configurations
  |--------------------------------------------------------------------------
  |
  | Here you may configure all of the SMS "drivers" for your application.
  | Examples have been provided for each driver to get you started.
  |
  */
  drivers: {
    /*
    |--------------------------------------------------------------------------
    | Twilio Driver
    |--------------------------------------------------------------------------
    |
    | Twilio is one of the most popular SMS services worldwide.
    | Get credentials from: https://www.twilio.com/console
    |
    | Required: accountSid, authToken, from
    |
    */
    twilio: {
      accountSid: env('TWILIO_ACCOUNT_SID'),
      authToken: env('TWILIO_AUTH_TOKEN'),
      from: env('TWILIO_FROM_NUMBER'),
      
      // Optional: Use Messaging Service SID instead of from number
      // messagingServiceSid: env('TWILIO_MESSAGING_SERVICE_SID'),
      
      // Optional: Enable rate limiting
      rateLimit: false,
    },

    /*
    |--------------------------------------------------------------------------
    | AWS SNS Driver
    |--------------------------------------------------------------------------
    |
    | Amazon Simple Notification Service (SNS) for SMS.
    | Get credentials from: https://console.aws.amazon.com/iam/
    |
    | Required: region, accessKeyId, secretAccessKey
    |
    */
    aws_sns: {
      region: env('AWS_REGION', 'us-east-1'),
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
      
      // SMS type: 'Promotional' or 'Transactional'
      // Transactional is higher priority and more expensive
      smsType: 'Transactional',
      
      // Optional: Sender ID (not supported in all countries)
      // senderId: 'MyApp',
      
      // Optional: Enable rate limiting
      rateLimit: false,
    },

    /*
    |--------------------------------------------------------------------------
    | 2Factor Driver (India)
    |--------------------------------------------------------------------------
    |
    | 2Factor is a popular SMS service provider in India.
    | Get API key from: https://2factor.in/
    |
    | Required: apiKey
    |
    */
    twofactor: {
      apiKey: env('TWOFACTOR_API_KEY'),
      
      // Sender ID (6 characters, must be approved by 2Factor)
      senderId: env('TWOFACTOR_SENDER_ID', 'SMSIND'),
      
      // Optional: Enable rate limiting
      rateLimit: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Vonage Driver (formerly Nexmo)
    |--------------------------------------------------------------------------
    |
    | Vonage Communications APIs for SMS.
    | Get credentials from: https://dashboard.nexmo.com/
    |
    | Required: apiKey, apiSecret, from
    |
    */
    vonage: {
      apiKey: env('VONAGE_API_KEY'),
      apiSecret: env('VONAGE_API_SECRET'),
      from: env('VONAGE_FROM', 'Vonage'),
      
      // Optional: Enable rate limiting
      rateLimit: false,
    },

    /*
    |--------------------------------------------------------------------------
    | Log Driver (Testing)
    |--------------------------------------------------------------------------
    |
    | The log driver writes SMS messages to the log instead of sending them.
    | Perfect for local development and testing.
    |
    */
    log: {
      channel: 'sms',
      level: 'info',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | From Name/Number
  |--------------------------------------------------------------------------
  |
  | Default "from" name or number for SMS messages.
  | Some drivers may override this with their own configuration.
  |
  */
  from: env('SMS_FROM', 'App'),

  /*
  |--------------------------------------------------------------------------
  | Queue Connection
  |--------------------------------------------------------------------------
  |
  | Queue connection to use for sending SMS asynchronously.
  | Set to null to send SMS synchronously.
  |
  */
  queue: env('SMS_QUEUE_CONNECTION', null),
};
