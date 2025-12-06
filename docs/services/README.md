# Services Documentation

Complete guide to all services in the Vasuzex framework.

## Available Services

### Core Services
- [Logging](./logging.md) - Multi-channel logging system
- [Cache](./cache.md) - Multi-driver caching
- [Payment](./payment.md) - Payment gateway integration
- [GeoIP](./geoip.md) - IP geolocation services
- [Media](./media.md) - Image processing and CDN

### Communication Services
- [Mail](./mail.md) - Email service (SendGrid, Mailgun)
- [SMS](./sms.md) - SMS service (Twilio)

### Storage Services
- [Upload](./upload.md) - File upload and image processing
- [Storage](./storage.md) - File storage management

### Security Services
- [Security Middleware](./security.md) - Helmet, CORS, CSRF protection

## Quick Start

```javascript
import { Log, Cache, GeoIP, Media } from '@vasuzex/framework';
import { PaymentManager, SecurityMiddleware } from '@vasuzex/framework';

// Facades (work out of the box)
Log.info('User logged in', { userId: 1 });
await Cache.put('user:1', user, 3600);
const location = await GeoIP.lookup('8.8.8.8');

// Managers (need app instance)
const paymentManager = new PaymentManager(app);
const razorpay = paymentManager.gateway('razorpay');
const payment = await razorpay.createPayment({
  amount: 1000,
  currency: 'INR'
});

// Security Middleware
const security = new SecurityMiddleware(config);
app.use(security.helmet());
app.use(security.cors());
```

## Configuration

All services are configured via files in the `config/` directory:

- `config/logging.cjs` - Logging configuration
- `config/cache.cjs` - Cache drivers
- `config/payment.cjs` - Payment gateways
- `config/geoip.cjs` - GeoIP providers
- `config/media.cjs` - Media server settings
- `config/cdn.cjs` - CDN configuration
- `config/security.cjs` - Security settings

## Examples

See the `examples/` directory for complete working examples:

- `examples/debug-example.js` - Debug helper usage
- `examples/geoip-example.js` - GeoIP service
- `examples/sms-example.js` - SMS service
- `examples/formatter-example.js` - Formatting utilities

## Testing

All services have comprehensive test coverage:

```bash
# Test all services
pnpm test tests/unit/

# Test specific service
pnpm test tests/unit/Payment/
pnpm test tests/unit/GeoIP/
pnpm test tests/unit/Media/
```

## Service Patterns

All services in Vasuzex follow these patterns:

### 1. Manager Pattern
```javascript
// Manager handles driver/provider switching
const driver = Cache.store('redis');
const provider = GeoIP.provider('maxmind');
```

### 2. Facade Pattern
```javascript
// Use facades for simple access
import { Cache, Log, Payment } from '@vasuzex/framework';
```

### 3. Configuration-Driven
```javascript
// All behavior controlled via config files
// config/cache.cjs
module.exports = {
  default: 'redis',
  stores: {
    redis: { driver: 'redis', host: '127.0.0.1' }
  }
};
```

### 4. Provider/Driver Extensibility
```javascript
// Extend with custom drivers
Cache.extend('custom', (config) => new CustomDriver(config));
Payment.extend('custom', (config) => new CustomGateway(config));
```
