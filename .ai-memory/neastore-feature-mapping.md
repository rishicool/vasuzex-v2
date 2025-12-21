# neasto PROJECT - AI MEMORY
## Complete Implementation Guide & Architecture Rules

---

## 🌐 PORT ALLOCATION (STANDARD - MUST FOLLOW)

**Production-Ready Port Scheme**:

| Application | API Port | Web Port | URL |
|-------------|----------|----------|-----|
| **Customer** | 3000 | 4000 | API: http://localhost:3000/api<br>Web: http://localhost:4000 |
| **Business** | 3001 | 4001 | API: http://localhost:3001/api<br>Web: http://localhost:4001 |
| **Delivery** | 3002 | 4002 | API: http://localhost:3002/api<br>Web: http://localhost:4002 |
| **Admin** | 3003 | 4003 | API: http://localhost:3003/api<br>Web: http://localhost:4003 |
| **Media Server** | 5000 | - | http://localhost:5000 |

**Pattern**:
- APIs: 3000-3003 (Customer → Business → Delivery → Admin)
- Webs: 4000-4003 (Customer → Business → Delivery → Admin)
- Media: 5000 (standalone service)

**Environment Variables**:
```bash
# Customer API
APP_PORT=3000
APP_URL=http://localhost:3000

# Customer Web
VITE_API_BASE_URL=http://localhost:3000/api

# Media Server
MEDIA_SERVER_PORT=5000
MEDIA_URL=http://localhost:5000
```

---

## 🏗️ ARCHITECTURE PRINCIPLES (CRITICAL - READ FIRST)

### **Golden Rule: Thin Controllers/Routes + Fat Models/Services**

#### ✅ WHAT TO DO:
1. **Controllers (20-50 lines max)**:
   - Only validate requests
   - Call service methods
   - Format & return responses
   - ❌ **NO business logic**
   - ❌ **NO database queries**
   - ❌ **NO Model.find(), User.where(), etc.**
   - ❌ **NO file processing logic**

2. **Services (100+ lines OK)**:
   - ALL business logic here
   - Database queries via Models
   - Transaction management
   - External API calls
   - Data transformations
   - File upload processing (via Upload facade)
   - ✅ **This is where work happens**

3. **Models (Fat Models with Query Scopes)**:
   - Query scopes (`User.findByPhone()`, `AppConfig.active()`, `AppConfig.publicOnly()`)
   - Relationships (`hasMany`, `belongsTo`)
   - Domain methods (`user.isBlocked()`, `config.isActive()`)
   - Accessors/Mutators
   - ✅ **Use scopes instead of raw where() clauses**

4. **Routes (1-3 lines each)**:
   - Just endpoint definitions
   - Middleware attachment (auth, upload)
   - Map to controllers
   - ❌ **NO multer diskStorage configuration**
   - ❌ **NO file processing**
   - ✅ **Use Upload.getMulterUpload() from framework**

---

### **File Upload Architecture (FRAMEWORK-LEVEL - CRITICAL)**

#### ✅ CORRECT PATTERN (Using Vasuzex Upload Facade):

**Architecture**: Framework Upload facade → DB/Config-driven → Storage drivers (local/s3)

**Flow**: Routes (Upload.getMulterUpload()) → Controller (pass files) → Service (Upload.processUpload()) → Framework UploadManager → Storage drivers

**1. Routes - Upload Middleware from Framework**:
```javascript
// routes/registration.js
import { Upload } from 'vasuzex';

// Upload middleware - uses framework Upload with memoryStorage
const uploadMiddleware = (req, res, next) => {
  const upload = Upload.getMulterUpload({ configType: 'document' });
  return upload.any()(req, res, next); // Files in memory as Buffer
};

router.put('/store/step/:stepNumber', uploadMiddleware, controller.updateStoreStep);
```

