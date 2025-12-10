# NEASTORE-JS to VASUZEX-V2 Feature Mapping
## Complete Feature Comparison & Implementation Guide

---

## 📦 PACKAGE STRUCTURE COMPARISON

### neastore-js/packages Structure:
```
packages/
├── config/          - Centralized config management
├── database/        - Database models and migrations
├── ui/              - UI components (React/TypeScript)
├── utils/           - Shared utilities
└── web-utils/       - Web-specific utilities
```

### vasuzex-v2/framework Structure:
```
framework/
├── Foundation/      - Application bootstrap
├── Services/        - All service providers
├── Database/        - ORM and migrations
├── Http/            - HTTP handling
├── Support/         - Facades and helpers
└── [20+ modules]
```

---

## 🎯 FEATURE MAPPING (neastore-js → vasuzex-v2)

### 1. STORAGE & UPLOAD SERVICES

#### neastore-js:
```javascript
// packages/utils/src/upload/
- storage.service.js         → StorageService class
- upload-service.js           → Upload handling
- file-security.service.js    → Security scanning
- filename-generator.js       → Filename generation
- image-processor.js          → Image processing
- url-transformer.js          → URL transformation

// packages/utils/src/storage/
- base-storage.provider.js    → Base provider
- local-storage.provider.js   → Local storage
- s3-storage.provider.js      → S3/MinIO storage
- response-transformer.js     → Transform storage URLs
- storage-url-builder.js      → Build storage URLs
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Services/Storage/
✅ StorageManager.js          → Multi-disk storage manager
✅ Providers/
   ✅ BaseStorageProvider.js
   ✅ LocalStorageProvider.js
   ✅ S3StorageProvider.js

// framework/Services/Upload/
✅ UploadManager.js           → File upload manager
✅ FileValidator.js           → Validation
✅ SecurityScanner.js         → Security scanning
✅ ImageProcessor.js          → Image processing
✅ Drivers/
   ✅ LocalDriver.js
   ✅ S3Driver.js
```

**STATUS**: ✅ **FULLY AVAILABLE** - Vasuzex has complete storage/upload features

---

### 2. IMAGE & THUMBNAIL SERVICES

#### neastore-js:
```javascript
// packages/utils/src/image/
- thumbnail.service.js        → ThumbnailService class
  - getThumbnail()            → Get/generate thumbnail
  - generateThumbnail()       → Sharp processing
  - isValidSize()             → Size validation
  - getAllowedSizes()         → Size list
  - getCacheStats()           → Cache statistics
  - clearImageCache()         → Clear specific image

// packages/utils/src/cache/
- thumbnail-cache.js          → ThumbnailCache class
  - get()                     → Get from cache
  - set()                     → Store in cache
  - getCacheKey()             → MD5 hash key
  - clearExpired()            → Remove expired
  - clearAll()                → Clear all cache
  - getStats()                → Cache statistics
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Services/Media/
✅ MediaManager.js            → Media serving + thumbnails
   ✅ getImage()              → Get with optional resize
   ✅ generateThumbnail()     → Sharp processing
   ✅ validateDimensions()    → Size validation
   ✅ getCacheKey()           → MD5 hash
   ✅ getCachedThumbnail()    → Get from cache
   ✅ cacheThumbnail()        → Store in cache
   ✅ getCacheStats()         → Cache statistics
   ✅ clearExpiredCache()     → Remove expired
   ✅ clearAllCache()         → Clear all
   ✅ getAllowedSizes()       → Size list

// framework/Services/Image/
✅ ImageManager.js            → General image manipulation
✅ ThumbnailGenerator.js      → Thumbnail generation
✅ ImageOptimizer.js          → Image optimization
```

**STATUS**: ✅ **FULLY AVAILABLE** - Vasuzex has MediaManager with ALL thumbnail features

---

### 3. EMAIL SERVICES

#### neastore-js:
```javascript
// packages/utils/src/email-service/
- email.service.js            → EmailService
- template-email.service.js   → Template-based emails
- template-engine.js          → Template rendering
- template.js                 → Template helpers
- providers/                  → Email providers
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Services/Mail/
✅ MailManager.js             → Multi-driver mail manager
   ✅ send()                  → Send email
   ✅ mailer()                → Get mailer instance
   ✅ SMTP support
   ✅ SendGrid support
   ✅ SES support
```

**STATUS**: ✅ **AVAILABLE** - Vasuzex has MailManager (template support can be added)

---

### 4. SMS SERVICES

