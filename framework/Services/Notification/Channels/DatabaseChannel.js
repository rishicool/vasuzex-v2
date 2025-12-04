/**
 * Database Notification Channel
 * Laravel-inspired database notification channel
 */

import { Channel } from '../Channel.js';

export class DatabaseChannel extends Channel {
  constructor(database) {
    super();
    this.database = database;
  }

  /**
   * Send the given notification
   */
  async send(notifiable, notification) {
    if (!notification.toDatabase && !notification.toArray) {
      return;
    }

    const data = notification.toDatabase 
      ? notification.toDatabase(notifiable)
      : notification.toArray(notifiable);

    if (!data) {
      return;
    }

    await this.database.table('notifications').insert({
      id: this.generateId(),
      type: notification.constructor.name,
      notifiable_type: notifiable.constructor.name,
      notifiable_id: notifiable.id,
      data: JSON.stringify(data),
      read_at: null,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Generate a unique ID for the notification
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default DatabaseChannel;
