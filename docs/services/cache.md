# Cache Service

Multi-driver caching system with Redis, File, and Memory stores.

## Features

- 🚀 **Redis** - Production-ready with ioredis
- 📁 **File Store** - MD5 hashing, JSON serialization
- 💾 **Memory Store** - Map-based with auto cleanup
- ⏰ **TTL Support** - Automatic expiration
- 🔄 **Driver Switching** - Easy to switch between stores
- 🎯 **Tags** - Group related cache entries (Redis)

## Quick Start

```javascript
import { Cache } from '@vasuzex/framework';

// Store data
await Cache.put('user:1', user, 3600); // 1 hour

// Retrieve data
const user = await Cache.get('user:1');

// Check existence
if (await Cache.has('user:1')) {
  // Cache hit
}

// Delete
await Cache.forget('user:1');

// Flush all
await Cache.flush();
```

## Configuration

**File:** `config/cache.cjs`

```javascript
module.exports = {
  // Default store
  default: env('CACHE_DRIVER', 'redis'),

  // Available stores
  stores: {
    // Redis (recommended for production)
    redis: {
      driver: 'redis',
      host: env('REDIS_HOST', '127.0.0.1'),
      port: env('REDIS_PORT', 6379),
      password: env('REDIS_PASSWORD', null),
      database: env('REDIS_DB', 0),
      prefix: 'cache:'
    },

    // File cache
    file: {
      driver: 'file',
      path: 'storage/framework/cache',
      prefix: 'cache_'
    },

    // Memory cache
    memory: {
      driver: 'memory',
      cleanupInterval: 60 // seconds
    }
  }
};
```

## Drivers

### Redis Store (Recommended)

Production-ready Redis caching.

```javascript
// Use Redis
const redis = Cache.store('redis');

// Basic operations
await redis.put('key', 'value', 3600);
const value = await redis.get('key');
await redis.forget('key');

// Increment/Decrement
await redis.increment('counter');
await redis.decrement('counter', 5);

// Multiple operations
await redis.putMany({
  'user:1': user1,
  'user:2': user2
}, 3600);

const users = await redis.many(['user:1', 'user:2']);
```

**Features:**
- Persistent storage
- Pub/sub support
- Atomic operations
- Tag support
- High performance

### File Store

File-based caching with MD5 hashing.

```javascript
const file = Cache.store('file');

await file.put('key', { data: 'value' }, 3600);
const data = await file.get('key');
```

**Features:**
- MD5 key hashing
- JSON serialization
- Automatic expiration
- Auto cleanup of expired files

**Use Cases:**
- Development
- Low-traffic sites
- When Redis not available

### Memory Store

In-memory caching with Map.

```javascript
const memory = Cache.store('memory');

await memory.put('key', 'value', 60);
const value = await memory.get('key');

// Get stats
const stats = memory.getStats();
console.log(stats.size); // Number of entries
console.log(stats.keys); // Array of keys
```

**Features:**
- Fast access
- 60-second cleanup interval
- Statistics tracking
- No persistence

**Use Cases:**
- Testing
- Temporary data
- Session data (single server)

## Real-World Examples

### 1. User Caching

```javascript
async function getUser(id) {
  const cacheKey = `user:${id}`;
  
  // Try cache first
  let user = await Cache.get(cacheKey);
  
  if (!user) {
    // Cache miss - fetch from database
    user = await User.find(id);
    
    // Store in cache for 1 hour
    await Cache.put(cacheKey, user, 3600);
  }
  
  return user;
}
```

### 2. API Response Caching

```javascript
router.get('/api/products', async (req, res) => {
  const cacheKey = 'api:products:list';
  
  let products = await Cache.get(cacheKey);
  
  if (!products) {
    products = await Product.where('active', true).get();
    await Cache.put(cacheKey, products, 300); // 5 minutes
  }
  
  res.json(products);
});
```

### 3. Rate Limiting

