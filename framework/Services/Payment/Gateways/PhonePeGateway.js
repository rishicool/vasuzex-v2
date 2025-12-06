import crypto from "crypto";
import axios from "axios";
import { PaymentGateway } from "../PaymentGateway.js";

/**
 * PhonePeGateway - PhonePe payment gateway integration
 *
 * Supports UPI, Cards, Wallets, NetBanking
 * Documentation: https://developer.phonepe.com/v1/docs/payment-gateway
 */
export class PhonePeGateway extends PaymentGateway {
  /**
   * Create a new PhonePe gateway instance
   *
   * @param {Object} config - Gateway configuration
   */
  constructor(config) {
    super(config);

    this.validateConfig(["merchantId", "saltKey", "saltIndex"]);

    this.merchantId = config.merchantId;
    this.saltKey = config.saltKey;
    this.saltIndex = config.saltIndex;
    this.apiVersion = config.apiVersion || "v3";

    // API endpoints
    this.baseUrl = this.getBaseUrl(
      "https://api.phonepe.com/apis/hermes",
      "https://api-preprod.phonepe.com/apis/pg-sandbox"
    );
  }

  /**
   * Get gateway name
   *
   * @returns {string}
   */
  getName() {
    return "PhonePe";
  }

  /**
   * Create a payment order
   *
   * @param {Object} data - Payment data
   * @param {number} data.amount - Amount in rupees
   * @param {string} data.merchantTransactionId - Unique transaction ID
   * @param {string} data.merchantUserId - User ID
   * @param {string} data.redirectUrl - Redirect URL after payment
   * @param {string} data.callbackUrl - Webhook callback URL
   * @param {string} data.mobileNumber - Customer mobile number
   * @param {Object} data.paymentInstrument - Payment instrument details
   * @returns {Promise<Object>} Payment response with redirectUrl
   */
  async createPayment(data) {
    try {
      const {
        amount,
        merchantTransactionId = this.generateOrderId("TXN"),
        merchantUserId,
        redirectUrl,
        callbackUrl,
        mobileNumber,
        paymentInstrument = { type: "PAY_PAGE" },
      } = data;

      // Build payload
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId,
        merchantUserId: merchantUserId || `USER_${Date.now()}`,
        amount: this.formatAmount(amount, true), // Convert to paise
        redirectUrl,
        redirectMode: "POST",
        callbackUrl,
        mobileNumber,
        paymentInstrument,
      };

      // Encode payload
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

      // Generate checksum
      const checksum = this.generateChecksum(base64Payload);

      // Make API request
      const response = await axios.post(
        `${this.baseUrl}/pg/${this.apiVersion}/pay`,
        {
          request: base64Payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
          },
        }
      );

      if (response.data.success) {
        return this.buildSuccessResponse({
          transactionId: merchantTransactionId,
          redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          raw: response.data,
        });
      }

      throw new Error(response.data.message || "Payment creation failed");
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Verify payment status
   *
   * @param {Object} data - Verification data
   * @param {string} data.merchantTransactionId - Transaction ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(data) {
    try {
      const { merchantTransactionId } = data;

      if (!merchantTransactionId) {
        throw new Error("merchantTransactionId is required for verification");
      }

      // Generate checksum for status check
      const endpoint = `/pg/${this.apiVersion}/status/${this.merchantId}/${merchantTransactionId}`;
      const checksum = this.generateChecksum(endpoint + this.saltKey);

      // Check payment status
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": this.merchantId,
        },
      });

      const { success, code, data: paymentData } = response.data;

      return this.buildSuccessResponse({
        verified: success && code === "PAYMENT_SUCCESS",
        status: paymentData.state,
        transactionId: paymentData.merchantTransactionId,
        amount: paymentData.amount / 100, // Convert from paise
        paymentMethod: paymentData.paymentInstrument?.type,
        raw: response.data,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Capture payment (PhonePe auto-captures)
   *
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Capture data
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(paymentId, data = {}) {
    // PhonePe auto-captures payments, so we just verify status
    return this.verifyPayment({ merchantTransactionId: paymentId });
  }

  /**
   * Refund a payment
   *
   * @param {string} paymentId - Original transaction ID
   * @param {Object} data - Refund data
   * @param {number} data.amount - Refund amount (optional, full refund if not specified)
   * @param {string} data.merchantRefundId - Unique refund ID
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentId, data = {}) {
    try {
      const {
        amount,
        merchantRefundId = this.generateOrderId("REFUND"),
      } = data;

      // Build refund payload
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: paymentId,
        merchantRefundId,
        amount: amount ? this.formatAmount(amount, true) : undefined,
      };

      // Encode payload
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

      // Generate checksum
      const checksum = this.generateChecksum(base64Payload);

      // Make refund request
      const response = await axios.post(
        `${this.baseUrl}/pg/${this.apiVersion}/refund`,
        {
          request: base64Payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
          },
        }
      );

      if (response.data.success) {
        return this.buildSuccessResponse({
          refundId: merchantRefundId,
          transactionId: paymentId,
          status: response.data.data.state,
          raw: response.data,
        });
      }

      throw new Error(response.data.message || "Refund failed");
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Get payment details
   *
   * @param {string} paymentId - Transaction ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    return this.verifyPayment({ merchantTransactionId: paymentId });
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
      const { response } = payload;

      // Decode base64 payload
      const decodedPayload = Buffer.from(response, "base64").toString("utf-8");
      const parsedPayload = JSON.parse(decodedPayload);

      // Verify signature
      const signature = headers["x-verify"] || headers["X-VERIFY"];
      const isValid = this.validateWebhookSignature(response, signature);

      if (!isValid) {
        throw new Error("Invalid webhook signature");
      }

      return this.buildSuccessResponse({
        verified: true,
        transactionId: parsedPayload.data.merchantTransactionId,
        status: parsedPayload.data.state,
        amount: parsedPayload.data.amount / 100,
        paymentMethod: parsedPayload.data.paymentInstrument?.type,
        raw: parsedPayload,
      });
    } catch (error) {
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Validate webhook signature
   *
   * @param {string} payload - Base64 encoded payload
   * @param {string} signature - X-VERIFY header value
   * @returns {boolean} Is valid
   */
  validateWebhookSignature(payload, signature) {
    if (!signature) {
      return false;
    }

    const expectedChecksum = this.generateChecksum(payload);
    return expectedChecksum === signature;
  }

  /**
   * Generate checksum/signature
   *
   * @private
   * @param {string} data - Data to hash
   * @returns {string} SHA256 checksum
   */
  generateChecksum(data) {
    const string = `${data}${this.saltKey}`;
    const hash = crypto.createHash("sha256").update(string).digest("hex");
    return `${hash}###${this.saltIndex}`;
  }
}
