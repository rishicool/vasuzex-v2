# Changelog

All notable changes to Vasuzex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
