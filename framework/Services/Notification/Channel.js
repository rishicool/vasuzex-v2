/**
 * Notification Channel Interface
 * Laravel-inspired notification channel contract
 */

export class Channel {
  /**
   * Send the given notification
   * @param {Object} notifiable
   * @param {Object} notification
   * @returns {Promise<void>}
   */
  async send(notifiable, notification) {
    throw new Error('Method send() must be implemented');
  }
}

export default Channel;
