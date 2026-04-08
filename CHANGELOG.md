# Changelog

All notable changes to Vasuzex will be documented in this file.

## [2.3.14] - 2026-04-08

### 🐛 Fixed

#### DataTable — Content Loader (Skeleton) on Sort/Search/Filter (`vasuzex/react`)

**Root Causes & Fixes:**

1. **Browser Paint Timing Issue** — Skeleton loader not visible on sort/search (only on explicit refresh click)
   - **Root cause**: React 18 `createRoot` + fast localhost API responses (2-10ms) meant the skeleton commit and data response both arrived within the same vsync frame (~16ms), so the browser only painted the final data state
   - **Fix**: `useLayoutEffect` commits skeleton synchronously + `rAF → setTimeout(0)` defers XHR until AFTER browser paint
   - **Technical flow**: 
     1. `useLayoutEffect` → skeleton committed to DOM (synchronously, before paint)
     2. Passive effect queues `rAF` → scheduled pre-paint
     3. `rAF` queues `setTimeout(0)` → scheduled as macro-task (after paint)
     4. Browser **paints skeleton** ← now visible to user
     5. `setTimeout(0)` fires → `fetchData()` → XHR opens → response arrives after skeleton is on screen

2. **API Client Error Interceptor Stripping Cancel Errors** — "No data found" briefly appeared on every sort/search
   - **Root cause**: axios cancel errors have `err.code === 'ERR_CANCELED'` which DataTable checks — but error interceptor transformed ALL errors to plain `{ message, errors }` objects, stripping the code/name properties
   - **Impact**: Cancelled requests hit the error path → `setData([])` + `setLoading(false)` → "No data found" flash, then data arrived
   - **Fix**: Both api clients (`admin/web` and `business/web`) now check `if (axios.isCancel(error))` early and pass through untransformed

3. **Double-Fetch on Every Interaction** — Multiple concurrent requests on sort/search
   - **Root cause**: `refreshSignal` and `refreshKey` effects had `fetchData` in deps. `fetchData` recreates on every sort/search (because its own deps change). Since every admin page passes `refreshSignal={refreshKey}`, BOTH the main fetch effect AND the refreshSignal effect fired on every interaction → 2+ concurrent requests
   - **Fix**: Introduced `fetchDataRef` — holds always-current `fetchData` without needing it in secondary effect deps. Secondary effects now only fire when their actual trigger (`refreshSignal` value or `refreshKey` value) changes

4. **Tailwind CSS Classes Not Generated** — animate-pulse skeleton class missing from bundle
   - **Root cause**: Admin web's `tailwind.config.js` only scanned `./src/**/*`, not the symlinked `vasuzex-v2` directory
   - **Impact**: `animate-pulse` utility class not in admin web's CSS bundle (business web already had correct path)
   - **Fix**: Added `../../../vasuzex-v2/frontend/react-ui/**/*.{js,jsx}` to Tailwind content array (matching business web pattern)

**Files Modified:**
- [`DataTable.jsx`](frontend/react-ui/components/DataTable/DataTable.jsx) — useLayoutEffect + rAF+setTimeout pattern + fetchDataRef
- `apps/admin/web/src/lib/api-client.js` — axios.isCancel check before error transformation
- `apps/business/web/src/lib/apiClient.js` — axios.isCancel check before error transformation  
- `apps/admin/web/tailwind.config.js` — added vasuzex-v2 path to content array

**Result:** Skeleton loader now reliably shows on sort, search, filter, and every other data trigger, then data smoothly renders when ready. No "no data found" flash.

#### Model — Soft-Delete Restore Fix (`vasuzex/eloquent`)

- **Issue**: `restore()` method used `save()` which triggered model observers and allowed normal query scopes, causing inconsistent state
- **Fix**: Direct database update via `withTrashed()` query builder to bypass soft-delete scope
- **Changes**: 
  - Use `withTrashed().where(pk, id).update()` instead of `save()`
  - Auto-update `updated_at` timestamp when timestamps enabled
  - Calls `syncOriginal()` to update model cache state
  - Fires `restored` model event after DB update completes