#### neastore-js:
```javascript
// packages/utils/src/sms-service/
- sms.service.js              → SMS sending
- providers/                  → SMS providers
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Services/SMS/
✅ SmsManager.js              → Multi-driver SMS manager
✅ Drivers/
   ✅ TwilioDriver.js
   ✅ AwsSnsDriver.js
   ✅ VonageDriver.js
   ✅ TwoFactorDriver.js
   ✅ LogDriver.js
```

**STATUS**: ✅ **FULLY AVAILABLE** - Vasuzex has complete SMS system

---

### 5. PAYMENT SERVICES

#### neastore-js:
```javascript
// packages/utils/src/phonepe-service/
- phonepe.service.js          → PhonePe integration
  - initiatePayment()
  - verifyPayment()
  - refund()

// packages/utils/src/razorpay-service/
- razorpay.service.js         → Razorpay integration
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Services/Payment/
✅ PaymentManager.js          → Multi-gateway manager
✅ Gateways/
   ✅ PhonePeGateway.js       → Complete PhonePe
   ✅ RazorpayGateway.js      → Complete Razorpay
   ✅ StripeGateway.js        → Stripe support
```

**STATUS**: ✅ **FULLY AVAILABLE** - Vasuzex has PaymentManager with PhonePe & Razorpay

---

### 6. GEOIP SERVICES

#### neastore-js:
```javascript
// packages/utils/src/geoip-service/
- index.js                    → GeoIP lookup
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Services/GeoIP/
✅ GeoIPManager.js            → Multi-provider GeoIP
✅ Providers/
   ✅ MaxMindProvider.js
   ✅ IP2LocationProvider.js
```

**STATUS**: ✅ **AVAILABLE** - Vasuzex has GeoIPManager

---

### 7. UTILITY HELPERS

#### neastore-js:
```javascript
// packages/utils/src/index.js
export const maskPhone = (phone) => {...}
export const maskEmail = (email) => {...}
export const generateRandomString = (length) => {...}
export const calculateSkip = (page, limit) => {...}
export const getErrorMessage = (error) => {...}
export const logger = {...}
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// framework/Support/
✅ Helpers/                   → Various helper functions
✅ Str.js                     → String utilities
✅ Arr.js                     → Array utilities
✅ Collection.js              → Collection methods
```

**STATUS**: ⚠️ **PARTIAL** - Some utils available, may need custom helpers

---

### 8. CONFIG MANAGEMENT

#### neastore-js:
```javascript
// packages/config/src/
- Centralized config
- ALLOWED_THUMBNAIL_SIZES
- THUMBNAIL_CACHE_CONFIG
- Server configs
- Database configs
```

#### vasuzex-v2 EQUIVALENT:
```javascript
// config/ (project root)
✅ app.cjs
✅ database.cjs
✅ filesystems.cjs
✅ image.cjs
✅ media.cjs                  → Media/thumbnail config
✅ upload.cjs
✅ All service configs
```

**STATUS**: ✅ **AVAILABLE** - Vasuzex has complete config system

---

### 9. STOCK MANAGEMENT

#### neastore-js:
```javascript
// packages/utils/src/stock-service/
- stock.service.js            → Stock management
```

#### vasuzex-v2 EQUIVALENT:
```
❌ NOT AVAILABLE - Custom business logic, needs to be built
```

**STATUS**: ❌ **MISSING** - Business-specific, not framework feature

---

## 🎨 ADDITIONAL VASUZEX-V2 FEATURES (NOT IN NEASTORE-JS)

### Extra Services Available:
```javascript
✅ Broadcasting/              → WebSocket/Pusher support
✅ Cache/                     → Multi-driver caching (Redis, Memcached)
✅ Queue/                     → Job queuing (Redis, Database)
✅ Events/                    → Event system
✅ Validation/                → Request validation
✅ Auth/                      → Authentication system
✅ Hash/                      → Password hashing
✅ Encryption/                → Data encryption
✅ Security/                  → Security utilities
✅ RateLimiter/               → Rate limiting
✅ Formatter/                 → Data formatting
✅ Location/                  → Location services
✅ Translation/               → i18n support
✅ Pagination/                → Data pagination
✅ Console/                   → CLI commands
✅ Patterns/                  → Design patterns
```

---

## 📊 COMPARISON SUMMARY

