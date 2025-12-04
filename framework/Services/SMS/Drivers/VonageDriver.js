/**
 * Vonage (Nexmo) SMS Driver
 * 
 * Send SMS using Vonage Communications APIs (formerly Nexmo)
 * Documentation: https://developer.vonage.com/messaging/sms/overview
 * 
 * Required config:
 * - apiKey: Vonage API key
 * - apiSecret: Vonage API secret
 * - from: Sender name or number
 * 
 * @example
 * // config/sms.cjs
 * vonage: {
 *   apiKey: env('VONAGE_API_KEY'),
 *   apiSecret: env('VONAGE_API_SECRET'),
 *   from: 'MyApp'
 * }
 */

export class VonageDriver {
  constructor(config) {
    this.config = config;
    this.client = null;
    
    this.validateConfig();
  }

  /**
   * Validate required configuration
   * 
   * @private
   * @throws {Error} If required config missing
   */
  validateConfig() {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Vonage driver requires apiKey and apiSecret');
    }

    if (!this.config.from) {
      throw new Error('Vonage driver requires from name or number');
    }
  }

  /**
   * Get Vonage client (lazy load)
   * 
   * @private
   * @returns {Promise<Object>} Vonage client
   */
  async getClient() {
    if (!this.client) {
      const { Vonage } = await import('@vonage/server-sdk');
      
      this.client = new Vonage({
        apiKey: this.config.apiKey,
        apiSecret: this.config.apiSecret
      });
    }
    return this.client;
  }

  /**
   * Send SMS via Vonage
   * 
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (E.164 format)
   * @param {string} options.message - SMS message text
   * @param {string} [options.from] - Override sender name/number
   * @param {string} [options.type] - Message type: 'text' (default) or 'unicode'
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * const result = await driver.send({
   *   to: '+919876543210',
   *   message: 'Hello from Vonage!'
   * });
   */
  async send(options) {
    try {
      const { to, message, from, type } = options;

      // Validate input
      if (!to || !message) {
        throw new Error('Vonage driver requires to and message');
      }

      if (!to.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (e.g., +919876543210)');
      }

      const client = await this.getClient();

      // Remove + prefix for Vonage
      const cleanTo = to.replace(/^\+/, '');

      const result = await new Promise((resolve, reject) => {
        client.message.sendSms(
          from || this.config.from,
          cleanTo,
          message,
          {
            type: type || 'text'
          },
          (err, responseData) => {
            if (err) {
              reject(err);
            } else {
              resolve(responseData);
            }
          }
        );
      });

      // Vonage returns array of message objects
      const messageData = result.messages[0];

      if (messageData.status === '0') {
        return {
          success: true,
          messageId: messageData['message-id'],
          provider: 'vonage',
          data: {
            messageId: messageData['message-id'],
            to: messageData.to,
            status: messageData.status,
            remainingBalance: messageData['remaining-balance'],
            messagePrice: messageData['message-price'],
            network: messageData.network
          }
        };
      } else {
        throw new Error(messageData['error-text'] || 'Failed to send SMS');
      }
    } catch (error) {
      return {
        success: false,
        messageId: null,
        provider: 'vonage',
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
  }

  /**
   * Get delivery receipt status
   * 
   * @param {string} messageId - Vonage message ID
   * @returns {Promise<Object>} Delivery status
   * 
   * Note: Vonage requires webhook setup for delivery receipts
   * This method checks the status from your webhook storage
   * 
   * @example
   * const status = await driver.getStatus(messageId);
   */
  async getStatus(messageId) {
    try {
      // Note: Vonage doesn't provide a direct API to fetch message status
      // You need to implement webhook handling to receive delivery receipts
      // This is a placeholder implementation
      
      return {
        success: true,
        messageId,
        note: 'Vonage requires webhook setup for delivery receipts. Implement webhook handler to track status.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk SMS
   * 
   * @param {Array<Object>} messages - Array of message objects
   * @returns {Promise<Array>} Array of results
   * 
   * @example
   * const results = await driver.sendBulk([
   *   { to: '+919876543210', message: 'Hello User 1' },
   *   { to: '+919876543211', message: 'Hello User 2' }
   * ]);
   */
  async sendBulk(messages) {
    const results = [];

    for (const msg of messages) {
      const result = await this.send(msg);
      results.push(result);
      
      // Rate limiting
      if (this.config.rateLimit) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get account balance
   * 
   * @returns {Promise<Object>} Account balance
   * 
   * @example
   * const balance = await driver.getBalance();
   */
  async getBalance() {
    try {
      const client = await this.getClient();

      const result = await new Promise((resolve, reject) => {
        client.account.checkBalance((err, responseData) => {
          if (err) {
            reject(err);
          } else {
            resolve(responseData);
          }
        });
      });

      return {
        success: true,
        balance: result.value,
        autoReload: result.autoReload
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default VonageDriver;
