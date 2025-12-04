/**
 * SMS Notification Channel
 * Laravel-inspired SMS notification channel
 */

import { Channel } from '../Channel.js';

export class SmsChannel extends Channel {
  constructor(sms) {
    super();
    this.sms = sms;
  }

  /**
   * Send the given notification
   */
  async send(notifiable, notification) {
    if (!notification.toSms) {
      return;
    }

    const message = notification.toSms(notifiable);

    if (!message) {
      return;
    }

    const to = this.getRecipient(notifiable, message);

    await this.sms.send({
      to,
      message: message.content || message.text || message
    });
  }

  /**
   * Get the recipient for the notification
   */
  getRecipient(notifiable, message) {
    if (message.to) {
      return message.to;
    }

    if (typeof notifiable.routeNotificationFor === 'function') {
      return notifiable.routeNotificationFor('sms');
    }

    return notifiable.phone || notifiable.mobile;
  }
}

export default SmsChannel;
