# 🚨 STRICT LOGGING POLICY - MANDATORY

## ❌ FORBIDDEN - NEVER USE THESE

```javascript
// ❌ STRICTLY FORBIDDEN - DO NOT USE!
console.log()
console.warn()
console.error()
console.info()
console.debug()
```

**VIOLATION OF THIS RULE WILL BE REJECTED IMMEDIATELY!**

---

## ✅ CORRECT LOGGING METHODS

### Backend (API) - Use Vasuzex Log Facade

```javascript
import { Log } from 'vasuzex';

// Info logging
Log.info('User logged in', { userId: user.id });

// Warning logging
Log.warning('Rate limit approaching', { ip: req.ip, count: 95 });

// Error logging
Log.error('Database connection failed', { error: err.message });

// Debug logging (development only)
Log.debug('Processing order', { orderId: 123, items: 5 });

// Critical errors
Log.critical('Payment gateway down', { gateway: 'razorpay' });

// Alerts (requires immediate action)
Log.alert('Disk space critical', { available: '5%' });
```

### Frontend (Web) - Use Custom Logger Utility

```javascript
import { logger } from '@/utils/logger';

// Info logging (development only)
logger.info('Config loaded', { apiUrl, mediaUrl });

// Warning logging
logger.warning('API rate limit warning', { remaining: 10 });

// Error logging (always logged)
logger.error('Failed to fetch data', error);

// Debug logging (development only)
logger.debug('Component mounted', { props });
```

---

## 📁 Logger Implementation

### Backend: Vasuzex Log Facade

**Location:** `vasuzex-v2/framework/Support/Facades/Log.js`

**Methods:**
- `Log.emergency()` - System unusable
- `Log.alert()` - Immediate action required
- `Log.critical()` - Critical conditions
- `Log.error()` - Runtime errors
- `Log.warning()` - Exceptional but not errors
- `Log.notice()` - Normal but significant
- `Log.info()` - Interesting events
- `Log.debug()` - Debug information

**Configuration:** `config/logging.cjs`

### Frontend: Custom Logger Utility

**Location:** `apps/customer/web/src/utils/logger.js`

**Features:**
- Automatic timestamp
- Context serialization
- Development-only info/debug logs
- Always-on error logs
- Prefix: `[neasto]`

**Methods:**
- `logger.info(message, context)` - Development only
- `logger.warning(message, context)` - Development/Test
- `logger.error(message, error)` - Always logged
- `logger.debug(message, data)` - Development only

---

## 🔍 Examples

### ✅ CORRECT

```javascript
// Backend
import { Log } from 'vasuzex';

async function sendOTP(phone) {
  Log.info(`OTP sent to ${phone}`);
}

async function processPayment(orderId) {
  try {
    // ... payment logic
    Log.info('Payment processed', { orderId, amount });
  } catch (error) {
    Log.error('Payment failed', { orderId, error: error.message });
    throw error;
  }
}

// Frontend
import { logger } from '@/utils/logger';

function LoginForm() {
  const handleLogin = async () => {
    try {
      logger.debug('Login attempt', { phone });
      const result = await authService.login(phone);
      logger.info('Login successful');
    } catch (error) {
      logger.error('Login failed', error);
    }
  };
}
```

### ❌ WRONG

```javascript
// ❌ NEVER DO THIS!
console.log('User logged in');
console.error('Failed to process');
console.warn('Rate limit warning');

// ❌ NEVER DO THIS IN PRODUCTION CODE!
if (isDevelopment) {
  console.log('Debug info'); // Still wrong! Use logger
}
```

---

## 📋 Migration Checklist

When adding new code:

- [ ] Import `Log` from `vasuzex` (backend)
- [ ] Import `logger` from `@/utils/logger` (frontend)
- [ ] NO direct console.* calls anywhere
- [ ] Use appropriate log level (info/warning/error/debug)
- [ ] Include context objects for debugging
- [ ] Test logging in development mode

---

## 🔧 Current Status

### Backend Files Using Log Facade ✅

- `apps/customer/api/src/services/AuthService.js`
- `apps/customer/api/src/services/OrderModificationService.js`

### Frontend Files Using Logger ✅

- `apps/customer/web/src/hooks/useAuth.js`
- `apps/customer/web/src/components/auth/LoginForm.jsx`
- `apps/customer/web/src/App.jsx`
- `apps/customer/web/src/lib/AppConfigProvider.jsx`

### Cleaned Files (No Logging) ✅

- `apps/customer/web/src/main.jsx`
- `apps/customer/web/src/lib/api-client.js`

---

## ⚠️ REMEMBER

**NEVER write `console.log`, `console.warn`, or `console.error` in any file!**

**ALWAYS use:**
- Backend: `Log.info()`, `Log.error()`, `Log.warning()`, `Log.debug()`
- Frontend: `logger.info()`, `logger.error()`, `logger.warning()`, `logger.debug()`

**This is not a suggestion - it's a strict requirement!**

---

Last Updated: 2025-12-10
