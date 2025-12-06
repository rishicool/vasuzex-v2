# Logging Service

Multi-channel logging system with colored console output, file rotation, and syslog support.

## Features

- 🎨 **Colored Console** - Beautiful colored output with chalk
- 📁 **File Logging** - Async file writes with rotation
- 🔄 **Log Rotation** - Daily, weekly, size-based, level-based
- 🗑️ **Auto Cleanup** - 14-day retention policy
- 📡 **Syslog** - RFC 5424 compliant syslog
- 📊 **Multi-Channel** - Stack multiple channels together

## Quick Start

```javascript
import { Log } from '@vasuzex/framework';

// Simple logging
Log.info('User logged in', { userId: 1 });
Log.error('Payment failed', { orderId: 123, error: 'Card declined' });
Log.debug('Debug info', { data: someData });

// All log levels
Log.emergency('System is down!');
Log.alert('Action required');
Log.critical('Critical error');
Log.error('Error occurred');
Log.warning('Warning message');
Log.notice('Notice');
Log.info('Informational');
Log.debug('Debug message');
```

## Configuration

**File:** `config/logging.cjs`

```javascript
module.exports = {
  // Default channel
  default: env('LOG_CHANNEL', 'stack'),

  // Available channels
  channels: {
    // Stack multiple channels
    stack: {
      driver: 'stack',
      channels: ['console', 'file'],
      ignore_exceptions: false
    },

    // Console with colors
    console: {
      driver: 'console',
      level: 'debug',
      colors: true
    },

    // File with rotation
    file: {
      driver: 'file',
      path: 'storage/logs',
      level: 'info',
      rotation: 'daily', // daily, weekly, size, level
      maxFiles: 14, // Keep 14 days
      maxSize: '10m' // For size-based rotation
    },

    // Syslog
    syslog: {
      driver: 'syslog',
      level: 'error',
      facility: 'local0',
      ident: 'vasuzex'
    },

    // Production setup
    production: {
      driver: 'stack',
      channels: ['file', 'syslog']
    }
  }
};
```

## Channels

### Console Driver

Colored console output with chalk.

```javascript
// Switch to console
const console = Log.channel('console');
console.info('This will be blue');
console.error('This will be red');
console.warning('This will be yellow');
console.debug('This will be gray');
```

**Colors:**
- Emergency: Red background
- Alert: Red
- Critical: Red
- Error: Red
- Warning: Yellow
- Notice: Cyan
- Info: Blue
- Debug: Gray

### File Driver

Async file logging with rotation.

```javascript
// Use file driver
const file = Log.channel('file');
await file.info('This goes to file');
```

**Rotation Strategies:**

1. **Daily** - New file each day
   ```javascript
   rotation: 'daily'
   // Files: app-2025-12-05.log, app-2025-12-06.log
   ```

2. **Weekly** - New file each week
   ```javascript
   rotation: 'weekly'
   // Files: app-week-48.log, app-week-49.log
   ```

3. **Size-based** - New file when size limit reached
   ```javascript
   rotation: 'size',
   maxSize: '10m' // 10MB
   ```

4. **Level-based** - Separate file per level
   ```javascript
   rotation: 'level'
   // Files: error.log, warning.log, info.log
   ```

### Syslog Driver

RFC 5424 compliant syslog.

```javascript
const syslog = Log.channel('syslog');
await syslog.error('Error message');
```

**Facilities:**
- local0-local7
- user
- daemon
- auth

### Stack Driver

Combine multiple channels.

```javascript
// Log to console AND file simultaneously
const stack = Log.channel('stack');
stack.info('Goes to all channels');
```

## Context & Metadata

Add context data to logs:

```javascript
// With context
Log.info('Order processed', {
  orderId: 123,
  userId: 456,
  amount: 1000,
  timestamp: new Date()
});

// Error with stack trace
try {
  await processPayment();
} catch (error) {
  Log.error('Payment failed', {
    error: error.message,
    stack: error.stack,
    orderId: order.id
  });
}
```

## Real-World Examples

### 1. API Request Logging

```javascript
app.use((req, res, next) => {
  Log.info('API Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});
```

### 2. Database Query Logging

```javascript
const users = await User.where('status', 'active').get();
Log.debug('Database Query', {
  model: 'User',
  query: 'where status = active',
  results: users.length
});
```

### 3. Payment Processing

```javascript
try {
  const payment = await Payment.create(data);
  Log.info('Payment Created', {
    paymentId: payment.id,
    amount: payment.amount,
    gateway: 'razorpay'
  });
} catch (error) {
  Log.error('Payment Failed', {
    error: error.message,
    data: data,
    gateway: 'razorpay'
  });
}
```

### 4. User Authentication

```javascript
// Successful login
Log.info('User Login', {
  userId: user.id,
  email: user.email,
  ip: req.ip
});

// Failed login
Log.warning('Login Failed', {
  email: req.body.email,
  reason: 'Invalid credentials',
  ip: req.ip
});
```

### 5. Background Jobs

```javascript
// Job started
Log.info('Job Started', {
  jobId: job.id,
  type: 'email-notifications'
});

// Job completed
Log.info('Job Completed', {
  jobId: job.id,
  duration: Date.now() - startTime,
  processed: emailsSent
});
```

## Production Setup

Recommended configuration for production:

```javascript
// config/logging.cjs
module.exports = {
  default: 'production',

  channels: {
    production: {
      driver: 'stack',
      channels: ['file', 'syslog']
    },

    file: {
      driver: 'file',
      path: '/var/log/vasuzex',
      level: 'info',
      rotation: 'daily',
      maxFiles: 30 // Keep 30 days
    },

    syslog: {
      driver: 'syslog',
      level: 'error',
      facility: 'local0'
    }
  }
};
```

## Log Levels

From most severe to least severe:

1. **emergency** - System is unusable
2. **alert** - Action must be taken immediately
3. **critical** - Critical conditions
4. **error** - Error conditions
5. **warning** - Warning conditions
6. **notice** - Normal but significant
7. **info** - Informational messages
8. **debug** - Debug-level messages

## Testing

```bash
# Run logging tests
pnpm test tests/unit/Logging/
```

**Coverage:** 25/25 tests passing ✅

## API Reference

### Log Facade

```javascript
// Log levels
Log.emergency(message, context = {})
Log.alert(message, context = {})
Log.critical(message, context = {})
Log.error(message, context = {})
Log.warning(message, context = {})
Log.notice(message, context = {})
Log.info(message, context = {})
Log.debug(message, context = {})

// Generic log
Log.log(level, message, context = {})

// Channel switching
Log.channel(name = null)
```

### LogManager

```javascript
import { LogManager } from '@vasuzex/framework';

const manager = new LogManager(config);

// Get channel
const console = manager.channel('console');

// Create custom driver
manager.extend('custom', (config) => new CustomLogger(config));
```

## See Also

- [DebugHelper](/docs/helpers/debug-helper.md) - inspect() and dd() functions
- [Error Handling](/docs/core/error-handling.md) - Exception handling
- [Configuration](/docs/getting-started/configuration.md) - Config files