**2. Service - Process Upload via Framework**:
```javascript
// services/RegistrationService.js
import { Upload } from 'vasuzex';

export class RegistrationService {
  async processStoreStepData(step, data, files, userId) {
    if (step === 4 && files) {
      const uploadedDocs = {};
      
      for (const [fieldName, fileArray] of Object.entries(files)) {
        const file = fileArray[0];
        
        // Generate safe filename
        const filename = Upload.generateFilename(file, `store_${fieldName}`, userId);
        
        // Upload via framework Upload facade
        const result = await Upload.processUpload(file, 'document', {
          path: `documents/store/${userId}`,
          filename
        });
        
        uploadedDocs[fieldName] = {
          path: result.path,
          url: result.url,
          filename: result.filename,
          ...
        };
      }
      
      return { metadata: { documents: uploadedDocs } };
    }
  }
}
```

**3. Framework Upload Methods**:
```javascript
// vasuzex-v2/framework/Services/Upload/UploadManager.js

// Get multer middleware
Upload.getMulterUpload({ configType: 'document' })
// Returns: multer instance with memoryStorage + config-based validation

// Process upload with config type
Upload.processUpload(file, 'document', { path, filename, disk })
// Reads config from: DB (system_configs) → File (config/upload.cjs) → Framework defaults

// Generate safe filename
Upload.generateFilename(file, 'store_license', userId)
// Returns: store_license_123_1702234567890_987654321.pdf

// Shortcuts
Upload.uploadDocument(file, options)
Upload.uploadImage(file, options)
Upload.uploadVideo(file, options)
```

**4. Config Hierarchy (3-Tier)**:
```javascript
// 1. Database (PRIMARY) - Runtime config
system_configs table:
  upload.document.maxSize = 5242880
  upload.document.allowedTypes = ["image/jpeg", "application/pdf"]
  upload.default = "local" or "s3"

// 2. Project Config (OVERRIDE) - neasto/config/upload.cjs
module.exports = {
  document: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    disk: 'uploads'
  }
};

// 3. Framework Defaults (FALLBACK) - vasuzex-v2/config/upload.cjs
module.exports = {
  validation: { maxSize: 10485760, ... },
  image: { maxSize: 5242880, ... },
  document: { maxSize: 20971520, ... }
};
```

**5. Storage Driver (Config-Driven)**:
```javascript
// config/filesystems.cjs
module.exports = {
  default: env('FILESYSTEM_DRIVER', 'local'), // Can be overridden by DB
  disks: {
    uploads: {
      driver: 'local',
      root: 'storage/app/uploads',
      url: env('APP_URL') + '/uploads'
    },
    s3: {
      driver: 's3',
      key: env('AWS_ACCESS_KEY_ID'),
      secret: env('AWS_SECRET_ACCESS_KEY'),
      bucket: env('AWS_BUCKET')
    }
  }
};
```

#### ❌ WRONG PATTERNS:
```javascript
// ❌ DON'T create custom UploadService per app
class UploadService { ... } // Use framework Upload instead

// ❌ DON'T configure multer diskStorage in routes
const storage = multer.diskStorage({ destination: './uploads', ... });

// ❌ DON'T hard-code config values
maxFileSize: 5 * 1024 * 1024 // Use Upload.processUpload() which reads from DB/config

// ❌ DON'T use hard-coded paths
fs.writeFileSync('./uploads/file.jpg', buffer); // Use Upload.processUpload()
```

#### 📋 Key Points:
1. **Framework-Level**: Upload service in vasuzex-v2/framework, NOT app-level
2. **DB-Driven Config**: Reads from system_configs table first, then file config
3. **Multer Integration**: `Upload.getMulterUpload()` returns configured multer instance
4. **Config Types**: 'document', 'image', 'video', 'audio' with type-specific rules
5. **Storage Drivers**: Local/S3 switchable via DB config at runtime
6. **No Custom Services**: Use `Upload.processUpload()` directly in services
7. **Safe Filenames**: `Upload.generateFilename()` for consistent naming

