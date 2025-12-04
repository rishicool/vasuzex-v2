/**
 * Twilio SMS Driver
 * 
 * Send SMS using Twilio service
 * Documentation: https://www.twilio.com/docs/sms
 * 
 * Required config:
 * - accountSid: Twilio Account SID
 * - authToken: Twilio Auth Token
 * - from: Twilio phone number or Messaging Service SID
 * 
 * @example
 * // config/sms.cjs
 * twilio: {
 *   accountSid: env('TWILIO_ACCOUNT_SID'),
 *   authToken: env('TWILIO_AUTH_TOKEN'),
 *   from: env('TWILIO_FROM_NUMBER')
 * }
 */

export class TwilioDriver {
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
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error('Twilio driver requires accountSid and authToken');
    }

    if (!this.config.from) {
      throw new Error('Twilio driver requires from number or Messaging Service SID');
    }
  }

  /**
   * Get Twilio client (lazy load)
   * 
   * @private
   * @returns {Promise<Object>} Twilio client
   */
  async getClient() {
    if (!this.client) {
      const twilio = await import('twilio');
      this.client = twilio.default(this.config.accountSid, this.config.authToken);
    }
    return this.client;
  }

  /**
   * Send SMS via Twilio
   * 
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (E.164 format)
   * @param {string} options.message - SMS message text
   * @param {string} [options.from] - Override sender number
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * const result = await driver.send({
   *   to: '+919876543210',
   *   message: 'Hello from Twilio!'
   * });
   */
  async send(options) {
    try {
      const { to, message, from } = options;

      // Validate input
      if (!to || !message) {
        throw new Error('Twilio driver requires to and message');
      }

      if (!to.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (e.g., +919876543210)');
      }

      const client = await this.getClient();

      const result = await client.messages.create({
        body: message,
        from: from || this.config.from,
        to: to,
        ...(this.config.messagingServiceSid && {
          messagingServiceSid: this.config.messagingServiceSid
        })
      });

      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio',
        data: {
          sid: result.sid,
          status: result.status,
          to: result.to,
          from: result.from,
          dateCreated: result.dateCreated,
          price: result.price,
          priceUnit: result.priceUnit,
          direction: result.direction,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage
        }
      };
    } catch (error) {
      return {
        success: false,
        messageId: null,
        provider: 'twilio',
        error: {
          message: error.message,
          code: error.code,
          status: error.status
        }
      };
    }
  }

  /**
   * Get message status
   * 
   * @param {string} messageSid - Twilio message SID
   * @returns {Promise<Object>} Message status
   * 
   * @example
   * const status = await driver.getStatus('SM1234567890abcdef');
   */
  async getStatus(messageSid) {
    try {
      const client = await this.getClient();
      const message = await client.messages(messageSid).fetch();

      return {
        success: true,
        status: message.status,
        data: {
          sid: message.sid,
          status: message.status,
          to: message.to,
          from: message.from,
          dateCreated: message.dateCreated,
          dateSent: message.dateSent,
          dateUpdated: message.dateUpdated,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk SMS (batch)
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
      
      // Rate limiting - Twilio recommends 1 message per second for free accounts
      if (this.config.rateLimit) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export default TwilioDriver;
