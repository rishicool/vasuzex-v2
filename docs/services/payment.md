# Payment Service

Multi-gateway payment integration with PhonePe, Razorpay, and Stripe.

## Features

- 💳 **PhonePe** - UPI, cards, wallets (India)
- 💰 **Razorpay** - Complete payment solution (India)
- 🌍 **Stripe** - International payments
- 🔐 **Webhook Validation** - Secure webhook handling
- 🔄 **Unified API** - Same interface for all gateways
- 📊 **Refunds** - Easy refund processing

## Quick Start

```javascript
import { PaymentManager } from '@vasuzex/framework';

// In your app setup (providers/services)
const config = app.make('config').get('payment');
const payment = new PaymentManager(app);

// Create payment
const razorpay = payment.gateway('razorpay');
const order = await razorpay.createPayment({
  amount: 1000, // in paise/cents
  currency: 'INR',
  receipt: 'order_123'
});

// Verify payment
const verified = await razorpay.verifyPayment({
  orderId: payment.id,
  paymentId: req.body.razorpay_payment_id,
  signature: req.body.razorpay_signature
});

// Refund
const refund = await razorpay.refundPayment({
  paymentId: payment.id,
  amount: 500 // partial refund
});
```

## Configuration

**File:** `config/payment.cjs`

```javascript
module.exports = {
  // Default gateway
  default: env('PAYMENT_GATEWAY', 'razorpay'),

  // Gateway configurations
  gateways: {
    phonepe: {
      merchantId: env('PHONEPE_MERCHANT_ID'),
      saltKey: env('PHONEPE_SALT_KEY'),
      saltIndex: env('PHONEPE_SALT_INDEX', 1),
      environment: env('PHONEPE_ENV', 'sandbox'),
      callbackUrl: env('PHONEPE_CALLBACK_URL')
    },

    razorpay: {
      keyId: env('RAZORPAY_KEY_ID'),
      keySecret: env('RAZORPAY_KEY_SECRET'),
      webhookSecret: env('RAZORPAY_WEBHOOK_SECRET')
    },

    stripe: {
      secretKey: env('STRIPE_SECRET_KEY'),
      publishableKey: env('STRIPE_PUBLISHABLE_KEY'),
      webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
      currency: env('STRIPE_CURRENCY', 'USD')
    }
  },

  // Webhook settings
  webhooks: {
    verifySignature: true,
    timeout: 30000,
    endpoints: {
      phonepe: '/webhooks/phonepe',
      razorpay: '/webhooks/razorpay',
      stripe: '/webhooks/stripe'
    }
  },

  // Default options
  options: {
    defaultCurrency: 'INR',
    testMode: env('NODE_ENV') !== 'production',
    timeout: 30000,
    autoCapture: true,
    logging: true
  }
};
```

## Gateways

### PhonePe Gateway

UPI, cards, wallets, and net banking.

```javascript
// Get payment manager instance (injected or created)
const paymentManager = app.make('payment'); // or new PaymentManager(app)

const phonepe = paymentManager.gateway('phonepe');

// Create payment
const payment = await phonepe.createPayment({
  amount: 10000, // in paise (100.00 INR)
  merchantUserId: 'USER_123',
  merchantTransactionId: 'TXN_' + Date.now(),
  redirectUrl: 'https://yoursite.com/callback',
  callbackUrl: 'https://yoursite.com/webhook'
});

// Redirect user
res.redirect(payment.data.redirectUrl);

// Verify payment (in callback)
const verified = await phonepe.verifyPayment({
  merchantTransactionId: req.query.transactionId
});

// Refund
const refund = await phonepe.refundPayment({
  merchantTransactionId: 'TXN_123',
  amount: 10000,
  originalTransactionId: 'ORIG_TXN_123'
});
```

**Features:**
- SHA256 checksum validation
- Base64 payload encoding
- Sandbox/Production environments
- Multiple payment methods

### Razorpay Gateway

Complete payment solution with advanced features.

```javascript
const razorpay = paymentManager.gateway('razorpay');

// Create order
const order = await razorpay.createPayment({
  amount: 10000, // in paise
  currency: 'INR',
  receipt: 'order_123',
  notes: {
    userId: 1,
    orderId: 123
  }
});

// Frontend payment (use order.id)
// After payment, verify signature
const verified = await razorpay.verifyPayment({
  orderId: order.id,
  paymentId: req.body.razorpay_payment_id,
  signature: req.body.razorpay_signature
});

// Capture payment (if auto-capture disabled)
const captured = await razorpay.capturePayment({
  paymentId: 'pay_123',
  amount: 10000
});

// Refund
const refund = await razorpay.refundPayment({
  paymentId: 'pay_123',
  amount: 5000 // partial
});

// Create payment link
const link = await razorpay.createPaymentLink({
  amount: 10000,
  currency: 'INR',
  description: 'Product purchase',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    contact: '+919876543210'
  }
});
```

**Features:**
- HMAC SHA256 signature verification
- Payment links
- Subscriptions
- Customer management
- Webhook validation

### Stripe Gateway

International payment processing.