| Feature | neastore-js | vasuzex-v2 | Status |
|---------|-------------|------------|--------|
| **Storage (Local/S3)** | ✅ | ✅ | EQUIVALENT |
| **File Upload** | ✅ | ✅ | EQUIVALENT |
| **Image Processing** | ✅ | ✅ | EQUIVALENT |
| **Thumbnail Service** | ✅ Custom | ✅ MediaManager | EQUIVALENT |
| **Thumbnail Cache** | ✅ Filesystem | ✅ Filesystem | EQUIVALENT |
| **Email (SMTP/SendGrid)** | ✅ | ✅ | EQUIVALENT |
| **SMS (Twilio/SNS)** | ✅ | ✅ | EQUIVALENT |
| **PhonePe Payment** | ✅ | ✅ | EQUIVALENT |
| **Razorpay Payment** | ✅ | ✅ | EQUIVALENT |
| **GeoIP Lookup** | ✅ | ✅ | EQUIVALENT |
| **Config Management** | ✅ | ✅ | EQUIVALENT |
| **URL Transformation** | ✅ | ✅ | EQUIVALENT |
| **File Security** | ✅ | ✅ | EQUIVALENT |
| **Stock Service** | ✅ | ❌ | MISSING (Custom) |
| **Logger** | ✅ Simple | ✅ Advanced | BETTER IN V2 |
| **Caching** | ❌ | ✅ Redis/Memcached | BETTER IN V2 |
| **Queue System** | ❌ | ✅ | BETTER IN V2 |
| **Broadcasting** | ❌ | ✅ | BETTER IN V2 |
| **Auth System** | ❌ | ✅ | BETTER IN V2 |

---

## 🚀 IMPLEMENTATION STRATEGY FOR NEASTORE

### Phase 1: Media Server (PRIORITY)
Since MediaManager in vasuzex-v2 already has ALL features:
- ✅ Use `Media` facade directly
- ✅ `Media.getImage()` = ThumbnailService.getThumbnail()
- ✅ `Media.getCacheStats()` = Available
- ✅ `Media.clearExpiredCache()` = Available
- ✅ `Media.getAllowedSizes()` = Available

**NO NEED TO CREATE CUSTOM ThumbnailService** - MediaManager IS the ThumbnailService!

### Phase 2: Missing Features
Only need to add:
1. ❌ Stock Service (business logic)
2. ⚠️ Custom utility helpers (if specific ones needed)

### Phase 3: Configuration
- Ensure `config/media.cjs` has proper thumbnail config
- Set allowed sizes
- Configure cache settings

---

## 💡 KEY INSIGHTS

1. **Vasuzex-v2 is MORE feature-rich** than neastore-js packages
2. **MediaManager = ThumbnailService + ThumbnailCache** (combined)
3. **All payment gateways available** (PhonePe, Razorpay, Stripe)
4. **All communication services available** (Email, SMS)
5. **Storage abstraction identical** (Local, S3)
6. **Additional enterprise features** (Queue, Cache, Broadcasting, Auth)

---

## ✅ CONCLUSION

**Vasuzex-v2 framework contains ALL features from neastore-js/packages PLUS MORE.**

The only "missing" feature is **StockService**, which is business-specific logic, not a framework feature.

**For Media Server**: Use `MediaManager` directly via `Media` facade - it already has everything ThumbnailService had and more!

---

**Last Updated**: December 10, 2025
**Project**: neastore (Vasuzex V2)

---

## 🔧 VASUZEX-V2 GENERATOR ARCHITECTURE

### Port Assignment Strategy
**Latest Commit**: `7f8e4ec` - December 10, 2025

#### Auto-Increment Port System
```javascript
// framework/Console/config/generator.config.js
ports: {
  apiStart: 3000,      // API apps start from 3000 and auto-increment
  webStart: 4000,      // Web apps start from 4000 and auto-increment  
  mediaServer: 5000    // Media server is static service (hard-coded)
}
```

#### How It Works
```bash
# First API app
vasuzex generate:app blog --type api
# → apps/blog/api/.env: 
#    APP_PORT=3000
#    CORS_ORIGIN=http://localhost:4000 (points to blog web)

# Second API app  
vasuzex generate:app shop --type api
# → apps/shop/api/.env: 
#    APP_PORT=3001
#    CORS_ORIGIN=http://localhost:4001 (points to shop web)

# First Web app
vasuzex generate:app blog --type web
# → apps/blog/web/.env: APP_PORT=4000
# → vite.config.js reads APP_PORT from .env (no hard-coded port!)

# Second Web app
vasuzex generate:app shop --type web
# → apps/shop/web/.env: APP_PORT=4001
# → vite.config.js reads APP_PORT from .env

# Media server (static service)
vasuzex generate:media-server
# → apps/media-server/.env: APP_PORT=5000 (always)
```

