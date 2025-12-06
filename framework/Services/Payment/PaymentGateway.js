/**
 * PaymentGateway - Abstract base class for payment gateways
 *
 * @abstract
 */
export class PaymentGateway {
  /**
   * Create a new payment gateway instance
   *
   * @param {Object} config - Gateway configuration
   */
  constructor(config = {}) {
    if (new.target === PaymentGateway) {
      throw new Error("PaymentGateway is an abstract class and cannot be instantiated directly");
    }

    this.config = config;
    this.environment = config.environment || "sandbox";
    this.currency = config.currency || "INR";
  }

  /**
   * Create a payment/order
   *
   * @abstract
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} Payment response
   */
  async createPayment(data) {
    throw new Error("Method createPayment() must be implemented by subclass");
  }

  /**
   * Verify payment signature/status
   *
   * @abstract
   * @param {Object} data - Verification data
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(data) {
    throw new Error("Method verifyPayment() must be implemented by subclass");
  }

  /**
   * Capture/confirm payment
   *
   * @abstract
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Capture data
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(paymentId, data = {}) {
    throw new Error("Method capturePayment() must be implemented by subclass");
  }

  /**
   * Refund payment
   *
   * @abstract
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Refund data
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentId, data = {}) {
    throw new Error("Method refundPayment() must be implemented by subclass");
  }

  /**
   * Get payment details
   *
   * @abstract
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    throw new Error("Method getPayment() must be implemented by subclass");
  }

  /**
   * Handle webhook callback
   *
   * @abstract
   * @param {Object} payload - Webhook payload
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Webhook processing result
   */
  async handleWebhook(payload, headers = {}) {
    throw new Error("Method handleWebhook() must be implemented by subclass");
  }

  /**
   * Validate webhook signature
   *
   * @abstract
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {boolean} Is valid
   */
  validateWebhookSignature(payload, signature) {
    throw new Error("Method validateWebhookSignature() must be implemented by subclass");
  }

  /**
   * Get gateway name
   *
   * @abstract
   * @returns {string} Gateway name
   */
  getName() {
    throw new Error("Method getName() must be implemented by subclass");
  }

  /**
   * Check if gateway is in production mode
   *
   * @returns {boolean}
   */
  isProduction() {
    return this.environment === "production";
  }

  /**
   * Get API base URL based on environment
   *
   * @param {string} productionUrl - Production URL
   * @param {string} sandboxUrl - Sandbox URL
   * @returns {string} Base URL
   */
  getBaseUrl(productionUrl, sandboxUrl) {
    return this.isProduction() ? productionUrl : sandboxUrl;
  }

  /**
   * Format amount based on gateway requirements
   *
   * @param {number} amount - Amount in rupees/dollars
   * @param {boolean} inPaise - Convert to paise/cents
   * @returns {number} Formatted amount
   */
  formatAmount(amount, inPaise = false) {
    if (inPaise) {
      return Math.round(amount * 100);
    }
    return parseFloat(amount.toFixed(2));
  }

  /**
   * Generate unique order ID
   *
   * @param {string} prefix - Prefix for order ID
   * @returns {string} Order ID
   */
  generateOrderId(prefix = "ORDER") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate required configuration
   *
   * @param {Array<string>} requiredKeys - Required config keys
   * @throws {Error} If required keys are missing
   */
  validateConfig(requiredKeys) {
    const missing = requiredKeys.filter((key) => !this.config[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration for ${this.getName()}: ${missing.join(", ")}`
      );
    }
  }

  /**
   * Build error response
   *
   * @param {Error} error - Error object
   * @returns {Object} Error response
   */
  buildErrorResponse(error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "PAYMENT_ERROR",
        details: error.details || null,
      },
    };
  }

  /**
   * Build success response
   *
   * @param {Object} data - Response data
   * @returns {Object} Success response
   */
  buildSuccessResponse(data) {
    return {
      success: true,
      data,
    };
  }
}