```javascript
async function checkRateLimit(ip) {
  const key = `ratelimit:${ip}`;
  const limit = 100; // requests per minute
  
  const current = await Cache.get(key) || 0;
  
  if (current >= limit) {
    return false; // Rate limit exceeded
  }
  
  await Cache.put(key, current + 1, 60);
  return true;
}
```

### 4. Database Query Caching

```javascript
async function getActiveUsers() {
  return await Cache.remember('users:active', 3600, async () => {
    return await User.where('status', 'active').get();
  });
}

// Cache.remember() helper
Cache.remember = async (key, ttl, callback) => {
  let value = await Cache.get(key);
  if (value === null) {
    value = await callback();
    await Cache.put(key, value, ttl);
  }
  return value;
};
```

### 5. Session Storage

```javascript
async function storeSession(sessionId, data) {
  await Cache.put(`session:${sessionId}`, data, 86400); // 24 hours
}

async function getSession(sessionId) {
  return await Cache.get(`session:${sessionId}`);
}

async function destroySession(sessionId) {
  await Cache.forget(`session:${sessionId}`);
}
```

### 6. Configuration Caching

```javascript
async function getCachedConfig(key) {
  const cacheKey = `config:${key}`;
  
  return await Cache.remember(cacheKey, 3600, async () => {
    return await Config.get(key);
  });
}
```

## Advanced Features

### Cache Tags (Redis Only)

```javascript
// Store with tags
await Cache.tags(['users', 'premium']).put('user:1', user, 3600);

// Flush by tag
await Cache.tags(['users']).flush();
```

### Atomic Operations

```javascript
// Increment counter
await Cache.increment('page:views');
await Cache.increment('downloads', 5);

// Decrement
await Cache.decrement('stock:item:1');
```

### Forever Storage

```javascript
// Store permanently (no expiration)
await Cache.forever('app:version', '1.0.0');
```

### Pull (Get and Delete)

```javascript
// Get value and remove from cache
const value = await Cache.pull('key');
```

### Remember Forever

```javascript
// Store if not exists, forever
await Cache.rememberForever('app:settings', async () => {
  return await Settings.all();
});
```

## Performance Tips

### 1. Cache Warm-up

```javascript
// Warm up cache on startup
async function warmUpCache() {
  const users = await User.all();
  await Cache.putMany(
    users.reduce((acc, user) => {
      acc[`user:${user.id}`] = user;
      return acc;
    }, {}),
    3600
  );
}
```

### 2. Cache Prefixes

```javascript
// Use prefixes for namespacing
await Cache.put('api:v1:users', users, 300);
await Cache.put('api:v2:users', usersV2, 300);
```

### 3. Conditional Caching

```javascript
// Cache only expensive queries
const users = await Cache.remember('users:active', 3600, async () => {
  return await User.with(['orders', 'profile']).get();
});
```

## Testing

```bash
# Run cache tests
pnpm test tests/unit/Cache/
```

**Coverage:** 20/20 tests passing ✅

## API Reference

### Cache Facade

```javascript
// Basic operations
await Cache.put(key, value, ttl)
await Cache.get(key, defaultValue = null)
await Cache.has(key)
await Cache.forget(key)
await Cache.flush()

// Multiple operations
await Cache.putMany(object, ttl)
await Cache.many(keys)

// Increment/Decrement
await Cache.increment(key, value = 1)
await Cache.decrement(key, value = 1)

// Forever
await Cache.forever(key, value)

// Pull
await Cache.pull(key)

// Store switching
Cache.store(name = null)
```

### CacheManager

```javascript
import { CacheManager } from '@vasuzex/framework';

const manager = new CacheManager(config);

// Get store
const redis = manager.store('redis');

// Create custom driver
manager.extend('custom', (config) => new CustomStore(config));
```

## Environment Variables

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## See Also

- [Session Management](/docs/services/session.md)
- [Rate Limiting](/docs/services/rate-limiting.md)
- [Configuration](/docs/getting-started/configuration.md)