- **Impact**: Soft-deleted records now restore cleanly without triggering update observers

#### MediaManager — WebP/AVIF Format Negotiation (`vasuzex/services`)

- **Issue**: Media serving didn't support modern image formats (WebP, AVIF) or client content-type negotiation
- **Enhancements**:
  1. **Format negotiation** — Query param `?format=webp|avif|jpeg|png` overrides client Accept header
  2. **LRU in-memory cache** — Hot thumbnails cached in memory (200 entry limit) to avoid repeated filesystem hits
  3. **Format-aware disk cache keys** — WebP and JPEG of same image cached separately
  4. **ETag support** — Content MD5 hash for conditional requests (304 Not Modified)
  5. **Immutable cache headers** — 1-year max-age via dedicated controller
  6. **Direct format lookup** — Cache lookup by format (no extension loop)
- **Performance**: 5-50x faster for repeated hot thumbnail requests
- **Files Modified**: [`framework/Services/Media/MediaManager.js`](framework/Services/Media/MediaManager.js)

### ✨ Added

#### ActionDefaults — Hard Delete & Restore Actions (`vasuzex/react`)

- **Hard Delete Action** — Permanent delete with severe confirmation (Flame icon 🔥)
  - Shows in trash-only mode for trashed records
  - `DELETE ?hardDelete=true` query parameter
  - `createHardDeleteClickHandler()` helper
  - "Cannot be undone" warning in confirmation dialog
  
- **Restore Action** — Restore soft-deleted records (RotateCcw icon)
  - Shows for trashed rows
  - `PATCH {restoreUrl}` request
  - `createRestoreClickHandler()` helper
  - Smooth restore with toast notification
  
- **Custom Action Tooltip** — Auto-generate tooltip from label when title not provided
  - Improves UX for custom actions without explicit title
  
**Files Modified:** [`frontend/react-ui/components/DataTable/ActionDefaults.jsx`](frontend/react-ui/components/DataTable/ActionDefaults.jsx)

**Impact:** Complete soft-delete/trash workflow now supported in DataTable — view, restore, or permanently delete with proper confirmations.


## [2.3.13] - 2026-04-05

### 🐛 Fixed

#### DataTable — Debounce + In-Flight Request Cancellation (`vasuzex/react`)

- **Debounced column search** — Column search input now waits 400 ms after the user stops typing before sending a request to the server. Previously, a request was fired on every keypress, causing API flooding for fast typists. ([`DataTable.jsx`](frontend/react-ui/components/DataTable/DataTable.jsx))

- **AbortController on in-flight requests** — If the user starts typing again while a previous search request is still in flight, that request is now automatically aborted before the new debounce window starts. This prevents stale responses from arriving out-of-order and updating the table with old data.

- **Unmount cleanup** — Any pending request is aborted when the DataTable component unmounts, preventing setState calls on unmounted components.

**Technical details:**
- Added `debouncedColumnSearch` state (derived from `columnSearch` with 400 ms debounce)
- Added `columnSearchDebounceRef` (`useRef`) — timer handle for the debounce
- Added `abortControllerRef` (`useRef`) — holds the `AbortController` for the current fetch
- `fetchData` useCallback now: aborts previous controller → creates new `AbortController` → passes `signal` to `api.get()` → catches `AbortError`/`ERR_CANCELED` silently
- Reset-page effect (`useEffect`) updated to depend on `debouncedColumnSearch` instead of `columnSearch`

### 📝 Changed

#### README — Complete Rewrite
- Removed outdated alpha/V2 migration content
- Rebuilt from the live documentation at **https://vasuzex.xdeve.com/guide/**
- Covers: requirements, quick start, project structure, architecture, HTTP layer, Eloquent models, React UI, CLI reference, environment config, and full documentation index
- Proper badges (npm version, downloads, license, Node.js, pnpm)