```javascript
const stripe = paymentManager.gateway('stripe');

// Create payment intent
const intent = await stripe.createPayment({
  amount: 1000, // in cents
  currency: 'USD',
  paymentMethod: 'pm_card_visa'
});

// Create checkout session
const session = await stripe.createCheckoutSession({
  lineItems: [
    {
      price: 'price_123',
      quantity: 1
    }
  ],
  mode: 'payment',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel'
});

// Redirect to checkout
res.redirect(session.url);

// Create subscription
const subscription = await stripe.createSubscription({
  customer: 'cus_123',
  items: [
    { price: 'price_monthly' }
  ]
});

// Refund
const refund = await stripe.refundPayment({
  paymentIntentId: 'pi_123',
  amount: 500 // partial
});
```

**Features:**
- Payment intents
- Checkout sessions
- Subscriptions
- Customer management
- SCA compliance

## Real-World Examples

### 1. E-Commerce Checkout

```javascript
router.post('/checkout', async (req, res) => {
  const { cartId, gateway } = req.body;
  
  // Get cart total
  const cart = await Cart.find(cartId);
  const amount = cart.total * 100; // Convert to paise
  
  // Create payment
  const payment = await Payment.gateway(gateway).createPayment({
    amount,
    currency: 'INR',
    receipt: `cart_${cartId}`,
    notes: {
      cartId: cart.id,
      userId: req.user.id
    }
  });
  
  res.json({
    orderId: payment.id,
    amount: payment.amount,
    currency: payment.currency
  });
});
```

### 2. Payment Verification

```javascript
router.post('/payment/verify', async (req, res) => {
  const { orderId, paymentId, signature, gateway } = req.body;
  
  try {
    const verified = await Payment.gateway(gateway).verifyPayment({
      orderId,
      paymentId,
      signature
    });
    
    if (verified.success) {
      // Update order status
      await Order.where('id', orderId).update({
        status: 'paid',
        paymentId,
        paidAt: new Date()
      });
      
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Verification failed' });
    }
  } catch (error) {
    Log.error('Payment verification failed', { error, orderId });
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Webhook Handling

```javascript
router.post('/webhooks/razorpay', async (req, res) => {
  try {
    const webhook = await Payment.gateway('razorpay').handleWebhook({
      body: req.body,
      signature: req.headers['x-razorpay-signature']
    });
    
    if (webhook.event === 'payment.captured') {
      const payment = webhook.payload.payment.entity;
      
      // Update order
      await Order.where('payment_id', payment.id).update({
        status: 'paid',
        capturedAt: new Date()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    Log.error('Webhook error', { error });
    res.status(400).json({ error: error.message });
  }
});
```

### 4. Refund Processing

```javascript
router.post('/refunds', async (req, res) => {
  const { orderId, amount, reason } = req.body;
  
  const order = await Order.find(orderId);
  
  try {
    const refund = await Payment.gateway(order.gateway).refundPayment({
      paymentId: order.paymentId,
      amount: amount * 100, // Convert to paise
      notes: { reason }
    });
    
    // Update order
    await order.update({
      status: 'refunded',
      refundId: refund.id,
      refundedAt: new Date()
    });
    
    res.json({ success: true, refund });
  } catch (error) {
    Log.error('Refund failed', { error, orderId });
    res.status(500).json({ error: error.message });
  }
});
```

### 5. Subscription Management

```javascript
// Create subscription (Stripe)
async function createSubscription(userId, planId) {
  const user = await User.find(userId);
  
  // Create customer if not exists
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.createCustomer({
      email: user.email,
      name: user.name
    });
    customerId = customer.id;
    await user.update({ stripeCustomerId: customerId });
  }
  
  // Create subscription
  const subscription = await stripe.createSubscription({
    customer: customerId,
    items: [{ price: planId }]
  });
  
  // Save subscription
  await Subscription.create({
    userId: user.id,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });
  
  return subscription;
}
```

## Testing

```bash
# Run payment tests
pnpm test tests/unit/Payment/
```

**Coverage:** 30/30 tests passing ✅

## Security Best Practices

1. **Always verify signatures**
   ```javascript
   const verified = await Payment.verifyPayment({...});
   if (!verified.success) throw new Error('Invalid signature');
   ```

2. **Use webhooks for status updates**
   ```javascript
   // Don't rely on client-side callbacks alone
   router.post('/webhooks/payment', handleWebhook);
   ```

3. **Store credentials securely**
   ```javascript
   // Use environment variables
   RAZORPAY_KEY_SECRET=your_secret_here
   ```

4. **Log all transactions**
   ```javascript
   Log.info('Payment processed', { orderId, amount, gateway });
   ```

5. **Handle errors gracefully**
   ```javascript
   try {
     await Payment.createPayment(data);
   } catch (error) {
     Log.error('Payment failed', { error, data });
     // Show user-friendly message
   }
   ```

## API Reference

### Payment Facade

```javascript
Payment.gateway(name = null) // Get gateway instance
```

### Gateway Methods

```javascript
// All gateways support these methods
await gateway.createPayment(data)
await gateway.verifyPayment(data)
await gateway.capturePayment(data) // Not all gateways
await gateway.refundPayment(data)
await gateway.handleWebhook(data)
```

## Environment Variables

```env
# PhonePe
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=sandbox

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## See Also

- [Orders](/docs/features/orders.md)
- [Webhooks](/docs/features/webhooks.md)
- [Security](/docs/services/security.md)