---

### **Query Scope Usage (MANDATORY)**

#### ❌ BAD - Raw where() clauses:
```javascript
// ❌ Don't use raw where clauses
const configs = await AppConfig
  .where('is_active', true)
  .where('is_public', true)
  .get();

const users = await User
  .where('status', 'active')
  .where('is_verified', true)
  .get();
```

#### ✅ GOOD - Query Scopes:
```javascript
// ✅ Use query scopes in Models
class AppConfig extends Model {
  static active() {
    return this.where('is_active', true);
  }
  
  static inactive() {
    return this.where('is_active', false);
  }
  
  static publicOnly() {
    return this.where('is_public', true);
  }
  
  static privateOnly() {
    return this.where('is_public', false);
  }
  
  static forEnvironment(env) {
    return this.where(function() {
      this.where('environment', env).orWhere('environment', 'all');
    });
  }
}

// ✅ Then use in Services
const configs = await AppConfig
  .active()
  .publicOnly()
  .forEnvironment('production')
  .get();
```

**Benefits**:
- Reusable query logic
- Cleaner code
- Easier testing
- Consistent behavior
- Self-documenting

---

### **Frontend Config Management (API-Driven)**

#### ✅ MANDATORY Pattern for All Web Apps:

1. **On App Load** - Fetch configs from backend:
```javascript
// Next.js, React, Vue - All web apps must do this
async function initializeApp() {
  // Fetch backend configs on app load
  const response = await fetch('/api/config/app-settings');
  const configs = await response.json();
  
  // Store in localStorage for offline access
  localStorage.setItem('app_config', JSON.stringify(configs.data));
  
  // Set in global state (Redux/Zustand/Context)
  store.dispatch(setAppConfig(configs.data));
}
```

2. **Use Config from localStorage** - Not hardcoded:
```javascript
// ❌ BAD - Hardcoded config
const GOOGLE_MAPS_KEY = 'AIzaSyABC123...';
const API_URL = 'http://localhost:3000';

// ✅ GOOD - API-driven config
const getConfig = (key, defaultValue = null) => {
  const configs = JSON.parse(localStorage.getItem('app_config') || '{}');
  return configs[key] || defaultValue;
};

const googleMapsKey = getConfig('googleMapsKey');
const apiUrl = getConfig('apiUrl');
const mediaUrl = getConfig('mediaUrl');
```

3. **Backend Returns Public Configs**:
```javascript
// ConfigService.js (Backend)
async getPublicAppSettings() {
  return {
    apiUrl: process.env.APP_URL,
    mediaUrl: process.env.MEDIA_URL,
    googleMapsKey: dbConfig('integrations.googleMapsKey'),
    features: {
      enablePayments: dbConfig('features.enablePayments'),
      enableDelivery: dbConfig('features.enableDelivery'),
    },
    branding: {
      appName: dbConfig('branding.appName'),
      logo: dbConfig('branding.logo'),
    },
    // Payment keys (public keys only)
    phonepe: {
      merchantId: dbConfig('phonepe.merchantId'),
    },
    razorpay: {
      keyId: dbConfig('razorpay.keyId'),
    },
  };
}
```

4. **Web Apps Pattern**:
```
┌─────────────────────────────────────────────────┐
│  Web App Initialization                         │
│  1. App loads                                   │
│  2. Fetch /api/config/app-settings              │
│  3. Store in localStorage                       │
│  4. Set in global state                         │
│  5. Use throughout app                          │
└─────────────────────────────────────────────────┘
```

**Benefits**:
- ✅ No hardcoded API keys in frontend
- ✅ Change config without redeploying web
- ✅ Environment-specific configs from backend
- ✅ Works offline (localStorage cache)
- ✅ Single source of truth (database)

---

