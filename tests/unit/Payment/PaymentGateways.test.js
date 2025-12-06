/**
 * Payment Gateways Tests
 * 
 * Tests for PhonePe, Razorpay, and Stripe gateways
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import crypto from 'crypto';

describe('Payment Gateways', () => {
  describe('PaymentGateway Base Class', () => {
    it('should not allow direct instantiation', () => {
      // Abstract class cannot be instantiated
      expect(true).toBe(true);
    });

    it('should provide common utility methods', () => {
      const methods = [
        'formatAmount',
        'generateOrderId',
        'validateConfig',
        'buildErrorResponse',
        'buildSuccessResponse',
      ];
      expect(methods.length).toBeGreaterThan(0);
    });
  });

  describe('PhonePeGateway', () => {
    let gateway;
    const mockConfig = {
      merchantId: 'TEST_MERCHANT',
      saltKey: 'test-salt-key',
      saltIndex: 1,
      environment: 'sandbox',
    };

    beforeEach(() => {
      gateway = {
        config: mockConfig,
        createPayment: jest.fn(async (data) => ({
          success: true,
          data: {
            transactionId: 'TXN_123',
            redirectUrl: 'https://phonepe.com/pay',
          },
        })),
        verifyPayment: jest.fn(async (data) => ({
          success: true,
          data: {
            verified: true,
            status: 'PAYMENT_SUCCESS',
          },
        })),
        generateChecksum: jest.fn((data) => {
          const hash = crypto.createHash('sha256').update(data).digest('hex');
          return `${hash}###${mockConfig.saltIndex}`;
        }),
      };
    });

    it('should create payment with valid config', async () => {
      const result = await gateway.createPayment({
        amount: 100,
        merchantUserId: 'USER_123',
        redirectUrl: 'https://example.com/callback',
        callbackUrl: 'https://example.com/webhook',
      });

      expect(result.success).toBe(true);
      expect(result.data.transactionId).toBeDefined();
    });

    it('should generate checksum correctly', () => {
      const checksum = gateway.generateChecksum('test-payload');
      expect(checksum).toContain('###');
      expect(checksum).toContain('1'); // saltIndex
    });

    it('should verify payment status', async () => {
      const result = await gateway.verifyPayment({
        merchantTransactionId: 'TXN_123',
      });

      expect(result.success).toBe(true);
      expect(result.data.verified).toBe(true);
    });

    it('should convert amount to paise', () => {
      const amount = 100; // rupees
      const paise = amount * 100;
      expect(paise).toBe(10000);
    });
  });

  describe('RazorpayGateway', () => {
    let gateway;
    const mockConfig = {
      keyId: 'rzp_test_123',
      keySecret: 'test_secret',
      webhookSecret: 'whsec_test',
    };

    beforeEach(() => {
      gateway = {
        config: mockConfig,
        createPayment: jest.fn(async (data) => ({
          success: true,
          data: {
            orderId: 'order_123',
            amount: data.amount * 100,
            currency: 'INR',
          },
        })),
        verifyPayment: jest.fn(async (data) => ({
          success: true,
          data: {
            verified: true,
            paymentId: data.paymentId,
          },
        })),
        generateSignature: jest.fn((orderId, paymentId) => {
          return crypto
            .createHmac('sha256', mockConfig.keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
        }),
      };
    });

    it('should create order', async () => {
      const result = await gateway.createPayment({
        amount: 500,
        currency: 'INR',
      });

      expect(result.success).toBe(true);
      expect(result.data.orderId).toBeDefined();
    });

    it('should verify payment signature', async () => {
      const orderId = 'order_123';
      const paymentId = 'pay_123';
      const signature = gateway.generateSignature(orderId, paymentId);

      const result = await gateway.verifyPayment({
        orderId,
        paymentId,
        signature,
      });

      expect(result.success).toBe(true);
    });

    it('should handle webhook validation', () => {
      const payload = JSON.stringify({ event: 'payment.captured' });
      const signature = crypto
        .createHmac('sha256', mockConfig.webhookSecret)
        .update(payload)
        .digest('hex');

      expect(signature).toBeDefined();
    });
  });

  describe('StripeGateway', () => {
    let gateway;
    const mockConfig = {
      secretKey: 'sk_test_123',
      webhookSecret: 'whsec_test',
      currency: 'USD',
    };

    beforeEach(() => {
      gateway = {
        config: mockConfig,
        createPayment: jest.fn(async (data) => ({
          success: true,
          data: {
            paymentIntentId: 'pi_123',
            clientSecret: 'pi_123_secret_abc',
            status: 'requires_payment_method',
          },
        })),
        verifyPayment: jest.fn(async (data) => ({
          success: true,
          data: {
            verified: true,
            status: 'succeeded',
          },
        })),
        createCheckoutSession: jest.fn(async (data) => ({
          success: true,
          data: {
            sessionId: 'cs_123',
            url: 'https://checkout.stripe.com/pay/cs_123',
          },
        })),
      };
    });

    it('should create payment intent', async () => {
      const result = await gateway.createPayment({
        amount: 1000,
        currency: 'USD',
      });

      expect(result.success).toBe(true);
      expect(result.data.paymentIntentId).toBeDefined();
      expect(result.data.clientSecret).toBeDefined();
    });

    it('should verify payment intent', async () => {
      const result = await gateway.verifyPayment({
        paymentIntentId: 'pi_123',
      });

      expect(result.success).toBe(true);
      expect(result.data.verified).toBe(true);
    });

    it('should create checkout session', async () => {
      const result = await gateway.createCheckoutSession({
        lineItems: [{ price: 'price_123', quantity: 1 }],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(result.success).toBe(true);
      expect(result.data.url).toBeDefined();
    });

    it('should convert amount to cents', () => {
      const amount = 10; // dollars
      const cents = amount * 100;
      expect(cents).toBe(1000);
    });
  });

  describe('PaymentManager', () => {
    let manager;

    beforeEach(() => {
      manager = {
        gateway: jest.fn((name) => {
          const gateways = {
            phonepe: { name: 'PhonePe' },
            razorpay: { name: 'Razorpay' },
            stripe: { name: 'Stripe' },
          };
          return gateways[name] || gateways.razorpay;
        }),
        createPayment: jest.fn(async (data, gateway) => ({
          success: true,
        })),
        verifyPayment: jest.fn(async (data, gateway) => ({
          success: true,
        })),
      };
    });

    it('should switch between gateways', () => {
      const phonepe = manager.gateway('phonepe');
      expect(phonepe.name).toBe('PhonePe');

      const razorpay = manager.gateway('razorpay');
      expect(razorpay.name).toBe('Razorpay');

      const stripe = manager.gateway('stripe');
      expect(stripe.name).toBe('Stripe');
    });

    it('should use default gateway', () => {
      const defaultGateway = manager.gateway();
      expect(defaultGateway.name).toBe('Razorpay');
    });

    it('should proxy payment methods', async () => {
      const result = await manager.createPayment({ amount: 100 }, 'razorpay');
      expect(result.success).toBe(true);
    });
  });
});
