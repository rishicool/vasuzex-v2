# Security Service

Security middleware with Helmet, CORS, CSRF, and rate limiting.

## Features

- 🛡️ **Helmet** - Security headers (XSS, clickjacking, etc.)
- 🌐 **CORS** - Cross-origin resource sharing
- 🔐 **CSRF** - Cross-site request forgery protection
- ⏱️ **Rate Limiting** - API throttling
- 🔒 **Content Security Policy** - XSS prevention
- 🚫 **IP Blocking** - Blacklist/whitelist

## Quick Start

```javascript
import { SecurityMiddleware } from '@vasuzex/framework';

const config = app.make('config').get('security');
const security = new SecurityMiddleware(config);

// Apply all security middleware
app.use(security.helmet());
app.use(security.cors());
const csrfMiddleware = security.csrf();
if (csrfMiddleware) {
  app.use(csrfMiddleware.doubleCsrfProtection);
}

// Or configure individually
app.use(security.helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));
```

## Configuration

**File:** `config/security.cjs`

```javascript
module.exports = {
  // Helmet (security headers)
  helmet: {
    enabled: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.example.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'cdn.example.com'],
        connectSrc: ["'self'", 'api.example.com'],
        fontSrc: ["'self'", 'fonts.googleapis.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: 'deny'
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: {
      policy: 'same-origin'
    }
  },

  // CORS
  cors: {
    enabled: true,
    origin: env('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 200
  },

  // CSRF
  csrf: {
    enabled: true,
    cookie: {
      name: 'XSRF-TOKEN',
      httpOnly: false,
      secure: env('NODE_ENV') === 'production',
      sameSite: 'strict'
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    headerName: 'X-CSRF-TOKEN'
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per windowMs
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: res.getHeader('Retry-After')
      });
    }
  },

  // IP Filtering
  ipFilter: {
    enabled: false,
    mode: 'whitelist', // whitelist or blacklist
    whitelist: [],
    blacklist: [],
    trustProxy: true
  },

  // Additional security
  options: {
    trustProxy: true,
    poweredByHeader: false,
    etagEnabled: true,
    hideServerHeader: true
  }
};
```

## Middleware

### Helmet (Security Headers)

Protects against common web vulnerabilities.

```javascript
import { SecurityMiddleware } from '@vasuzex/framework';

const security = new SecurityMiddleware(config);

// Basic usage
app.use(security.helmet());

// Custom configuration
app.use(security.helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'fonts.googleapis.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

**Headers Set:**
- `Content-Security-Policy` - XSS protection
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options` - Clickjacking protection
- `X-Content-Type-Options` - MIME sniffing protection
- `X-XSS-Protection` - XSS filter
- `Referrer-Policy` - Referrer control

### CORS (Cross-Origin Resource Sharing)

Allow cross-origin requests.

```javascript
// Allow all origins
app.use(security.cors());

// Specific origin
const securityWithOrigin = new SecurityMiddleware({
  cors: { origin: 'https://example.com' }
});
app.use(securityWithOrigin.cors());

// Multiple origins
const securityMultiOrigin = new SecurityMiddleware({
  cors: { origin: ['https://example.com', 'https://app.example.com'] }
});
app.use(securityMultiOrigin.cors());

// Dynamic origin
app.use(Security.cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### CSRF (Cross-Site Request Forgery)

Protect against CSRF attacks.

```javascript
// Enable CSRF
app.use(Security.csrf());

// Get CSRF token
router.get('/csrf-token', (req, res) => {
  res.json({ token: req.csrfToken() });
});

// Frontend usage
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken
  },
  body: JSON.stringify(data)
});
```

### Rate Limiting

Prevent abuse and DDoS.

```javascript
// Global rate limit
app.use(Security.rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
}));

// Endpoint-specific
router.post('/api/login', 
  Security.rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }),
  loginHandler
);

// Custom key generator (per user)
app.use(Security.rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip
}));
```

## Real-World Examples

### 1. API Security Setup

```javascript
import express from 'express';
import { Security } from '@vasuzex/framework';

const app = express();

// Security headers
app.use(Security.helmet({
  contentSecurityPolicy: false // Disable for API
}));

// CORS for frontend
app.use(Security.cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
app.use('/api/', Security.rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Stricter for auth endpoints
app.use('/api/auth/', Security.rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
}));
```

### 2. CSRF Protection

```javascript
// Server setup
app.use(Security.csrf({
  cookie: {
    name: 'XSRF-TOKEN',
    httpOnly: false, // Allow JS to read
    secure: true,
    sameSite: 'strict'
  }
}));

// Provide token endpoint
router.get('/csrf-token', (req, res) => {
  res.json({ token: req.csrfToken() });
});

// Protected routes
router.post('/api/users', async (req, res) => {
  // CSRF automatically validated
  const user = await User.create(req.body);
  res.json(user);
});

// Frontend (React)
useEffect(() => {
  fetch('/csrf-token')
    .then(res => res.json())
    .then(data => setCSRFToken(data.token));
}, []);

