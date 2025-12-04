/**
 * Notification
 * Laravel-inspired base notification class
 */

export class Notification {
  /**
   * Get the notification's delivery channels
   * @param {Object} notifiable
   * @returns {Array<string>}
   */
  via(notifiable) {
    return ['mail'];
  }

  /**
   * Get the mail representation of the notification
   * @param {Object} notifiable
   * @returns {Object|null}
   */
  toMail(notifiable) {
    return null;
  }

  /**
   * Get the SMS representation of the notification
   * @param {Object} notifiable
   * @returns {Object|string|null}
   */
  toSms(notifiable) {
    return null;
  }

  /**
   * Get the database representation of the notification
   * @param {Object} notifiable
   * @returns {Object|null}
   */
  toDatabase(notifiable) {
    return this.toArray(notifiable);
  }

  /**
   * Get the array representation of the notification
   * @param {Object} notifiable
   * @returns {Object|null}
   */
  toArray(notifiable) {
    return null;
  }

  /**
   * Determine if the notification should be sent
   * @param {Object} notifiable
   * @param {string} channel
   * @returns {boolean}
   */
  shouldSend(notifiable, channel) {
    return true;
  }
}

export default Notification;