#### ❌ NEVER DO:
```javascript
// ❌ BAD - Controller with queries
async getUser(req, res) {
  const user = await User.where('id', req.params.id).first(); // ❌ NO!
  return res.json(user);
}

// ❌ BAD - Route with business logic
router.get('/users/:id', async (req, res) => {
  const user = await User.find(req.params.id); // ❌ NO!
  if (user.status === 'blocked') return res.status(403); // ❌ NO!
  res.json(user);
});

// ❌ BAD - Middleware with data loading
async checkUser(req, res, next) {
  const user = await User.find(req.userId); // ❌ NO!
  req.user = user;
  next();
}

// ❌ BAD - Raw where clauses instead of scopes
const configs = await AppConfig
  .where('is_active', true)
  .where('is_public', true)
  .get();

// ❌ BAD - Hardcoded config in frontend
const GOOGLE_MAPS_KEY = 'AIzaSyABC123...';
```

#### ✅ ALWAYS DO:
```javascript
// ✅ GOOD - Thin Controller
async getUser(req, res) {
  const user = await this.userService.getUserById(req.params.id);
  return res.json(user);
}

// ✅ GOOD - Fat Service
class UserService {
  async getUserById(id) {
    const user = await User.findOrFail(id);
    if (user.isBlocked()) {
      throw new Error('User blocked');
    }
    return this.formatUserData(user);
  }
}

// ✅ GOOD - Route
router.get('/users/:id', (req, res) => userController.getUser(req, res));

// ✅ GOOD - Query Scopes
const configs = await AppConfig.active().publicOnly().forEnvironment('production').get();

// ✅ GOOD - API-driven frontend config
const googleMapsKey = getConfig('googleMapsKey');
```

---

## 🎯 MIGRATION PROGRESS

### ✅ Customer API (13 Modules - COMPLETED):
1. **Auth Module** - OTP/JWT, thin controller, fat service
2. **Config Module** - Database-driven, API-driven frontend
3. **Map Module** - Google Maps, GeocodeService, PlaceAutocompleteService
4. **Contact Module** - Contact form, email notifications
5. **Order Modification Module** - Cancel order, change delivery time
6. **Payment Module** - PhonePe integration, payment processing
7. **Store Module** - Store listing, search, details
8. **Product Module** - Product listing, search, details, categories
9. **Cart Module** - Add to cart, update quantity, remove, clear
10. **Order Module** - Create order, list orders, order details
11. **User Module** - Profile, addresses CRUD, notification preferences
12. **Coupon Module** - Coupon validation, apply coupon
13. **Registration Module** - Store registration, delivery partner registration
    - Uses framework Upload facade
    - DB-driven upload config
    - Multi-step registration with file uploads

### 🚧 Customer Web (STARTED):

**Status**: Base structure + config loading + home page DONE

**Completed**:
- [x] **Base Structure**: Vite + React + React Router + Redux Toolkit
- [x] **API-Driven Config**: AppConfigProvider + config-loader.js
  - Fetches from `/api/config/app-settings` on app load
  - Caches in localStorage (24hr expiry)
  - NO hardcoded env vars (apiUrl, mediaUrl, googleMapsKey from backend)
  - `useAppConfig()` hook for components
- [x] **Redux Store**: Auth + Cart slices with Redux Persist
- [x] **Layouts**: MainLayout (header + footer + nav)
- [x] **Home Page**: LandingPage.jsx (Hero, Features, CTA)
- [x] **Routing**: React Router with base routes
- [x] **Documentation**: README.md with API-driven config pattern

**Pending**:
- [ ] Shops page (list stores, filters, search)
- [ ] Store details page (products, info, reviews)
- [ ] Product details page (images, info, add to cart)
- [ ] Cart page (items, quantity, checkout)
- [ ] Checkout page (address, payment, place order)
- [ ] Orders page (order history, filters)
- [ ] Order details page (items, status, tracking)
- [ ] Profile page (edit profile, avatar upload)
- [ ] Addresses page (CRUD addresses, set default)
- [ ] Settings page (notification preferences)

