/**
 * Notification Configuration
 * Laravel-inspired notification configuration
 */

const env = (key, fallback = null) => process.env[key] || fallback;

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Notification Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default notification channel that will be used
  | to send notifications. You may set this to any of the channels defined
  | in the "channels" configuration array.
  |
  */

  default: env('NOTIFICATION_CHANNEL', 'mail'),

  /*
  |--------------------------------------------------------------------------
  | Notification Channels
  |--------------------------------------------------------------------------
  |
  | Here you may define all of the notification channels for your application
  | as well as their settings. Several examples have been provided to get
  | you started with common notification channels.
  |
  */

  channels: {
    mail: {
      // Uses mail configuration from mail.cjs
    },

    sms: {
      // Uses SMS configuration from services.cjs
    },

    database: {
      table: 'notifications'
    },

    slack: {
      webhook_url: env('SLACK_WEBHOOK_URL')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Notification Queue
  |--------------------------------------------------------------------------
  |
  | By default, notifications will be sent synchronously. However, you may
  | queue notifications by setting the queue option. If queueing is enabled,
  | notifications will be sent using the configured queue connection.
  |
  */

  queue: env('NOTIFICATION_QUEUE', null),

  /*
  |--------------------------------------------------------------------------
  | Database Notifications Settings
  |--------------------------------------------------------------------------
  |
  | Configure settings for database-stored notifications
  |
  */

  database: {
    table: 'notifications',
    // Auto-delete read notifications after X days (null = never)
    delete_read_after_days: env('NOTIFICATION_DELETE_READ_AFTER_DAYS', 30),
    // Auto-delete unread notifications after X days (null = never)
    delete_unread_after_days: env('NOTIFICATION_DELETE_UNREAD_AFTER_DAYS', 90)
  }
};
