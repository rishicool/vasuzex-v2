/**
 * Payment Gateway Configuration
 *
 * Configure payment gateways for your application
 */

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Payment Gateway
  |--------------------------------------------------------------------------
  |
  | This option controls the default payment gateway that will be used
  | by the payment manager. You may change this to any of the gateways
  | defined in the "gateways" array below.
  |
  | Supported: "phonepe", "razorpay", "stripe"
  |
  */

  default: process.env.PAYMENT_DEFAULT_GATEWAY || "razorpay",

  /*
  |--------------------------------------------------------------------------
  | Payment Gateways
  |--------------------------------------------------------------------------
  |
  | Configure each payment gateway with their respective credentials.
  | Make sure to use environment variables for sensitive data.
  |
  */

  gateways: {
    /*
    |--------------------------------------------------------------------------
    | PhonePe Gateway
    |--------------------------------------------------------------------------
    |
    | PhonePe Payment Gateway - Indian payment solution
    | Supports UPI, Cards, Wallets, NetBanking
    |
    | Documentation: https://developer.phonepe.com/v1/docs/payment-gateway
    |
    */

    phonepe: {
      // Merchant ID from PhonePe dashboard
      merchantId: process.env.PHONEPE_MERCHANT_ID || "",

      // Salt key for signature generation
      saltKey: process.env.PHONEPE_SALT_KEY || "",

      // Salt index (usually 1)
      saltIndex: process.env.PHONEPE_SALT_INDEX || 1,

      // Environment: 'sandbox' or 'production'
      environment: process.env.PHONEPE_ENVIRONMENT || "sandbox",

      // API version (default: v3)
      apiVersion: process.env.PHONEPE_API_VERSION || "v3",

      // Default currency
      currency: "INR",
    },

    /*
    |--------------------------------------------------------------------------
    | Razorpay Gateway
    |--------------------------------------------------------------------------
    |
    | Razorpay Payment Gateway - Indian payment solution
    | Supports UPI, Cards, Wallets, NetBanking, EMI
    |
    | Documentation: https://razorpay.com/docs/api/
    |
    */

    razorpay: {
      // Key ID from Razorpay dashboard
      keyId: process.env.RAZORPAY_KEY_ID || "",

      // Key Secret from Razorpay dashboard
      keySecret: process.env.RAZORPAY_KEY_SECRET || "",

      // Webhook secret for signature verification
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",

      // Environment: 'sandbox' or 'production'
      environment: process.env.RAZORPAY_ENVIRONMENT || "sandbox",

      // Default currency
      currency: "INR",
    },

    /*
    |--------------------------------------------------------------------------
    | Stripe Gateway
    |--------------------------------------------------------------------------
    |
    | Stripe Payment Gateway - International payment solution
    | Supports Cards, Wallets, Bank Transfers, Subscriptions
    |
    | Documentation: https://stripe.com/docs/api
    |
    */

    stripe: {
      // Secret key from Stripe dashboard
      secretKey: process.env.STRIPE_SECRET_KEY || "",

      // Publishable key from Stripe dashboard (for client-side)
      publicKey: process.env.STRIPE_PUBLIC_KEY || "",

      // Webhook secret for signature verification
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

      // API version
      apiVersion: "2024-12-18.acacia",

      // Environment: 'sandbox' or 'production'
      environment: process.env.STRIPE_ENVIRONMENT || "sandbox",

      // Default currency
      currency: process.env.STRIPE_CURRENCY || "USD",
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Webhook Configuration
  |--------------------------------------------------------------------------
  |
  | Configure webhook endpoints and security settings
  |
  */

  webhooks: {
    // Enable webhook signature verification
    verifySignature: true,

    // Webhook timeout (milliseconds)
    timeout: 30000,

    // Webhook endpoints (relative to your app URL)
    endpoints: {
      phonepe: "/webhooks/phonepe",
      razorpay: "/webhooks/razorpay",
      stripe: "/webhooks/stripe",
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Payment Options
  |--------------------------------------------------------------------------
  |
  | Global payment options and defaults
  |
  */

  options: {
    // Default currency fallback
    defaultCurrency: "INR",

    // Enable test mode globally
    testMode: process.env.APP_ENV !== "production",

    // Payment timeout (milliseconds)
    timeout: 300000, // 5 minutes

    // Auto-capture payments (if gateway supports it)
    autoCapture: true,

    // Maximum refund attempts
    maxRefundAttempts: 3,

    // Enable payment logging
    logging: {
      enabled: true,
      level: "info",
      channel: "payment",
    },
  },
};
