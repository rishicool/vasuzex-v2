# Facades

Facades provide a static interface to classes in the [Service Container](service-container.md). They're like shortcuts that make your code cleaner and more expressive.

## Introduction

Facades let you access container services using simple, static syntax:

```javascript
import { DB, Cache, Log } from 'vasuzex';

// Instead of this
const db = app.make('db');
await db.table('users').where('id', 1).first();

// Use this
await DB.table('users').where('id', 1).first();
```

Vas uzex's facades are inspired by Laravel and provide the same benefits:
- **Expressive syntax** - Clean, readable code
- **Testability** - Easy to mock in tests
- **IDE support** - Better autocomplete with proper typing

## Available Facades

### Database & ORM

| Facade | Service | Description |
|--------|---------|-------------|
| `DB` | database | Query builder, raw queries |

### Caching

| Facade | Service | Description |
|--------|---------|-------------|
| `Cache` | cache | Store and retrieve cached data |

### Authentication & Authorization

| Facade | Service | Description |
|--------|---------|-------------|
| `Auth` | auth | User authentication |
| `Hash` | hash | Password hashing |
| `Gate` | gate | Authorization policies |

### HTTP & Routing

| Facade | Service | Description |
|--------|---------|-------------|
| `Http` | http | HTTP client |
| `Session` | session | Session management |
| `Cookie` | cookie | Cookie management |

### Communication

| Facade | Service | Description |
|--------|---------|-------------|
| `Mail` | mailer | Send emails |
| `SMS` | sms | Send text messages |
| `Notification` | notification | Multi-channel notifications |
| `Broadcast` | broadcaster | WebSocket broadcasting |

### Storage & Files

| Facade | Service | Description |
|--------|---------|-------------|
| `Storage` | filesystem | File storage operations |
| `Upload` | upload | File upload handling |
| `Image` | image | Image manipulation |
| `Media` | media | Media management |

### Utilities

| Facade | Service | Description |
|--------|---------|-------------|
| `Log` | logger | Application logging |
| `Config` | config | Configuration values |
| `Event` | events | Event dispatcher |
| `Queue` | queue | Job queueing |
| `Validator` | validator | Data validation |
| `Crypt` | encrypter | Encryption/decryption |
| `Format` | formatter | Indian number/currency formatting |
| `Location` | location | Geocoding, distance calculations |
| `GeoIP` | geoip | IP geolocation |
| `RateLimiter` | rateLimiter | Rate limiting |

## Usage Examples

### DB Facade

```javascript
import { DB } from 'vasuzex';

// Query builder
const users = await DB.table('users')
  .where('active', true)
  .orderBy('created_at', 'desc')
  .get();

// Insert
await DB.table('posts').insert({
  title: 'Hello World',
  content: 'My first post'
});

// Update
await DB.table('users')
  .where('id', 1)
  .update({ name: 'John Doe' });

// Delete
await DB.table('posts').where('id', 1).delete();

// Raw queries
const result = await DB.raw('SELECT * FROM users WHERE age > ?', [18]);

// Transactions
await DB.transaction(async () => {
  await DB.table('accounts').where('id', 1).decrement('balance', 100);
  await DB.table('accounts').where('id', 2).increment('balance', 100);
});
```

### Cache Facade

```javascript
import { Cache } from 'vasuzex';

// Store data
await Cache.put('key', 'value', 3600); // 1 hour

// Retrieve data
const value = await Cache.get('key', 'default');

// Remember (cache if not exists)
const users = await Cache.remember('users', 3600, async () => {
  return await DB.table('users').get();
});

// Check existence
if (await Cache.has('key')) {
  console.log('Key exists');
}

// Remove
await Cache.forget('key');

// Increment/Decrement
await Cache.increment('views', 1);
await Cache.decrement('stock', 1);

// Multiple stores
await Cache.store('redis').put('key', 'value');
await Cache.store('file').put('key', 'value');
```

### Auth Facade

```javascript
import { Auth } from 'vasuzex';

// Attempt login
const success = await Auth.attempt({
  email: 'user@example.com',
  password: 'secret'
});

// Get authenticated user
const user = Auth.user();

// Check authentication
if (Auth.check()) {
  console.log('User is logged in');
}

// Logout
Auth.logout();

// Login with user instance
const user = await User.find(1);
Auth.login(user);

// Login for single request
Auth.once({ email: 'user@example.com', password: 'secret' });
```

### Hash Facade

```javascript
import { Hash } from 'vasuzex';

// Hash password
const hashed = await Hash.make('password');

// Verify password
const valid = await Hash.check('password', hashed);

// Check if needs rehash
if (Hash.needsRehash(hashed)) {
  const newHash = await Hash.make('password');
}
```

### Log Facade