---

## [2.3.0] - 2026-02-18

### 🚀 Standalone Script Support

This release enables Config and Log facades to work in standalone scripts without Application instance, following Laravel's graceful degradation pattern.

### ✨ Added

#### Config Facade Standalone Mode
- **Standalone script support** - Config.get() now works without Application instance
- **Auto-discovery** - Walks up directory tree to find project root with `config/` directory
- **Config loading** - Loads all .cjs files from `config/` directory using require()
- **Dot notation** - Full support for nested keys (`database.connections.default.host`)
- **Caching** - Loaded config cached for performance
- **Graceful fallback** - Tries Application-bound service first, falls back if unavailable
  ```javascript
  // Now works in standalone scripts!
  import { Config } from 'vasuzex';
  const dbHost = Config.get('database.connections.default.host', 'localhost');
  ```

#### Log Facade Standalone Mode
- **Standalone script support** - Log methods now work without Application instance
- **Console fallback** - Falls back to console.log with structured formatting
- **ISO timestamps** - Production-quality log output: `[2026-02-18T05:21:16.107Z] [INFO] message`
- **Respects LOG_LEVEL** - Debug logs only show if `LOG_LEVEL=debug` or `DEBUG=true`
- **All log levels** - debug(), info(), warn(), error() all supported
- **Graceful fallback** - Tries Application-bound logger first, falls back if unavailable
  ```javascript
  // Now works in standalone scripts!
  import { Log } from 'vasuzex';
  Log.info('Processing data', { records: 100 });
  // Output: [2026-02-18T05:21:16.107Z] [INFO] Processing data {"records":100}
  ```

### 🔧 Technical Details

- **Service container priority** - Always tries Application instance first (backward compatible)
- **Zero breaking changes** - All existing apps continue working unchanged
- **Laravel pattern** - Follows Laravel's facade graceful degradation pattern
- **Production-ready** - Proper error handling, silent failures, performance optimized

### 🎯 Use Cases

This enables:
- ✅ Database migration scripts using Config.get()
- ✅ Cron jobs and workers using Log.info()
- ✅ CLI tools without full Application bootstrap
- ✅ Test scripts accessing configuration
- ✅ Utility scripts with proper logging

## [2.2.0] - 2026-02-06

### 🚀 Major Pro-Level Enhancements

This release brings vasuzex to Laravel-level flexibility and power with critical bug fixes and industry-standard features.

### ✨ Added

#### Environment-Specific Configuration Files
- **Multi-environment .env support** - Load environment-specific configuration files
  - `.env` - Base configuration (committed as example)
  - `.env.local` - Local overrides (gitignored)
  - `.env.development` - Development environment
  - `.env.production` - Production environment  
  - `.env.test` - Test environment
  - `.env.{environment}.local` - Environment + local overrides
- **Load cascade** - Later files override earlier (same as Next.js, Vite, Laravel)
- **Quote parsing** - Properly handles quoted values in .env files
  ```bash
  APP_NAME="My App"  # Correctly parsed without quotes
  ```

#### Deep Configuration Merge
- **Fixed critical bug** - Database configs now properly merge with nested structures
- **`Arr.undot()`** - Transform flat keys to nested objects
  ```javascript
  { 'mail.mailers.mailjet.api_key': 'xxx' }
  // Becomes:
  { mail: { mailers: { mailjet: { api_key: 'xxx' } } } }
  ```
- **`Arr.dot()`** - Flatten nested objects to dot notation
- **`Arr.deepMerge()`** - Deep merge objects preserving nested properties
- **Enhanced `Arr.set()`** - Now preserves existing nested properties during set operations

