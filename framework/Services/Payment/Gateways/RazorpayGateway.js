import crypto from "crypto";
import Razorpay from "razorpay";
import { PaymentGateway } from "../PaymentGateway.js";

/**
 * RazorpayGateway - Razorpay payment gateway integration
 *
 * Supports UPI, Cards, Wallets, NetBanking, EMI
 * Documentation: https://razorpay.com/docs/api/
 */
export class RazorpayGateway extends PaymentGateway {
  /**
   * Create a new Razorpay gateway instance
   *
   * @param {Object} config - Gateway configuration
   */
  constructor(config) {
    super(config);

    this.validateConfig(["keyId", "keySecret"]);

    this.client = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });

    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Get gateway name
   *
   * @returns {string}
   */
  getName() {
    return "Razorpay";
  }

  /**
   * Create a payment order
   *
   * @param {Object} data - Payment data
   * @param {number} data.amount - Amount in rupees
   * @param {string} data.currency - Currency code (default: INR)
   * @param {string} data.receipt - Receipt ID
   * @param {Object} data.notes - Additional notes
   * @returns {Promise<Object>} Order response
   */
  async createPayment(data) {
    try {
      const {
        amount,
        currency = this.currency,
        receipt = this.generateOrderId("RCPT"),
        notes = {},
      } = data;

      // Create order
      const order = await this.client.orders.create({
        amount: this.formatAmount(amount, true), // Convert to paise
        currency,
        receipt,
        notes,
      });

      return this.buildSuccessResponse({
        orderId: order.id,
        amount: order.amount / 100, // Convert back to rupees
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        raw: order,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Verify payment signature
   *
   * @param {Object} data - Verification data
   * @param {string} data.orderId - Order ID
   * @param {string} data.paymentId - Payment ID
   * @param {string} data.signature - Payment signature
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(data) {
    try {
      const { orderId, paymentId, signature } = data;

      if (!orderId || !paymentId || !signature) {
        throw new Error("orderId, paymentId, and signature are required");
      }

      // Generate expected signature
      const generatedSignature = this.generateSignature(orderId, paymentId);

      // Verify signature
      const isValid = generatedSignature === signature;

      // Fetch payment details if valid
      let payment = null;
      if (isValid) {
        payment = await this.client.payments.fetch(paymentId);
      }

      return this.buildSuccessResponse({
        verified: isValid,
        paymentId,
        orderId,
        status: payment?.status,
        amount: payment ? payment.amount / 100 : null,
        method: payment?.method,
        email: payment?.email,
        contact: payment?.contact,
        raw: payment,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Capture a payment
   *
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Capture data
   * @param {number} data.amount - Amount to capture (in rupees)
   * @param {string} data.currency - Currency code
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(paymentId, data = {}) {
    try {
      const {
        amount,
        currency = this.currency,
      } = data;

      if (!amount) {
        throw new Error("amount is required for payment capture");
      }

      // Capture payment
      const payment = await this.client.payments.capture(
        paymentId,
        this.formatAmount(amount, true), // Convert to paise
        currency
      );

      return this.buildSuccessResponse({
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        captured: payment.captured,
        raw: payment,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Refund a payment
   *
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Refund data
   * @param {number} data.amount - Refund amount (optional, full refund if not specified)
   * @param {Object} data.notes - Additional notes
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentId, data = {}) {
    try {
      const {
        amount,
        notes = {},
      } = data;

      const refundData = { notes };

      // Partial refund if amount specified
      if (amount) {
        refundData.amount = this.formatAmount(amount, true);
      }

      // Create refund
      const refund = await this.client.payments.refund(paymentId, refundData);

      return this.buildSuccessResponse({
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        raw: refund,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Get payment details
   *
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    try {
      const payment = await this.client.payments.fetch(paymentId);

      return this.buildSuccessResponse({
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        captured: payment.captured,
        email: payment.email,
        contact: payment.contact,
        createdAt: new Date(payment.created_at * 1000),
        raw: payment,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Get order details
   *
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(orderId) {
    try {
      const order = await this.client.orders.fetch(orderId);

      return this.buildSuccessResponse({
        orderId: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        attempts: order.attempts,
        createdAt: new Date(order.created_at * 1000),
        raw: order,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Handle webhook callback
   *
   * @param {Object} payload - Webhook payload
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Webhook result
   */
  async handleWebhook(payload, headers = {}) {
    try {
      // Get signature from headers
      const signature = headers["x-razorpay-signature"] || headers["X-Razorpay-Signature"];

      // Verify signature
      const isValid = this.validateWebhookSignature(payload, signature);

      if (!isValid) {
        throw new Error("Invalid webhook signature");
      }

      const { event, payload: eventPayload } = payload;

      // Extract relevant data based on event type
      const result = {
        verified: true,
        event,
        entity: eventPayload.payment?.entity || eventPayload.order?.entity || null,
      };

      // Parse payment entity if present
      if (eventPayload.payment?.entity) {
        const payment = eventPayload.payment.entity;
        result.paymentId = payment.id;
        result.orderId = payment.order_id;
        result.amount = payment.amount / 100;
        result.status = payment.status;
      }

      // Parse order entity if present
      if (eventPayload.order?.entity) {
        const order = eventPayload.order.entity;
        result.orderId = order.id;
        result.amount = order.amount / 100;
        result.status = order.status;
      }

      result.raw = payload;

      return this.buildSuccessResponse(result);
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Validate webhook signature
   *
   * @param {Object} payload - Webhook payload
   * @param {string} signature - X-Razorpay-Signature header
   * @returns {boolean} Is valid
   */
  validateWebhookSignature(payload, signature) {
    if (!signature || !this.webhookSecret) {
      return false;
    }

    try {
      // Razorpay sends raw body, so we need to stringify if it's an object
      const body = typeof payload === "string" ? payload : JSON.stringify(payload);

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(body)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate payment signature
   *
   * @private
   * @param {string} orderId - Order ID
   * @param {string} paymentId - Payment ID
   * @returns {string} HMAC SHA256 signature
   */
  generateSignature(orderId, paymentId) {
    const message = `${orderId}|${paymentId}`;
    return crypto
      .createHmac("sha256", this.config.keySecret)
      .update(message)
      .digest("hex");
  }

  /**
   * Create a payment link
   *
   * @param {Object} data - Payment link data
   * @param {number} data.amount - Amount in rupees
   * @param {string} data.description - Link description
   * @param {Object} data.customer - Customer details
   * @returns {Promise<Object>} Payment link
   */
  async createPaymentLink(data) {
    try {
      const {
        amount,
        currency = this.currency,
        description,
        customer = {},
        notes = {},
      } = data;

      const link = await this.client.paymentLink.create({
        amount: this.formatAmount(amount, true),
        currency,
        description,
        customer,
        notes,
      });

      return this.buildSuccessResponse({
        linkId: link.id,
        shortUrl: link.short_url,
        amount: link.amount / 100,
        status: link.status,
        raw: link,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }
}