#### Auto-Detection Logic
```javascript
// framework/Console/Commands/generate-app.js
function getNextAvailablePort(type) {
  // 1. Scans apps/* directory for existing apps
  // 2. Reads .env files to find used ports
  // 3. Returns next available port starting from base:
  //    - API: 3000, 3001, 3002, 3003...
  //    - Web: 4000, 4001, 4002, 4003...
}
```

### Environment Variable Architecture

#### ✅ CORRECT Structure
```
project-root/
  .env                    # Global config (DB, cache, CORS defaults)
                         # CORS_ORIGIN=* (fallback)
  config/
    cors.cjs             # NEW: CORS configuration file
  apps/
    blog/
      api/
        .env              # APP_PORT=3000
                         # CORS_ORIGIN=http://localhost:4000
      web/
        .env              # APP_PORT=4000
        vite.config.js   # Uses env.APP_PORT (config-driven!)
    shop/
      api/
        .env              # APP_PORT=3001
                         # CORS_ORIGIN=http://localhost:4001
      web/
        .env              # APP_PORT=4001
        vite.config.js   # Uses env.APP_PORT
    media-server/
      .env                # APP_PORT=5000
```

#### CORS Configuration (Config-Driven)
```javascript
// config/cors.cjs
module.exports = {
  origin: env('CORS_ORIGIN', 'http://localhost:4000'),
  methods: env('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE'),
  credentials: env('CORS_CREDENTIALS', 'true') === 'true',
  maxAge: parseInt(env('CORS_MAX_AGE', '3600')),
  // ... other CORS settings
};

// API apps automatically get CORS_ORIGIN in .env
// Points to corresponding web app port (auto-incremented)
```

#### Vite Configuration (Environment-Driven)
```javascript
// Generated vite.config.js (React/Vue/Svelte)
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      port: parseInt(env.APP_PORT) || 4000,  // Reads from .env!
    },
  };
});
```

**NO MORE HARD-CODED PORTS** in vite.config.js!

### Database Architecture

#### ✅ CORRECT - Centralized Database
```
project-root/
  database/
    index.js              # Centralized exports
    package.json          # @projectName/database workspace package
    models/
      User.js
      Post.js
    migrations/
    seeders/
  
  apps/
    blog/
      api/
        src/
          app.js          # import '@projectName/database'
          controllers/
            UserController.js  # import { User } from '@projectName/database'
```

**NO per-app database config files** - All apps import from `@projectName/database`

### Files Modified (All Generator Fixes)

#### Commit `7f8e4ec` - CORS + Vite Port Fix
```
✅ config/cors.cjs (NEW)
   - Complete CORS configuration file
   - Environment-driven settings

✅ framework/Console/Commands/utils/webStructure.js
   - generateViteConfig() for React: Uses loadEnv() + env.APP_PORT
   - generateViteConfig() for Vue: Uses loadEnv() + env.APP_PORT
   - generateViteConfig() for Svelte: Uses loadEnv() + env.APP_PORT
   - Removed hard-coded port: 3001

✅ framework/Console/Commands/generate-app.js
   - generateAppEnvFile() adds CORS_ORIGIN for API apps
   - CORS_ORIGIN points to web app port (auto-incremented)

✅ framework/Console/templates/api/app.js.hbs
   - Changed corsOrigin default from 'http://localhost:3001' to '*'
   - Uses env('CORS_ORIGIN', '*')

✅ bin/create-vasuzex.js
   - Added CORS_ORIGIN=*, CORS_METHODS, CORS_CREDENTIALS to root .env
```

#### Commit `07580d8` - Auto-Increment Ports
```
✅ bin/create-vasuzex.js
   - generateEnvFile() - Removed APP_PORT/APP_URL from root .env

✅ framework/Console/config/generator.config.js
   - Changed ports.api → ports.apiStart (3000)
   - Changed ports.web → ports.webStart (4000)  
   - Set ports.mediaServer = 5000 (static)

✅ framework/Console/Commands/generate-app.js
   - Added getNextAvailablePort() function
   - Added fs imports (readdirSync, existsSync, readFileSync)
   - generateAppEnvFile() uses auto-increment logic
   - Logs: "📌 Assigning port 3001 to shop api"

✅ framework/Console/Commands/generate-media-server.js
   - Hard-coded port = '5000' (no longer uses config)

✅ framework/Console/Commands/utils/mediaServerTemplates.js
   - Changed MEDIA_SERVER_PORT → APP_PORT
   - Added APP_URL to .env template

✅ framework/Console/plopfile.js
   - Removed database.js generation action
   - Comment: "Database config removed - now centralized"
```

### Key Implementation Details

