/**
 * Security Configuration
 * Laravel-inspired security configuration for middleware
 */

const env = (key, fallback = null) => process.env[key] || fallback;

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Helmet.js Security Headers
  |--------------------------------------------------------------------------
  |
  | Helmet helps secure Express apps by setting HTTP response headers.
  | Configure Content Security Policy, XSS protection, and other security
  | headers to protect against common web vulnerabilities.
  |
  */

  helmet: {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },

    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false,

    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Frameguard (X-Frame-Options)
    frameguard: { action: 'deny' },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },

    // IE No Open
    ieNoOpen: true,

    // Don't Sniff Mimetype
    noSniff: true,

    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // Referrer Policy
    referrerPolicy: { policy: 'no-referrer' },

    // XSS Filter
    xssFilter: true
  },

  /*
  |--------------------------------------------------------------------------
  | CORS Configuration
  |--------------------------------------------------------------------------
  |
  | Cross-Origin Resource Sharing (CORS) configuration. Configure which
  | origins can access your API, which methods are allowed, and which
  | headers can be sent.
  |
  */

  cors: {
    // Configures the Access-Control-Allow-Origin header
    origin: env('CORS_ORIGIN', '*'),

    // Configures the Access-Control-Allow-Methods header
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

    // Configures the Access-Control-Allow-Headers header
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token'
    ],

    // Configures the Access-Control-Expose-Headers header
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],

    // Configures the Access-Control-Allow-Credentials header
    credentials: env('CORS_CREDENTIALS', 'true') === 'true',

    // Configures the Access-Control-Max-Age header
    maxAge: 86400, // 24 hours in seconds

    // Pass the CORS preflight response to the next handler
    preflightContinue: false,

    // Provides a status code to use for successful OPTIONS requests
    optionsSuccessStatus: 204
  },

  /*
  |--------------------------------------------------------------------------
  | CSRF Protection Configuration
  |--------------------------------------------------------------------------
  |
  | Cross-Site Request Forgery (CSRF) protection configuration.
  | Enable this for session-based applications. For API token-based
  | authentication, CSRF protection is not required.
  |
  */

  csrf: {
    // Enable or disable CSRF protection
    enabled: env('CSRF_ENABLED', 'false') === 'true',

    // Cookie options for CSRF token
    cookie: {
      // Cookie name for CSRF token
      name: '_csrf',

      // HTTP only cookie
      httpOnly: true,

      // Secure cookie (HTTPS only in production)
      secure: env('NODE_ENV', 'development') === 'production',

      // SameSite attribute
      sameSite: 'strict',

      // Cookie path
      path: '/',

      // Cookie max age (24 hours)
      maxAge: 86400000
    },

    // Ignored methods (don't require CSRF token)
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],

    // Ignored paths (routes that don't require CSRF protection)
    ignorePaths: [
      '/api/webhooks/*',
      '/api/callbacks/*'
    ],

    // Custom token generation function (optional)
    value: null, // Function to generate token, null uses default
  },

  /*
  |--------------------------------------------------------------------------
  | Rate Limiting Configuration
  |--------------------------------------------------------------------------
  |
  | Configure rate limiting to prevent abuse. This works in conjunction
  | with the RateLimiter middleware.
  |
  */

  rateLimit: {
    // Enable rate limiting
    enabled: env('RATE_LIMIT_ENABLED', 'true') === 'true',

    // Default rate limit (requests per window)
    max: parseInt(env('RATE_LIMIT_MAX', '100')),

    // Time window in milliseconds (default: 15 minutes)
    windowMs: parseInt(env('RATE_LIMIT_WINDOW_MS', '900000')),

    // Message when rate limit is exceeded
    message: 'Too many requests from this IP, please try again later.',

    // Status code to return when rate limited
    statusCode: 429,

    // Skip successful requests
    skipSuccessfulRequests: false,

    // Skip failed requests
    skipFailedRequests: false
  },

  /*
  |--------------------------------------------------------------------------
  | Trusted Proxies
  |--------------------------------------------------------------------------
  |
  | Configure trusted proxy IPs. This is important when running behind
  | a load balancer or reverse proxy to correctly identify client IPs.
  |
  */

  trustedProxies: env('TRUSTED_PROXIES', '').split(',').filter(Boolean),

  /*
  |--------------------------------------------------------------------------
  | Security Headers
  |--------------------------------------------------------------------------
  |
  | Additional custom security headers to add to all responses.
  |
  */

  customHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
};
