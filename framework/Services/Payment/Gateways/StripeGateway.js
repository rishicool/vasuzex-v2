import Stripe from "stripe";
import { PaymentGateway } from "../PaymentGateway.js";

/**
 * StripeGateway - Stripe payment gateway integration
 *
 * Supports Cards, Wallets (Apple Pay, Google Pay), Bank Transfers, Subscriptions
 * Documentation: https://stripe.com/docs/api
 */
export class StripeGateway extends PaymentGateway {
  /**
   * Create a new Stripe gateway instance
   *
   * @param {Object} config - Gateway configuration
   */
  constructor(config) {
    super(config);

    this.validateConfig(["secretKey"]);

    this.client = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion || "2024-12-18.acacia",
    });

    this.webhookSecret = config.webhookSecret;
    this.publicKey = config.publicKey;

    // Override default currency for Stripe (USD is more common)
    this.currency = config.currency || "USD";
  }

  /**
   * Get gateway name
   *
   * @returns {string}
   */
  getName() {
    return "Stripe";
  }

  /**
   * Create a payment intent
   *
   * @param {Object} data - Payment data
   * @param {number} data.amount - Amount in dollars/rupees
   * @param {string} data.currency - Currency code (default: USD)
   * @param {Object} data.metadata - Additional metadata
   * @param {string} data.description - Payment description
   * @param {boolean} data.captureMethod - manual or automatic (default: automatic)
   * @returns {Promise<Object>} Payment intent
   */
  async createPayment(data) {
    try {
      const {
        amount,
        currency = this.currency,
        metadata = {},
        description,
        captureMethod = "automatic",
        paymentMethodTypes = ["card"],
      } = data;

      // Create payment intent
      const paymentIntent = await this.client.paymentIntents.create({
        amount: this.formatAmount(amount, true), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        description,
        capture_method: captureMethod,
        payment_method_types: paymentMethodTypes,
      });

      return this.buildSuccessResponse({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        raw: paymentIntent,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Verify payment status
   *
   * @param {Object} data - Verification data
   * @param {string} data.paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(data) {
    try {
      const { paymentIntentId } = data;

      if (!paymentIntentId) {
        throw new Error("paymentIntentId is required for verification");
      }

      // Retrieve payment intent
      const paymentIntent = await this.client.paymentIntents.retrieve(paymentIntentId);

      return this.buildSuccessResponse({
        verified: paymentIntent.status === "succeeded",
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        raw: paymentIntent,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Capture a payment intent
   *
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} data - Capture data
   * @param {number} data.amountToCapture - Amount to capture (optional)
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(paymentIntentId, data = {}) {
    try {
      const { amountToCapture } = data;

      const captureData = {};
      if (amountToCapture) {
        captureData.amount_to_capture = this.formatAmount(amountToCapture, true);
      }

      // Capture payment intent
      const paymentIntent = await this.client.paymentIntents.capture(
        paymentIntentId,
        captureData
      );

      return this.buildSuccessResponse({
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        amountCaptured: paymentIntent.amount_capturable / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        raw: paymentIntent,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Refund a payment
   *
   * @param {string} paymentIntentId - Payment intent ID or charge ID
   * @param {Object} data - Refund data
   * @param {number} data.amount - Refund amount (optional, full refund if not specified)
   * @param {string} data.reason - Refund reason
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentIntentId, data = {}) {
    try {
      const {
        amount,
        reason,
        metadata = {},
      } = data;

      const refundData = {
        payment_intent: paymentIntentId,
        metadata,
      };

      if (amount) {
        refundData.amount = this.formatAmount(amount, true);
      }

      if (reason) {
        refundData.reason = reason;
      }

      // Create refund
      const refund = await this.client.refunds.create(refundData);

      return this.buildSuccessResponse({
        refundId: refund.id,
        paymentIntentId: refund.payment_intent,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        raw: refund,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Get payment details
   *
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.client.paymentIntents.retrieve(paymentIntentId);

      return this.buildSuccessResponse({
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethod: paymentIntent.payment_method,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata,
        createdAt: new Date(paymentIntent.created * 1000),
        raw: paymentIntent,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Create a checkout session
   *
   * @param {Object} data - Checkout session data
   * @param {Array} data.lineItems - Line items for checkout
   * @param {string} data.successUrl - Success redirect URL
   * @param {string} data.cancelUrl - Cancel redirect URL
   * @param {string} data.mode - payment, subscription, or setup
   * @returns {Promise<Object>} Checkout session
   */
  async createCheckoutSession(data) {
    try {
      const {
        lineItems,
        successUrl,
        cancelUrl,
        mode = "payment",
        metadata = {},
      } = data;

      const session = await this.client.checkout.sessions.create({
        line_items: lineItems,
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });

      return this.buildSuccessResponse({
        sessionId: session.id,
        url: session.url,
        status: session.status,
        raw: session,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Create a subscription
   *
   * @param {Object} data - Subscription data
   * @param {string} data.customerId - Stripe customer ID
   * @param {Array} data.items - Subscription items with price IDs
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} Subscription
   */
  async createSubscription(data) {
    try {
      const {
        customerId,
        items,
        metadata = {},
        trialPeriodDays,
      } = data;

      const subscriptionData = {
        customer: customerId,
        items,
        metadata,
      };

      if (trialPeriodDays) {
        subscriptionData.trial_period_days = trialPeriodDays;
      }

      const subscription = await this.client.subscriptions.create(subscriptionData);

      return this.buildSuccessResponse({
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        raw: subscription,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Handle webhook callback
   *
   * @param {Object|string} payload - Webhook payload (raw body)
   * @param {Object} headers - Request headers
   * @returns {Promise<Object>} Webhook result
   */
  async handleWebhook(payload, headers = {}) {
    try {
      // Get signature from headers
      const signature = headers["stripe-signature"] || headers["Stripe-Signature"];

      if (!signature || !this.webhookSecret) {
        throw new Error("Webhook signature or secret missing");
      }

      // Verify and construct event
      const event = this.client.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      // Extract event data
      const result = {
        verified: true,
        event: event.type,
        id: event.id,
      };

      // Parse based on event type
      if (event.type.startsWith("payment_intent.")) {
        const paymentIntent = event.data.object;
        result.paymentIntentId = paymentIntent.id;
        result.amount = paymentIntent.amount / 100;
        result.status = paymentIntent.status;
      }

      if (event.type.startsWith("checkout.session.")) {
        const session = event.data.object;
        result.sessionId = session.id;
        result.status = session.status;
      }

      if (event.type.startsWith("customer.subscription.")) {
        const subscription = event.data.object;
        result.subscriptionId = subscription.id;
        result.status = subscription.status;
      }

      result.raw = event;

      return this.buildSuccessResponse(result);
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Validate webhook signature
   *
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Stripe-Signature header
   * @returns {boolean} Is valid
   */
  validateWebhookSignature(payload, signature) {
    if (!signature || !this.webhookSecret) {
      return false;
    }

    try {
      this.client.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a customer
   *
   * @param {Object} data - Customer data
   * @param {string} data.email - Customer email
   * @param {string} data.name - Customer name
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} Customer
   */
  async createCustomer(data) {
    try {
      const { email, name, metadata = {} } = data;

      const customer = await this.client.customers.create({
        email,
        name,
        metadata,
      });

      return this.buildSuccessResponse({
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        raw: customer,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }
}