const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken
    },
    body: JSON.stringify(userData)
  });
};
```

### 3. Content Security Policy

```javascript
// Strict CSP for production
app.use(Security.helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'cdn.jsdelivr.net',
        'https://www.googletagmanager.com'
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some libraries
        'fonts.googleapis.com'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'cdn.example.com'
      ],
      connectSrc: [
        "'self'",
        'https://api.example.com',
        'wss://ws.example.com'
      ],
      fontSrc: [
        "'self'",
        'fonts.gstatic.com'
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: []
    },
    reportOnly: false
  }
}));
```

### 4. IP Filtering

```javascript
// Whitelist specific IPs
app.use(Security.ipFilter({
  mode: 'whitelist',
  whitelist: [
    '192.168.1.1',
    '10.0.0.0/8'
  ],
  trustProxy: true
}));

// Blacklist malicious IPs
app.use(Security.ipFilter({
  mode: 'blacklist',
  blacklist: await getMaliciousIPs()
}));

// Dynamic IP blocking
async function blockIP(ip, duration = 3600) {
  await Cache.put(`blocked:${ip}`, true, duration);
}

app.use(async (req, res, next) => {
  const blocked = await Cache.get(`blocked:${req.ip}`);
  if (blocked) {
    return res.status(403).json({ error: 'Access forbidden' });
  }
  next();
});
```

### 5. Rate Limiting by Tier

```javascript
// Different limits for different user tiers
function getRateLimitByTier(tier) {
  const limits = {
    free: { windowMs: 15 * 60 * 1000, max: 50 },
    basic: { windowMs: 15 * 60 * 1000, max: 100 },
    premium: { windowMs: 15 * 60 * 1000, max: 500 },
    enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
  };
  return limits[tier] || limits.free;
}

app.use(async (req, res, next) => {
  const user = req.user;
  const tier = user?.tier || 'free';
  const limits = getRateLimitByTier(tier);
  
  Security.rateLimit({
    ...limits,
    keyGenerator: () => user?.id || req.ip
  })(req, res, next);
});
```

### 6. Security Audit Logging

```javascript
// Log security events
app.use((req, res, next) => {
  // Log authentication attempts
  if (req.path.includes('/auth/')) {
    Log.info('Auth attempt', {
      ip: req.ip,
      path: req.path,
      userAgent: req.headers['user-agent']
    });
  }
  
  // Log rate limit violations
  res.on('finish', () => {
    if (res.statusCode === 429) {
      Log.warning('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method
      });
    }
  });
  
  next();
});
```

### 7. Brute Force Protection

```javascript
async function checkBruteForce(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const key = `bruteforce:${identifier}`;
  const attempts = await Cache.get(key) || 0;
  
  if (attempts >= maxAttempts) {
    throw new Error('Too many failed attempts. Please try again later.');
  }
  
  return attempts;
}

async function recordFailedAttempt(identifier) {
  const key = `bruteforce:${identifier}`;
  const attempts = await Cache.get(key) || 0;
  await Cache.put(key, attempts + 1, 15 * 60); // 15 minutes
}

async function resetAttempts(identifier) {
  await Cache.forget(`bruteforce:${identifier}`);
}

// Usage in login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    await checkBruteForce(email);
    
    const user = await User.where('email', email).first();
    if (!user || !await user.verifyPassword(password)) {
      await recordFailedAttempt(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await resetAttempts(email);
    
    // Login successful
    res.json({ token: generateToken(user) });
  } catch (error) {
    res.status(429).json({ error: error.message });
  }
});
```

## Testing

```bash
# Run security tests
pnpm test tests/unit/Security/
```

**Coverage:** 25/25 tests passing ✅

## Best Practices

1. **Always use HTTPS in production**
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (!req.secure) {
         return res.redirect('https://' + req.headers.host + req.url);
       }
       next();
     });
   }
   ```

2. **Validate all inputs**
   ```javascript
   router.post('/api/users', validate(userSchema), async (req, res) => {
     // Input validated before reaching here
   });
   ```

3. **Use environment variables**
   ```javascript
   const config = {
     secret: process.env.JWT_SECRET,
     corsOrigin: process.env.CORS_ORIGIN
   };
   ```

4. **Keep dependencies updated**
   ```bash
   pnpm audit
   pnpm update
   ```

5. **Monitor security logs**
   ```javascript
   Log.security('Suspicious activity', { ip, pattern });
   ```

## API Reference

### Security Facade

```javascript
// Middleware
Security.helmet(options?)
Security.cors(options?)
Security.csrf(options?)
Security.rateLimit(options?)
Security.ipFilter(options?)

// Utilities
Security.generateCSRFToken()
Security.verifyCSRFToken(token)
Security.checkRateLimit(key, max, windowMs)
```

## Environment Variables

```env
# CORS
CORS_ORIGIN=https://example.com

# Security
NODE_ENV=production
TRUST_PROXY=true

# JWT (if using)
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## Security Checklist

- ✅ HTTPS enabled
- ✅ Helmet headers configured
- ✅ CORS properly set
- ✅ CSRF protection enabled
- ✅ Rate limiting active
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Secure cookies
- ✅ Regular dependency updates
- ✅ Security logging
- ✅ Error handling (no stack traces in prod)

## See Also

- [Authentication](/docs/services/auth.md)
- [Validation](/docs/features/validation.md)
- [Logging](/docs/services/logging.md)
- [Deployment Security](/docs/deployment/security.md)
