/**
 * Log SMS Driver
 * 
 * Logs SMS messages instead of actually sending them.
 * Perfect for local development and testing.
 * 
 * Optional config:
 * - channel: Log channel to use (default: 'sms')
 * - level: Log level (default: 'info')
 * 
 * @example
 * // config/sms.cjs
 * log: {
 *   channel: 'sms',
 *   level: 'info'
 * }
 */

export class LogDriver {
  constructor(app, config = {}) {
    this.app = app;
    this.config = config;
    this.messages = []; // Store messages in memory for testing
  }

  /**
   * Send SMS (log only)
   * 
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number
   * @param {string} options.message - SMS message text
   * @param {string} [options.from] - Sender name/number
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * const result = await driver.send({
   *   to: '+919876543210',
   *   message: 'Test SMS'
   * });
   */
  async send(options) {
    try {
      const { to, message, from } = options;

      // Validate input
      if (!to || !message) {
        throw new Error('Log driver requires to and message');
      }

      // Generate fake message ID
      const messageId = this.generateMessageId();

      // Store message in memory
      const messageData = {
        id: messageId,
        to,
        from: from || 'System',
        message,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };

      this.messages.push(messageData);

      // Log the message
      this.log(messageData);

      return {
        success: true,
        messageId,
        provider: 'log',
        data: messageData
      };
    } catch (error) {
      return {
        success: false,
        messageId: null,
        provider: 'log',
        error: {
          message: error.message
        }
      };
    }
  }

  /**
   * Log message to console
   * 
   * @private
   * @param {Object} messageData - Message data
   */
  log(messageData) {
    const level = this.config.level || 'info';
    const channel = this.config.channel || 'sms';

    const logMessage = `
╔══════════════════════════════════════════════════════════════
║ 📱 SMS Message (${channel})
╟──────────────────────────────────────────────────────────────
║ To: ${messageData.to}
║ From: ${messageData.from}
║ Message ID: ${messageData.id}
║ Timestamp: ${messageData.timestamp}
╟──────────────────────────────────────────────────────────────
║ Message:
║ ${messageData.message}
╚══════════════════════════════════════════════════════════════
    `.trim();

    // Use app logger if available, otherwise console
    if (this.app && this.app.log) {
      this.app.log[level](logMessage);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * Generate fake message ID
   * 
   * @private
   * @returns {string} Message ID
   */
  generateMessageId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `log_${timestamp}_${random}`;
  }

  /**
   * Get message by ID (from memory)
   * 
   * @param {string} messageId - Message ID
   * @returns {Object|null} Message data or null
   * 
   * @example
   * const message = driver.getMessage(messageId);
   */
  getMessage(messageId) {
    return this.messages.find(msg => msg.id === messageId) || null;
  }

  /**
   * Get all messages (from memory)
   * 
   * @returns {Array} All messages
   * 
   * @example
   * const allMessages = driver.getAllMessages();
   */
  getAllMessages() {
    return [...this.messages];
  }

  /**
   * Clear all messages from memory
   * 
   * @example
   * driver.clear();
   */
  clear() {
    this.messages = [];
  }

  /**
   * Get messages sent to specific number
   * 
   * @param {string} phoneNumber - Phone number
   * @returns {Array} Messages sent to this number
   * 
   * @example
   * const messages = driver.getMessagesTo('+919876543210');
   */
  getMessagesTo(phoneNumber) {
    return this.messages.filter(msg => msg.to === phoneNumber);
  }

  /**
   * Send bulk SMS (log only)
   * 
   * @param {Array<Object>} messages - Array of message objects
   * @returns {Promise<Array>} Array of results
   */
  async sendBulk(messages) {
    const results = [];

    for (const msg of messages) {
      const result = await this.send(msg);
      results.push(result);
    }

    return results;
  }

  /**
   * Get status (fake implementation)
   * 
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Status
   */
  async getStatus(messageId) {
    const message = this.getMessage(messageId);

    if (message) {
      return {
        success: true,
        status: 'delivered',
        data: message
      };
    }

    return {
      success: false,
      error: 'Message not found'
    };
  }
}

export default LogDriver;