**Architecture**:
```
neasto/apps/customer/web/
├── src/
│   ├── lib/
│   │   ├── config-loader.js      # Fetches from /api/config/app-settings
│   │   └── AppConfigProvider.jsx # React context + useAppConfig() hook
│   ├── redux-store/
│   │   ├── index.js              # Redux store with persist
│   │   └── slices/
│   │       ├── auth.slice.js     # User auth state
│   │       └── cart.slice.js     # Cart state
│   ├── layouts/
│   │   └── MainLayout.jsx        # Header + Footer
│   ├── pages/
│   │   └── outer/
│   │       └── LandingPage.jsx   # Home page ✅
│   ├── components/
│   │   └── common/
│   │       └── ScrollToTop.jsx   # Route change scroll
│   ├── App.jsx                   # Router + Routes
│   └── main.jsx                  # Entry (Provider + AppConfigProvider)
├── package.json
├── vite.config.js
├── .env.example                  # Only VITE_API_BASE_URL
└── README.md                     # API-driven config docs
```

**Key Pattern - API-Driven Config**:
```jsx
// ❌ OLD (neasto-js) - Hardcoded
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MEDIA_SERVER_URL = import.meta.env.VITE_MEDIA_SERVER_URL;
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// ✅ NEW (neasto) - API-driven
const { config } = useAppConfig();
const apiUrl = config.apiUrl;
const mediaUrl = config.mediaUrl;
const googleMapsKey = config.googleMapsKey;
```

**Benefits**:
- ✅ Change API keys without code deploy
- ✅ Feature flags controlled from backend
- ✅ A/B testing support (different configs per user)
- ✅ Graceful degradation (uses cached config if API fails)
- ✅ 24hr cache with background refresh

---

### 📋 Pending Modules:

**Backend (Future)**:
- Admin API (store management, orders, analytics)
- Business API (store owner dashboard)
- Delivery Partner API (accept orders, update status)

**Frontend (Future)**:
- Admin Web (store approval, analytics, support)
- Business Web (store dashboard, inventory, orders)
- Delivery Partner Web (order list, navigation, earnings)

---

## 📦 PACKAGE STRUCTURE COMPARISON

### neasto-js/packages Structure:
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

## 🎯 FEATURE MAPPING (neasto-js → vasuzex-v2)

### 1. STORAGE & UPLOAD SERVICES

#### neasto-js:
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

#### neasto-js:
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

## 📦 PACKAGE STRUCTURE COMPARISON

### neasto-js/packages Structure:
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

## 🎯 FEATURE MAPPING (neasto-js → vasuzex-v2)

### 1. STORAGE & UPLOAD SERVICES

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

#### neasto-js:
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

## 🎨 ADDITIONAL VASUZEX-V2 FEATURES (NOT IN neasto-JS)

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

| Feature | neasto-js | vasuzex-v2 | Status |
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

## 🚀 IMPLEMENTATION STRATEGY FOR neasto

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

1. **Vasuzex-v2 is MORE feature-rich** than neasto-js packages
2. **MediaManager = ThumbnailService + ThumbnailCache** (combined)
3. **All payment gateways available** (PhonePe, Razorpay, Stripe)
4. **All communication services available** (Email, SMS)
5. **Storage abstraction identical** (Local, S3)
6. **Additional enterprise features** (Queue, Cache, Broadcasting, Auth)

---

## ✅ CONCLUSION

**Vasuzex-v2 framework contains ALL features from neasto-js/packages PLUS MORE.**

The only "missing" feature is **StockService**, which is business-specific logic, not a framework feature.

**For Media Server**: Use `MediaManager` directly via `Media` facade - it already has everything ThumbnailService had and more!

---

**Last Updated**: December 9, 2025
**Project**: neasto (Vasuzex V2)

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
