/**
 * Mail Notification Channel
 * Laravel-inspired mail notification channel
 */

import { Channel } from '../Channel.js';

export class MailChannel extends Channel {
  constructor(mailer) {
    super();
    this.mailer = mailer;
  }

  /**
   * Send the given notification
   */
  async send(notifiable, notification) {
    if (!notification.toMail) {
      return;
    }

    const message = notification.toMail(notifiable);

    if (!message) {
      return;
    }

    const to = this.getRecipient(notifiable, message);

    await this.mailer.send({
      to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      from: message.from
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
      return notifiable.routeNotificationFor('mail');
    }

    return notifiable.email;
  }
}

export default MailChannel;
