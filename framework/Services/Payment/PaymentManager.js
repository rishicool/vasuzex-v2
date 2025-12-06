/**
 * PaymentManager - Manage multiple payment gateways with strategy pattern
 *
 * Laravel-inspired payment gateway manager with driver pattern
 */
export class PaymentManager {
  /**
   * Create a new payment manager instance
   *
   * @param {Object} app - Application instance
   */
  constructor(app) {
    this.app = app;
    this.config = app.make("config").get("payment", {});
    this.gateways = new Map();
    this.customCreators = new Map();
    this.defaultGateway = this.config.default || "razorpay";
  }

  /**
   * Get a payment gateway instance
   *
   * @param {string|null} name - Gateway name
   * @returns {Object} Payment gateway
   */
  gateway(name = null) {
    name = name || this.getDefaultGateway();

    if (this.gateways.has(name)) {
      return this.gateways.get(name);
    }

    const gateway = this.resolve(name);
    this.gateways.set(name, gateway);

    return gateway;
  }

  /**
   * Resolve a payment gateway instance
   *
   * @private
   * @param {string} name - Gateway name
   * @returns {Object} Payment gateway
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config) {
      throw new Error(`Payment gateway [${name}] is not configured`);
    }

    // Check for custom creator
    if (this.customCreators.has(name)) {
      return this.customCreators.get(name)(config);
    }

    // Use built-in driver
    const driverMethod = `create${this.capitalize(name)}Driver`;

    if (typeof this[driverMethod] === "function") {
      return this[driverMethod](config);
    }

    throw new Error(`Payment gateway driver [${name}] is not supported`);
  }

  /**
   * Create PhonePe gateway driver
   *
   * @param {Object} config - Gateway configuration
   * @returns {Object} PhonePe gateway
   */
  createPhonepeDriver(config) {
    const { PhonePeGateway } = require("./Gateways/PhonePeGateway.js");
    return new PhonePeGateway(config);
  }

  /**
   * Create Razorpay gateway driver
   *
   * @param {Object} config - Gateway configuration
   * @returns {Object} Razorpay gateway
   */
  createRazorpayDriver(config) {
    const { RazorpayGateway } = require("./Gateways/RazorpayGateway.js");
    return new RazorpayGateway(config);
  }

  /**
   * Create Stripe gateway driver
   *
   * @param {Object} config - Gateway configuration
   * @returns {Object} Stripe gateway
   */
  createStripeDriver(config) {
    const { StripeGateway } = require("./Gateways/StripeGateway.js");
    return new StripeGateway(config);
  }

  /**
   * Create a payment
   *
   * @param {Object} data - Payment data
   * @param {string|null} gateway - Gateway name
   * @returns {Promise<Object>} Payment response
   */
  async createPayment(data, gateway = null) {
    return this.gateway(gateway).createPayment(data);
  }

  /**
   * Verify a payment
   *
   * @param {Object} data - Verification data
   * @param {string|null} gateway - Gateway name
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(data, gateway = null) {
    return this.gateway(gateway).verifyPayment(data);
  }

  /**
   * Capture a payment
   *
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Capture data
   * @param {string|null} gateway - Gateway name
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(paymentId, data = {}, gateway = null) {
    return this.gateway(gateway).capturePayment(paymentId, data);
  }

  /**
   * Refund a payment
   *
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Refund data
   * @param {string|null} gateway - Gateway name
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentId, data = {}, gateway = null) {
    return this.gateway(gateway).refundPayment(paymentId, data);
  }

  /**
   * Get payment details
   *
   * @param {string} paymentId - Payment ID
   * @param {string|null} gateway - Gateway name
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId, gateway = null) {
    return this.gateway(gateway).getPayment(paymentId);
  }

  /**
   * Handle webhook
   *
   * @param {Object} payload - Webhook payload
   * @param {Object} headers - Request headers
   * @param {string|null} gateway - Gateway name
   * @returns {Promise<Object>} Webhook result
   */
  async handleWebhook(payload, headers = {}, gateway = null) {
    return this.gateway(gateway).handleWebhook(payload, headers);
  }

  /**
   * Get gateway configuration
   *
   * @private
   * @param {string} name - Gateway name
   * @returns {Object|null} Gateway configuration
   */
  getConfig(name) {
    return this.config.gateways?.[name] || null;
  }

  /**
   * Get default gateway name
   *
   * @returns {string} Default gateway
   */
  getDefaultGateway() {
    return this.defaultGateway;
  }

  /**
   * Set default gateway
   *
   * @param {string} name - Gateway name
   * @returns {this}
   */
  setDefaultGateway(name) {
    this.defaultGateway = name;
    return this;
  }

  /**
   * Register a custom gateway creator
   *
   * @param {string} name - Gateway name
   * @param {Function} creator - Creator function
   * @returns {this}
   */
  extend(name, creator) {
    this.customCreators.set(name, creator);
    return this;
  }

  /**
   * Get all registered gateway names
   *
   * @returns {Array<string>} Gateway names
   */
  getAvailableGateways() {
    const configured = Object.keys(this.config.gateways || {});
    const custom = Array.from(this.customCreators.keys());
    return [...new Set([...configured, ...custom])];
  }

  /**
   * Purge a gateway instance from cache
   *
   * @param {string|null} name - Gateway name
   * @returns {this}
   */
  purge(name = null) {
    if (name) {
      this.gateways.delete(name);
    } else {
      this.gateways.clear();
    }
    return this;
  }

  /**
   * Capitalize first letter
   *
   * @private
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Dynamically call gateway methods
   *
   * @param {string|null} gateway - Gateway name
   * @returns {Object} Gateway instance
   */
  __call(gateway = null) {
    return this.gateway(gateway);
  }
}