**Port Detection Algorithm**:
1. Check if `apps/` directory exists
2. Scan all app folders for `{type}` subdirectories
3. Read `.env` files and extract `APP_PORT` values
4. Build Set of used ports
5. Start from base port (3000 for API, 4000 for Web)
6. Increment until finding unused port

**CORS Auto-Configuration**:
1. When generating API app, call `getNextAvailablePort('web')`
2. Add `CORS_ORIGIN=http://localhost:{webPort}` to API .env
3. Each API points to its corresponding web app automatically
4. Falls back to `*` if web app not found

**Vite Port Reading**:
1. Uses Vite's `loadEnv(mode, process.cwd(), '')` 
2. Reads `APP_PORT` from `.env` file
3. Falls back to 4000 if not found
4. No more hard-coded `port: 3001`!

**Why Media Server is 5000**:
- Media server is a **static service** (single instance)
- No need for auto-increment
- Hard-coded port = predictable and consistent
- Users can override with `--port` flag if needed

### Testing the Generator

```bash
# Create new project
npx vasuzex create test-project

# Generate multiple apps - ports + CORS auto-increment
cd test-project
npx vasuzex generate:app blog --type api      
# Port 3000, CORS_ORIGIN=http://localhost:4000

npx vasuzex generate:app shop --type api      
# Port 3001, CORS_ORIGIN=http://localhost:4001

npx vasuzex generate:app blog --type web      
# Port 4000, vite.config.js reads from .env

npx vasuzex generate:app shop --type web      
# Port 4001, vite.config.js reads from .env

npx vasuzex generate:media-server             
# Port 5000 (always)
```

**Verification Checklist**:
- ✅ Root `.env` has NO `APP_PORT` or `APP_URL`
- ✅ Root `.env` has CORS defaults (`CORS_ORIGIN=*`)
- ✅ Each API app `.env` has `CORS_ORIGIN` pointing to web port
- ✅ Each web app `.env` has `APP_PORT`
- ✅ Vite config reads `APP_PORT` from `.env` (no hard-coded port)
- ✅ No `apps/*/api/src/config/database.js` files exist
- ✅ All apps import from `@projectName/database`
- ✅ Media server always uses port 5000
- ✅ `config/cors.cjs` exists with full CORS configuration

---

## 🔧 VASUZEX-V2 CODING STANDARDS

### 1. Configuration Access Pattern
```javascript
// ✅ CORRECT - Use app.config()
const isDebug = this.app.config('app.debug', false);
const driver = this.app.config('filesystems.default');

// ❌ WRONG - Direct process.env access
const isDebug = process.env.APP_DEBUG === 'true';
```

**Standard**: Always use `app.config('key', defaultValue)` to access configuration values. Config files are in `/config/*.cjs` format.

### 2. Logging Pattern
```javascript
// ✅ CORRECT - Use Log facade (PSR-3 compatible)
import { Log } from 'vasuzex';

// Simple logging - framework handles debug filtering automatically
Log.error('Error serving image', { 
  path: imagePath,
  error: error.message,
  code: error.code,
  stack: error.stack  // Framework shows stack only if debug=true in config
});

Log.info('User action', { userId: 123 });
Log.debug('Debug info', { data: details });
Log.warning('Warning occurred', { context });

// ❌ WRONG - Manual debug checking
const isDebug = this.app.config('app.debug');
if (isDebug) {
  console.log('message');  // Never use console.*
}

// ❌ WRONG - Conditional logging
if (error.code !== 'ENOENT') {  // Don't filter manually
  Log.error('error');
}
```

**Standards**:
1. **Never use `console.log/error/warn/info`** - Always use `Log` facade
2. **Never manually check debug config** - Framework handles filtering via `config/logging.cjs`
3. **Always pass full error context** - Include error.message, error.code, error.stack
4. **Let framework filter** - Don't add conditional logic for debug mode
5. **Config controls everything** - Set log level in `config/logging.cjs`, not in code

**Log Levels** (PSR-3 Standard):
- `Log.emergency()` - System unusable
- `Log.alert()` - Immediate action required
- `Log.critical()` - Critical conditions  
- `Log.error()` - Runtime errors
- `Log.warning()` - Warnings
- `Log.notice()` - Normal but significant
- `Log.info()` - Informational
- `Log.debug()` - Debug details

**Log Drivers**: Console, File, Syslog (configured in `config/logging.cjs`)

**Configuration**: Set minimum level in config, framework auto-filters:
```javascript
// config/logging.cjs
channels: {
  console: {
    driver: 'console',
    level: 'debug'  // Shows all levels
  }
}
```

---

**Last Updated**: December 9, 2025