```javascript
import { Log } from 'vasuzex';

// Log levels
Log.emergency('System is down');
Log.alert('Action required');
Log.critical('Critical error');
Log.error('An error occurred', { error: err });
Log.warning('This is a warning');
Log.notice('Normal but significant');
Log.info('User logged in', { user_id: 123 });
Log.debug('Debug information', { data: obj });

// With context
Log.info('Order placed', {
  user_id: 1,
  order_id: 123,
  total: 99.99
});
```

### Mail Facade

```javascript
import { Mail } from 'vasuzex';

// Send email
await Mail.to('user@example.com')
  .subject('Welcome!')
  .html('<h1>Welcome to our app</h1>')
  .send();

// With CC and BCC
await Mail.to('user@example.com')
  .cc('manager@example.com')
  .bcc('admin@example.com')
  .subject('Invoice')
  .send();

// With attachments
await Mail.to('user@example.com')
  .subject('Your Report')
  .attach('/path/to/report.pdf')
  .send();

// Using templates
await Mail.to('user@example.com')
  .template('emails.welcome', { name: 'John' })
  .send();
```

### SMS Facade

```javascript
import { SMS } from 'vasuzex';

// Send SMS
await SMS.to('+1234567890')
  .message('Your verification code is: 123456')
  .send();

// Bulk SMS
await SMS.to(['+1234567890', '+0987654321'])
  .message('Announcement to all')
  .send();
```

### Storage Facade

```javascript
import { Storage } from 'vasuzex';

// Store file
await Storage.put('uploads/file.txt', 'File content');

// Get file
const content = await Storage.get('uploads/file.txt');

// Check existence
if (await Storage.exists('uploads/file.txt')) {
  console.log('File exists');
}

// Delete file
await Storage.delete('uploads/file.txt');

// Get URL
const url = Storage.url('uploads/photo.jpg');

// Different disk
await Storage.disk('s3').put('file.txt', 'content');
```

### Queue Facade

```javascript
import { Queue } from 'vasuzex';

// Dispatch job
await Queue.push('ProcessUpload', { file: 'photo.jpg' });

// Delayed job
await Queue.later(60, 'SendEmail', { to: 'user@example.com' });

// On specific queue
await Queue.pushOn('emails', 'SendWelcomeEmail', { user_id: 1 });
```

### Config Facade

```javascript
import { Config } from 'vasuzex';

// Get value
const appName = Config.get('app.name');

// Get with default
const timeout = Config.get('app.timeout', 30);

// Nested values
const dbHost = Config.get('database.connections.postgresql.host');

// Set at runtime
Config.set('app.locale', 'es');

// Check existence
if (Config.has('services.stripe')) {
  // Stripe is configured
}
```

### Event Facade

```javascript
import { Event } from 'vasuzex';

// Dispatch event
Event.dispatch('user.registered', { user });

// Listen to event
Event.listen('user.registered', (data) => {
  console.log('New user:', data.user);
});

// Subscribe to multiple events
Event.subscribe(UserEventSubscriber);
```

### Format Facade

```javascript
import { Format } from 'vasuzex';

// Currency
Format.currency(1234.56); // ₹1,234.56

// Indian number format
Format.indianNumber(1234567); // 12,34,567

// Percentage
Format.percentage(0.45); // 45.00%

// File size
Format.fileSize(1024000); // 1 MB
```

### Location Facade

```javascript
import { Location } from 'vasuzex';

// Geocode address
const coords = await Location.geocode('Delhi, India');
// { lat: 28.6139, lng: 77.2090 }

// Reverse geocode
const address = await Location.reverseGeocode(28.6139, 77.2090);

// Calculate distance
const distance = Location.distance(
  { lat: 28.6139, lng: 77.2090 },
  { lat: 19.0760, lng: 72.8777 }
);
// Distance in km between Delhi and Mumbai
```

### GeoIP Facade

```javascript
import { GeoIP } from 'vasuzex';

// Get location from IP
const location = await GeoIP.lookup('8.8.8.8');
// {
//   country: 'United States',
//   city: 'Mountain View',
//   timezone: 'America/Los_Angeles',
//   ...
// }
```

## Creating Custom Facades

### Step 1: Create the Facade Class

```javascript
// framework/Support/Facades/MyService.js
import { Facade, createFacade } from './Facade.js';

class MyServiceFacade extends Facade {
  static getFacadeAccessor() {
    return 'my-service'; // Container binding name
  }
}

export default createFacade(MyServiceFacade);
```

### Step 2: Register the Service

```javascript
// In a service provider
import { ServiceProvider } from 'vasuzex';
import { MyService } from '../services/MyService.js';

export class MyServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('my-service', () => {
      return new MyService();
    });
  }
}
```

### Step 3: Export the Facade

```javascript
// framework/Support/Facades/index.js
export { default as MyService } from './MyService.js';
```