#### Runtime Configuration Management
- **`Config.reloadFromDatabase(app)`** - Reload database configs without restart
- **`Config.getNested(prefix)`** - Get all configs under a prefix as nested object
- **`Mail.clearCache(mailerName)`** - Clear cached mail transports
- **`Mail.reload(mailerName)`** - Reload mail transport with fresh config
- **`Mail.getCacheInfo()`** - Get transport cache statistics

### 🐛 Fixed

#### DatabaseConfigService Deep Merge Bug (CRITICAL)
- **Issue**: Database configs with nested keys (e.g., `mail.mailers.mailjet.api_key`) were not properly loaded
- **Root Cause**: Flat keys from database weren't transformed to nested structure before merging into ConfigRepository
- **Impact**: Made database-driven configuration unusable for nested configs (mail, database, payment gateways, etc.)
- **Solution**: Added `#transformFlatKeysToNested()` method that uses `Arr.undot()` to properly structure configs
- **Result**: Database configs now work exactly like Laravel - can override any nested config value

#### ConfigLoader Environment Loading
- **Issue**: Only loaded `.env` file, no environment-specific support
- **Solution**: Now loads multiple .env files in correct cascade order
- **Benefit**: Matches industry standards (Next.js, Vite, Create React App)

#### Arr.set() Object Overwriting
- **Issue**: Setting nested values would overwrite existing nested objects
- **Example Problem**:
  ```javascript
  const obj = { mail: { from: { name: 'App', address: 'app@test.com' } } };
  Arr.set(obj, 'mail.from.reply', 'reply@test.com');
  // Lost name and address properties
  ```
- **Solution**: Added deep merge logic to preserve existing nested properties

#### .env Quote Parsing
- **Issue**: Quoted values included the quotes
  ```bash
  APP_NAME="My App"  # Resulted in: "My App" (with quotes)
  ```
- **Solution**: Strip surrounding quotes properly

### 🔄 Changed

#### ConfigLoader Behavior
- **Before**: Only loaded `.env`, failed silently if missing
- **After**: Loads multiple environment files in cascade, reports how many loaded
- **Breaking**: None - fully backward compatible

#### MailManager Caching
- **Before**: No way to clear cached transports (required app restart)
- **After**: Can clear cache and reload with `clearCache()` and `reload()`
- **Breaking**: None - additive changes only

### 📝 Documentation

#### New Examples
```javascript
// Environment-specific .env files
// .env.development
MAIL_DRIVER=log
DB_HOST=localhost

// .env.production  
MAIL_DRIVER=mailjet
DB_HOST=production-db.example.com

// Runtime config reload
await Config.reloadFromDatabase(app);
Mail.clearCache('mailjet');

// Database-driven mail config (now works!)
await DatabaseConfigService.set('mail.mailers.mailjet.api_key', 'xxx', {
  scope: 'api',
  environment: 'production'
});

// Clear cache and use new config
Mail.clearCache('mailjet');
await Mail.send({ to: 'user@example.com', subject: 'Test' });
```

### ⚠️ Migration Guide

#### From v2.1.x to v2.2.0

**No breaking changes!** All enhancements are backward-compatible.

**Optional Enhancements**:

1. **Split .env by environment**:
```bash
# Create environment-specific files
cp .env .env.development
cp .env .env.production

# Update .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

2. **Move sensitive configs to database**:
```javascript
// Instead of .env:
MAILJET_API_KEY=xxx

