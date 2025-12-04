/**
 * 2Factor SMS Driver (India-specific)
 * 
 * Send SMS using 2Factor service (https://2factor.in)
 * Popular in India for OTP and transactional SMS
 * 
 * Required config:
 * - apiKey: 2Factor API key
 * 
 * Optional config:
 * - senderId: 6-character sender ID (default: 'SMSIND')
 * 
 * @example
 * // config/sms.cjs
 * twofactor: {
 *   apiKey: env('TWOFACTOR_API_KEY'),
 *   senderId: 'MYAPP'
 * }
 */

export class TwoFactorDriver {
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://2factor.in/API/V1';
    
    this.validateConfig();
  }

  /**
   * Validate required configuration
   * 
   * @private
   * @throws {Error} If required config missing
   */
  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('2Factor driver requires apiKey');
    }
  }

  /**
   * Clean Indian phone number
   * 
   * @private
   * @param {string} phone - Phone number
   * @returns {string} Cleaned 10-digit number
   */
  cleanPhoneNumber(phone) {
    // Remove +91 prefix and any non-numeric characters
    return phone.replace(/^\+91/, '').replace(/[^0-9]/g, '');
  }

  /**
   * Validate Indian phone number
   * 
   * @private
   * @param {string} phone - Phone number
   * @throws {Error} If invalid phone number
   */
  validatePhoneNumber(phone) {
    const cleaned = this.cleanPhoneNumber(phone);
    
    if (cleaned.length !== 10) {
      throw new Error('Invalid Indian phone number. Must be 10 digits.');
    }

    // Indian mobile numbers start with 6, 7, 8, or 9
    if (!['6', '7', '8', '9'].includes(cleaned[0])) {
      throw new Error('Invalid Indian mobile number. Must start with 6, 7, 8, or 9.');
    }
  }

  /**
   * Send SMS via 2Factor
   * 
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (10 digits or +91XXXXXXXXXX)
   * @param {string} options.message - SMS message text
   * @param {string} [options.senderId] - 6-character sender ID
   * @returns {Promise<Object>} Response object
   * 
   * @example
   * const result = await driver.send({
   *   to: '+919876543210',
   *   message: 'Hello from 2Factor!'
   * });
   */
  async send(options) {
    try {
      const { to, message, senderId } = options;

      // Validate input
      if (!to || !message) {
        throw new Error('2Factor driver requires to and message');
      }

      this.validatePhoneNumber(to);
      const phoneNumber = this.cleanPhoneNumber(to);

      // 2Factor API endpoint for sending SMS
      const url = `${this.baseUrl}/${this.config.apiKey}/ADDON_SERVICES/SEND/TSMS`;

      const params = new URLSearchParams({
        From: senderId || this.config.senderId || 'SMSIND',
        To: phoneNumber,
        Msg: message
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      // 2Factor response format:
      // Success: { Status: "Success", Details: "session_id" }
      // Error: { Status: "Error", Details: "error message" }

      if (result.Status === 'Success') {
        return {
          success: true,
          messageId: result.Details,
          provider: '2factor',
          data: {
            status: result.Status,
            sessionId: result.Details,
            to: phoneNumber
          }
        };
      } else {
        throw new Error(result.Details || 'Failed to send SMS');
      }
    } catch (error) {
      return {
        success: false,
        messageId: null,
        provider: '2factor',
        error: {
          message: error.message
        }
      };
    }
  }

  /**
   * Send OTP using 2Factor's auto-generated OTP service
   * This is a specialized method - 2Factor generates and sends the OTP
   * 
   * @param {string} phoneNumber - Indian phone number (10 digits or +91XXXXXXXXXX)
   * @param {Object} [options={}] - Additional options
   * @param {number} [options.otpLength=6] - OTP length (4 or 6)
   * @returns {Promise<Object>} Response with session ID for verification
   * 
   * @example
   * const result = await driver.sendAutoOtp('+919876543210');
   * // Returns: { success: true, sessionId: 'xxx', ... }
   * // Later verify with: driver.verifyOtp(sessionId, userEnteredOtp)
   */
  async sendAutoOtp(phoneNumber, options = {}) {
    try {
      this.validatePhoneNumber(phoneNumber);
      const phone = this.cleanPhoneNumber(phoneNumber);

      // 2Factor OTP endpoint - they generate and send OTP
      const otpType = options.otpLength === 4 ? 'AUTOGEN4' : 'AUTOGEN';
      const url = `${this.baseUrl}/${this.config.apiKey}/SMS/${phone}/${otpType}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.Status === 'Success') {
        return {
          success: true,
          sessionId: result.Details,
          provider: '2factor-otp',
          data: {
            status: result.Status,
            sessionId: result.Details,
            phone: phone
          }
        };
      } else {
        throw new Error(result.Details || 'Failed to send OTP');
      }
    } catch (error) {
      return {
        success: false,
        sessionId: null,
        provider: '2factor-otp',
        error: {
          message: error.message
        }
      };
    }
  }

  /**
   * Verify OTP sent via sendAutoOtp
   * 
   * @param {string} sessionId - Session ID from sendAutoOtp response
   * @param {string} otp - OTP entered by user
   * @returns {Promise<Object>} Verification result
   * 
   * @example
   * const result = await driver.verifyOtp(sessionId, '123456');
   * // Returns: { verified: true, ... } or { verified: false, ... }
   */
  async verifyOtp(sessionId, otp) {
    try {
      if (!sessionId || !otp) {
        throw new Error('Session ID and OTP are required');
      }

      const url = `${this.baseUrl}/${this.config.apiKey}/SMS/VERIFY/${sessionId}/${otp}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      // Success: { Status: "Success", Details: "OTP Matched" }
      // Error: { Status: "Error", Details: "OTP Mismatch" }

      return {
        success: true,
        verified: result.Status === 'Success',
        provider: '2factor-otp',
        data: {
          status: result.Status,
          details: result.Details
        }
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        provider: '2factor-otp',
        error: {
          message: error.message
        }
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
      
      // Rate limiting - add small delay between messages
      if (this.config.rateLimit) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  /**
   * Get delivery report for a sent SMS
   * 
   * @param {string} sessionId - Session ID from send response
   * @returns {Promise<Object>} Delivery report
   * 
   * @example
   * const report = await driver.getDeliveryReport(sessionId);
   */
  async getDeliveryReport(sessionId) {
    try {
      const url = `${this.baseUrl}/${this.config.apiKey}/ADDON_SERVICES/SEND/TSMS_REPORT/${sessionId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message
        }
      };
    }
  }
}

export default TwoFactorDriver;