### Step 4: Use Your Facade

```javascript
import { MyService } from 'vasuzex';

MyService.doSomething();
```

## Testing with Facades

### Mocking Facades

```javascript
import { Cache } from 'vasuzex';

// In tests
describe('UserService', () => {
  test('caches user data', async () => {
    // Mock the Cache facade
    const mockPut = jest.fn();
    Cache.put = mockPut;
    
    await userService.getUser(1);
    
    expect(mockPut).toHaveBeenCalledWith('user_1', expect.any(Object), 3600);
  });
});
```

### Spying on Facades

```javascript
import { Log } from 'vasuzex';

test('logs errors', () => {
  const spy = jest.spyOn(Log, 'error');
  
  service.performAction();
  
  expect(spy).toHaveBeenCalled();
  
  spy.mockRestore();
});
```

## Facade vs. Dependency Injection

Both approaches have their place:

### Using Facades (Quick & Clean)

```javascript
import { DB, Cache } from 'vasuzex';

export class UserService {
  async getUser(id) {
    return await Cache.remember(`user_${id}`, 3600, async () => {
      return await DB.table('users').where('id', id).first();
    });
  }
}
```

**Pros**: Clean, concise, easy to write
**Cons**: Harder to mock in tests

### Using Dependency Injection (Testable)

```javascript
export class UserService {
  constructor(db, cache) {
    this.db = db;
    this.cache = cache;
  }

  async getUser(id) {
    return await this.cache.remember(`user_${id}`, 3600, async () => {
      return await this.db.table('users').where('id', id).first();
    });
  }
}
```

**Pros**: Easier to test, explicit dependencies
**Cons**: More verbose

### Best Practice: Mix Both

Use facades for rapid development, inject for complex or testable code:

```javascript
// Simple controller - use facades
export class PostController {
  async index() {
    return await DB.table('posts').get();
  }
}

// Complex service - inject dependencies
export class PaymentService {
  constructor(gateway, logger, mailer) {
    this.gateway = gateway;
    this.logger = logger;
    this.mailer = mailer;
  }

  async process(payment) {
    // Easier to test with injected dependencies
  }
}
```

## How Facades Work

Under the hood, facades use JavaScript Proxies to forward static method calls:

```javascript
// When you call
DB.table('users').get();

// The facade:
// 1. Resolves 'db' from the container
// 2. Calls table() on the resolved instance
// 3. Returns the result
```

The facade class:

```javascript
class DBFacade extends Facade {
  static getFacadeAccessor() {
    return 'db'; // Container binding
  }
}

export default createFacade(DBFacade);
```

The `createFacade()` function wraps the class in a Proxy that intercepts all method calls and forwards them to the resolved instance.

## Best Practices

### 1. Import What You Need

```javascript
// Good
import { DB, Cache } from 'vasuzex';

// Avoid importing everything
import * as Framework from 'vasuzex';
```

### 2. Don't Overuse Facades

Facades are great, but don't use them everywhere:

```javascript
// Good: Complex logic with injected dependencies
class OrderService {
  constructor(payment, inventory, mailer) {
    this.payment = payment;
    this.inventory = inventory;
    this.mailer = mailer;
  }
}

// Facade for quick operations is fine
await Cache.put('recent_orders', orders, 300);
```

### 3. Provide Type Hints (TypeScript/JSDoc)

```javascript
/**
 * @param {number} id
 * @returns {Promise<User>}
 */
async function getUser(id) {
  return await DB.table('users').where('id', id).first();
}
```

### 4. Clear Facade Cache in Tests

```javascript
afterEach(() => {
  Facade.clearResolvedInstances();
});
```

## Comparison with Laravel

Vasuzex facades work similarly to Laravel:

| Laravel (PHP) | Vasuzex (Node.js) |
|---------------|-------------------|
| `use Illuminate\Support\Facades\DB;` | `import { DB } from 'vasuzex';` |
| `DB::table('users')->get();` | `await DB.table('users').get();` |
| `Cache::put('key', 'value', 60);` | `await Cache.put('key', 'value', 3600);` |
| `Auth::user();` | `Auth.user();` |

Key difference: JavaScript facades use `await` for async operations.

## Troubleshooting

### Facade Root Not Set

```javascript
// Error: A facade root has not been set

// Fix: Ensure app is booted
const app = new Application();
await app.boot(); // This sets up facades
```

### Method Not Found

```javascript
// Error: instance[prop] is not a function

// Fix: Check method exists on the underlying service
const cache = app.make('cache');
console.log(typeof cache.put); // Should be 'function'
```

## Next Steps

- [Service Container](service-container.md)
- [Service Providers](service-providers.md)
- [Database Query Builder](../database/query-builder.md)
- [Caching](../services/cache.md)