// Use database (now works with nested keys!):
await Config.setInDatabase('mail.mailers.mailjet.api_key', 'xxx');
```

3. **Enable runtime config changes**:
```javascript
// In admin panel when user updates mail settings:
await DatabaseConfigService.set('mail.mailers.mailjet.api_key', newKey);
await Config.reloadFromDatabase(app);
Mail.clearCache('mailjet');
```

### 🎯 Laravel Feature Parity

| Feature | Laravel | Vasuzex 2.1.x | Vasuzex 2.2.0 |
|---------|---------|---------------|---------------|
| Environment-specific .env | ✅ | ❌ | ✅ |
| Database-driven config | ✅ | ⚠️ Buggy | ✅ |
| Runtime config override | ✅ | ✅ | ✅ |
| Deep config merge | ✅ | ❌ | ✅ |
| Config caching | ✅ | ⚠️ Partial | ✅ |
| Nested config access | ✅ | ✅ | ✅ |
| .env quote parsing | ✅ | ❌ | ✅ |

### 🔍 Testing

- ✅ Unit tests for `Arr.undot()`, `Arr.dot()`, `Arr.deepMerge()`
- ✅ Integration tests for DatabaseConfigService nested configs
- ✅ Environment cascade loading tests
- ✅ Runtime config reload tests
- ✅ Mail transport cache clearing tests
- ✅ Backward compatibility tests

### 📦 Dependencies

No new dependencies added. All enhancements use existing framework code.

### 🙏 Credits

Inspired by:
- Laravel's configuration system
- Next.js environment file handling
- dotenv-flow cascade loading
- Community feedback on configuration flexibility

---

## [2.1.35] - 2026-02-06

### Fixed
- MailManager async/await issues with transport creation
- Added nodemailer and node-mailjet dependencies
- Mailjet transport integration

## [2.1.34] - 2026-02-06

### Added
- Debug logging for config loading

## [2.1.32] - 2026-02-06

### Added  
- Mailjet transport support in MailManager

## [2.1.31] - 2026-02-06

### Added
- nodemailer and nodemailer-sendgrid dependencies

## [2.1.30] - 2026-02-06

### Fixed
- MailManager mailer() and resolve() now properly async/await

---

## Previous Versions

See git history for versions before 2.1.30.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2025-12-08

### Added
- **OtpHelper**: Added `getOTPExpiry(expiresInSeconds)` helper function
  - Simple Laravel-style helper to get OTP expiry timestamp
  - Default expiry: 600 seconds (10 minutes)
  - Returns Date object for database storage
- **OtpHelper**: Enhanced `isOTPExpired(expiryTimestamp)` to accept both timestamps and record objects
  - Maintains backward compatibility with existing `isOTPExpired(record)` usage
  - Now accepts direct Date/string timestamps for simpler usage
  - Handles null/undefined gracefully (returns true)

### Changed
- OtpHelper now provides more flexible API for common OTP operations

## [1.0.11] - 2025-12-04

### Fixed
- **CRITICAL**: Fixed `.js.js` double extension bug in database model imports
  - Changed `vasuzex/Database/Relations.js` to `vasuzex/Database/Relations`
  - Fixed in Post.js and Comment.js source models
  - Resolves "Cannot find module Relations.js.js" error on fresh installations
  - Root cause: package.json exports already adds `.js`, so imports shouldn't include it

## [1.0.10] - 2025-12-04

### Fixed
- **CRITICAL**: Fixed database model import paths in PostController and CommentController
  - Changed from `../../../database/models/` (3 levels) to `../../../../../database/models/` (5 levels)
  - Fixes "Cannot find module Post.js" error when starting API server

## [1.0.9] - 2025-12-04

### Fixed
- **CRITICAL**: Added missing API dependencies (`bcryptjs`, `jsonwebtoken`, `joi`) to package.json template
  - API apps now include all required authentication and validation dependencies
  - Fixes "Cannot find package 'bcryptjs'" error on fresh installations

## [1.0.8] - 2025-12-04

### Fixed
- **CRITICAL**: Fixed Vite index.html location - moved from `public/index.html` to root `index.html`
- React/Vue/Svelte apps now properly serve on browser (404 issue resolved)

### Added
- Full Blog CRUD functionality with proper backend integration
- PostController with create, read, update, delete operations
- Post model with validation
- Blog routes with authentication middleware
- Comment functionality for posts
- Proper error handling and validation

## [1.0.7] - 2025-12-04

### Fixed
- Fixed root package.json scripts to use `turbo run dev` instead of `pnpm --parallel --stream dev`
- Added `start` script to root package.json
- Fixed detectVasuzexDependency to never return `workspace:*` for fresh installs
- Apps now correctly use the same vasuzex version as root package.json
- Removed workspace:* dependency that was breaking fresh project installs

## [1.0.6] - 2025-12-04

### Fixed
- Media server now generates for Full Stack template (API + Web + Media Server)
- Previously media server was only generated for API + Media template

## [1.0.5] - 2025-12-04

### Fixed
- **CRITICAL**: Fixed double `.js` extension bug in database model imports
  - Changed: `import Model from 'vasuzex/Database/Model.js'` → `import Model from 'vasuzex/Database/Model'`
  - Changed: `import { Hash } from 'vasuzex/Support/Facades/index.js'` → `import { Hash } from 'vasuzex/Support/Facades'`
  - This was causing `Model.js.js` resolution errors in fresh projects
  - Affected files: User.js, Post.js, Comment.js, Task.js

## [1.0.4] - 2025-12-04

### Added
- **Web Framework Scaffolding**: Full support for React, Vue, Svelte with Vite
  - Interactive framework selection during `generate:app --type web`
  - Auto-configured Vite setup for each framework
  - Complete starter templates with working counter examples
  - `--framework` flag for direct framework selection
- **Health Route**: Added `/health` endpoint to all generated API apps
- **Media Facade**: Exported `Media` facade from main framework entry point
- **Port Conflict Warnings**: Added warnings in .env and console when generating multiple apps

### Fixed
- **Critical Template Bug**: Fixed `this.app.get()` → `this.express.get()` in generated apps
- **BaseServer/BaseApp API**: Complete redesign to match template expectations
  - BaseServer now accepts options object: `{appName, projectRoot, port}`
  - BaseApp enhanced with `build()`, `registerRoute()`, `setupRoutes()` methods
- **Import Paths**: Fixed all centralized database imports (5 levels up from src/)
- **Turbo Dependency**: Added `turbo@^2.6.1` to root devDependencies in project generator
- **Auto-Install**: Fixed `pnpm install` to run automatically after app generation
- **NPX Commands**: Changed from `npx vasuzex` to `pnpm vasuzex` in create-vasuzex for reliability
- **pnpm Compatibility**: Upgraded from pnpm@8.0.0 to pnpm@10.0.0 for Node v25 support

### Changed
- **Production Status**: Framework now production-ready (95% complete)
- **Root Dev Command**: `pnpm dev` now runs all apps in parallel using turbo
- **Package Manager**: Updated packageManager field to pnpm@10.0.0

### Dependencies
- Added: `joi@^17.13.3`, `bcryptjs@^2.4.3`, `jsonwebtoken@^9.0.2`
- Updated: `pnpm@10.0.0`, `turbo@^2.6.1`

## [1.0.3] - 2025-12-03

### Added
- Initial stable release
- Modularized generator utilities (12 utility files)
- Comprehensive API scaffolding
- Media server generation
- Database migrations and seeders
- Eloquent ORM integration

### Changed
- Refactored monolithic generator files into modular structure
- Improved code organization and maintainability

## [1.0.2] - 2025-12-01

### Fixed
- Minor bug fixes
- Documentation improvements

## [1.0.1] - 2025-11-30

### Fixed
- Package export issues
- CLI command registration

## [1.0.0] - 2025-11-29

### Added
- Initial release
- Laravel-inspired architecture
- GuruORM integration
- Facade pattern
- Service Container
- Database migrations
- Authentication scaffolding
- Media server
- Zero-configuration setup

---

[1.0.4]: https://github.com/rishicool/vasuzex/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/rishicool/vasuzex/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/rishicool/vasuzex/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/rishicool/vasuzex/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/rishicool/vasuzex/releases/tag/v1.0.0
