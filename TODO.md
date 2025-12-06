# VASUZEX v2 - TODO LIST
> Comprehensive checklist of remaining tasks after recent generator fixes

**Last Updated:** Dec 7, 2024  
**Priority:** 🔴 Critical | 🟡 Important | 🟢 Nice to Have

---

## ✅ COMPLETED

### Generator Fixes
- ✅ Fixed @vasuzex/client imports in templates (was using wrong `vasuzex/client`)
- ✅ Fixed API response handling (`response.data.data` for actual payload)
- ✅ Fixed apiClient initialization (using `createApiClient` with proper config)
- ✅ Fixed logout to manually clear localStorage (no `.clearAuthToken()` method exists)
- ✅ Fixed import paths in generated code (relative paths, no `#models` aliases)
- ✅ Added explicit dependencies to generated apps (no hoisting reliance)
- ✅ Cleaned up unnecessary README files (removed scattered docs)
- ✅ Verified @vasuzex/client package imports work correctly

### Documentation Cleanup
- ✅ Deleted unnecessary READMEs from config/, tests/, examples/
- ✅ Deleted duplicate READMEs from framework/Services/*
- ✅ Centralized all docs in /docs/ directory
- ✅ Organized docs structure (getting-started, services, cli, core, frontend)

---

## 🔴 CRITICAL PRIORITY

### 1. **E2E Generator Testing**
- [ ] Generate fresh fullstack app from scratch
- [ ] Verify all files created correctly (controllers, models, routes, pages)
- [ ] Test dependencies install without errors
- [ ] Run generated API app and verify auth endpoints work
- [ ] Run generated Web app and verify React auth flow works
- [ ] Test login/register/logout flow end-to-end
- [ ] Verify JWT token persistence in localStorage
- [ ] Check protected routes work correctly

**Files to check:**
- `framework/Console/Commands/generate-app.js`
- `framework/Console/Commands/utils/apiStructure.js`
- `framework/Console/Commands/utils/webStructure.js`

### 2. **Vue & Svelte Template Verification**
- [ ] Check if Vue templates have same issues as React templates had
- [ ] Check if Svelte templates have same issues
- [ ] Verify Vue auth flow if it exists (or add TODO to implement)
- [ ] Verify Svelte auth flow if it exists (or add TODO to implement)

**Current Status:**
- Vue templates exist but NOT VERIFIED for @vasuzex/client usage
- Svelte templates exist but NOT VERIFIED for @vasuzex/client usage
- Only React templates were fixed and verified

**Files to check:**
- Lines 1076-1130 in `framework/Console/Commands/utils/templateGenerator.js` (Vue)
- Lines 1130+ in `framework/Console/Commands/utils/templateGenerator.js` (Svelte)

### 3. **Package Publishing Preparation**
- [ ] Verify package.json exports are correct for npm publish
- [ ] Test installation from npm (or local tarball simulation)
- [ ] Verify CLI bin commands work after npm install
- [ ] Check if all peer dependencies are listed
- [ ] Verify @vasuzex/client is properly built before publishing
- [ ] Test workspace linking vs npm install scenarios

**Files to check:**
- `package.json` (root - main vasuzex package)
- `frontend/client/package.json` (@vasuzex/client package)

---

## 🟡 IMPORTANT

### 4. **API Template Verification**
- [ ] Check all generated controllers use correct BaseController pattern
- [ ] Verify all middleware imports use relative paths (no aliases)
- [ ] Check AuthService uses correct model imports
- [ ] Verify database migrations are generated correctly
- [ ] Test seeder files work with GuruORM
- [ ] Check .env template has all required variables

**Files to check:**
- `framework/Console/Commands/utils/apiTemplates.js` (all template functions)

### 5. **Config & Database Centralization**
- [ ] Verify generated apps use /config from root (not app-level config)
- [ ] Verify generated apps use /database from root (models, migrations)
- [ ] Check if app.js template uses correct config imports
- [ ] Test that multiple apps can share same database
- [ ] Verify migrations run from root, not app directory

**Current Design:**
- Config: Centralized in `/config/` (project root)
- Database: Centralized in `/database/` (project root)
- Apps should NOT have their own config/ or database/

### 6. **Monorepo Scripts & Turbo**
- [ ] Verify turbo.json is configured correctly
- [ ] Check if dev:app-name scripts are generated in root package.json
- [ ] Test parallel running of multiple apps
- [ ] Verify build scripts work for all app types
- [ ] Check if turbo cache works correctly

**Files to check:**
- `turbo.json`
- `package.json` (scripts section)
- `framework/Console/Commands/utils/packageManager.js` (addRootScripts)

---

## 🟢 NICE TO HAVE

### 7. **Frontend Client Package**
- [ ] Add comprehensive JSDoc documentation to all exports
- [ ] Add usage examples for each utility
- [ ] Test tree-shaking works correctly
- [ ] Verify TypeScript types are exported properly
- [ ] Add more validators (PAN, GST, Vehicle Number, etc.)
- [ ] Add Indian-specific formatters (lakhs/crores)

**Files to check:**
- `frontend/client/` (entire package)
- `frontend/client/README.md` (examples & docs)

### 8. **Error Handling Improvements**
- [ ] Add better error messages in generators
- [ ] Validate app names (no spaces, special chars)
- [ ] Check for port conflicts
- [ ] Add rollback on failed generation
- [ ] Better error display (colored, formatted)

### 9. **Testing Infrastructure**
- [ ] Add tests for generator commands
- [ ] Test template generation functions
- [ ] Add integration tests for generated apps
- [ ] Test @vasuzex/client utilities
- [ ] Add E2E tests for auth flow

**Existing:**
- Unit tests in `/tests/unit/`
- E2E placeholder in `/tests/e2e/`
- Need to add generator-specific tests

### 10. **Documentation Updates**
- [ ] Update /docs/cli/commands.md with latest generate:app syntax
- [ ] Add @vasuzex/client usage guide to /docs/frontend/
- [ ] Document monorepo structure in /docs/getting-started/
- [ ] Add troubleshooting guide for common errors
- [ ] Create video walkthrough for generator

---

## 🔍 VERIFICATION CHECKLIST

### Before Publishing v2.0.0:

**Package Integrity:**
- [ ] `vasuzex` package builds successfully
- [ ] `@vasuzex/client` package builds successfully
- [ ] No console.log() in production code
- [ ] No TODO comments in critical code
- [ ] All imports resolve correctly

**Generator Quality:**
- [ ] Generated API apps run without errors
- [ ] Generated Web apps run without errors
- [ ] Auth flow works end-to-end
- [ ] Database migrations work
- [ ] Models work with GuruORM

**External User Experience:**
- [ ] `npm create vasuzex@latest myapp` works
- [ ] Generated apps work WITHOUT monorepo context
- [ ] Dependencies install correctly
- [ ] No missing peer dependencies errors
- [ ] CLI commands accessible via `npx vasuzex`

**Code Quality:**
- [ ] No import aliases in generated code
- [ ] No hardcoded paths
- [ ] Proper error handling everywhere
- [ ] Consistent code style
- [ ] No security vulnerabilities

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Generate test app:**
   ```bash
   cd /Users/rishi/Desktop/work/vasuzex-v2
   npx vasuzex generate:app testapp --type api --auth
   npx vasuzex generate:app testapp --type web --framework react
   ```

2. **Test generated apps:**
   ```bash
   cd apps/testapp/api
   pnpm install
   pnpm dev
   # Test auth endpoints with curl/Postman
   
   cd ../web
   pnpm install
   pnpm dev
   # Test login/register/logout flow
   ```

3. **Check for issues:**
   - File imports work?
   - API responds correctly?
   - Web app connects to API?
   - Token persistence works?
   - Protected routes work?

4. **Fix any bugs found**

5. **Update TODO with findings**

---

## 📝 NOTES

### Known Issues:
- Vue/Svelte templates NOT verified yet (only React was fixed)
- No E2E tests for generator yet
- Documentation needs updates after recent changes

### Design Decisions:
- Generated apps use explicit dependencies (no hoisting)
- Import paths are relative (no aliases like #models)
- @vasuzex/client is separate package on npm
- Config & database centralized at project root
- Each app type (api/web) in apps/{name}/{type}/

### Questions to Answer:
- Should Vue/Svelte have auth templates like React?
- Should we support Next.js generation?
- Do we need app-specific config overrides?
- How to handle database per app vs shared?

---

**Status:** In Progress  
**Focus:** E2E testing and Vue/Svelte template verification
