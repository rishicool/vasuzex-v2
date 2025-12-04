/**
 * Notification Manager
 * Laravel-inspired notification manager with multiple channel support
 */

import { MailChannel } from './Channels/MailChannel.js';
import { SmsChannel } from './Channels/SmsChannel.js';
import { DatabaseChannel } from './Channels/DatabaseChannel.js';

export class NotificationManager {
  constructor(app) {
    this.app = app;
    this.channels = {};
    this.customCreators = {};
    this.locale = null;
  }

  /**
   * Send the given notification to the given notifiable entities
   */
  async send(notifiables, notification) {
    const notifiableArray = Array.isArray(notifiables) ? notifiables : [notifiables];

    for (const notifiable of notifiableArray) {
      await this.sendToNotifiable(notifiable, notification);
    }
  }

  /**
   * Send the given notification immediately (skip queue)
   */
  async sendNow(notifiables, notification, channels = null) {
    const notifiableArray = Array.isArray(notifiables) ? notifiables : [notifiables];

    for (const notifiable of notifiableArray) {
      await this.sendToNotifiable(notifiable, notification, channels);
    }
  }

  /**
   * Send notification to a single notifiable entity
   */
  async sendToNotifiable(notifiable, notification, channels = null) {
    const viaChannels = channels || notification.via(notifiable);

    for (const channelName of viaChannels) {
      if (!notification.shouldSend(notifiable, channelName)) {
        continue;
      }

      const channel = this.channel(channelName);
      
      try {
        await channel.send(notifiable, notification);
      } catch (error) {
        console.error(`Failed to send notification via ${channelName}:`, error.message);
        // Continue with other channels even if one fails
      }
    }
  }

  /**
   * Get a channel instance
   */
  channel(name = null) {
    name = name || this.getDefaultChannel();

    if (!this.channels[name]) {
      this.channels[name] = this.resolve(name);
    }

    return this.channels[name];
  }

  /**
   * Resolve the given channel
   */
  resolve(name) {
    if (this.customCreators[name]) {
      return this.callCustomCreator(name);
    }

    const driverMethod = `create${this.capitalize(name)}Driver`;

    if (typeof this[driverMethod] === 'function') {
      return this[driverMethod]();
    }

    // Try to load channel as a class
    if (typeof name === 'function') {
      return new name(this.app);
    }

    throw new Error(`Channel [${name}] is not supported.`);
  }

  /**
   * Call a custom channel creator
   */
  callCustomCreator(name) {
    return this.customCreators[name](this.app);
  }

  /**
   * Create an instance of the mail driver
   */
  createMailDriver() {
    const mailer = this.app.make('mail');
    return new MailChannel(mailer);
  }

  /**
   * Create an instance of the SMS driver
   */
  createSmsDriver() {
    const sms = this.app.make('sms');
    return new SmsChannel(sms);
  }

  /**
   * Create an instance of the database driver
   */
  createDatabaseDriver() {
    const database = this.app.make('db');
    return new DatabaseChannel(database);
  }

  /**
   * Get the default channel name
   */
  getDefaultChannel() {
    return this.app.config('notification.default', 'mail');
  }

  /**
   * Set the default channel name
   */
  setDefaultChannel(channel) {
    this.defaultChannel = channel;
  }

  /**
   * Get the locale for notifications
   */
  getLocale() {
    return this.locale;
  }

  /**
   * Set the locale for notifications
   */
  locale(locale) {
    this.locale = locale;
    return this;
  }

  /**
   * Register a custom notification channel
   */
  extend(name, callback) {
    this.customCreators[name] = callback;
    return this;
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default NotificationManager;
