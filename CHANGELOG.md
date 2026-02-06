# Changelog

All notable changes to Vasuzex will be documented in this file.
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
