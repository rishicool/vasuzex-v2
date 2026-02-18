# vasuzex v2.3.0 Release Notes

## Laravel-Style Standalone Script Support

### Overview
Added standalone script support to Config and Log facades, following Laravel's best practices for graceful facade degradation. This enables vasuzex facades to work in **both** application contexts (with service container) and standalone scripts (without Application instance).

### Why This is v2.3.0 (MINOR), Not a Patch
This is a **new feature** that maintains backward compatibility:
- ✅ Existing apps continue to work exactly as before (no breaking changes)
- ✅ Adds new capability: facades now work in standalone scripts
- ✅ Follows Laravel patterns (service container first, graceful fallback)
- ✅ Production-ready implementation with proper error handling

Per semver: `MAJOR.MINOR.PATCH` - this is a MINOR version (new backward-compatible functionality).

---

## Changes Required

### 1. `/framework/Support/Facades/Config.js`

**Purpose**: Enable Config.get() in standalone scripts by loading .cjs config files from `config/` directory.

**Implementation**:
- Tries Application-bound config service first (normal app behavior)
- Falls back to direct config file loading if no Application
- Discovers project root by walking up directory tree
- Loads all .cjs files from `config/` directory using `require()`
- Supports dot notation (`database.connections.default.host`)
- Caches loaded config for performance

**File location**: `framework/Support/Facades/Config.js`

**Full file content**: See `/Users/rishi/Desktop/work/neasto/node_modules/.pnpm/vasuzex@2.2.4_@azure+core-client@1.10.1_@types+node@25.2.3_react-redux@9.2.0_@types+rea_6b288229c8b08a609ae395ef19989414/node_modules/vasuzex/framework/Support/Facades/Config.js`

---

### 2. `/framework/Support/Facades/Log.js`

**Purpose**: Enable Log.info/error/warn/debug in standalone scripts with console fallback.

**Implementation**:
- Tries Application-bound logger first (normal app behavior)
- Falls back to console.log with structured formatting
- ISO timestamps for production-quality logs
- Respects LOG_LEVEL environment variable (debug only shows if LOG_LEVEL=debug)
- All log levels supported: debug, info, warn, error

**File location**: `framework/Support/Facades/Log.js`

**Full file content**: See `/Users/rishi/Desktop/work/neasto/node_modules/.pnpm/vasuzex@2.2.4_@azure+core-client@1.10.1_@types+node@25.2.3_react-redux@9.2.0_@types+rea_6b288229c8b08a609ae395ef19989414/node_modules/vasuzex/framework/Support/Facades/Log.js`

---

## Testing Done

### Standalone Script Tests ✅
1. ✅ Config.get() - basic values (app.name, app.env)
2. ✅ Config.get() - nested dot notation (database.connections.default.host)
3. ✅ Config.get() - default values for missing keys
4. ✅ Log.info() - with structured data
5. ✅ Log.error() - with error data
6. ✅ Log.warn() - with warning data
7. ✅ Log.debug() - respects LOG_LEVEL

### Real-World Script Tests ✅
1. ✅ Elasticsearch setup scripts (setup-indices.js)
2. ✅ Elasticsearch client connection (ElasticsearchClient.js)
3. ✅ Dispatch test scripts (full-dispatch-test.cjs)
4. ✅ Database bootstrap scripts (work without Application)

### Backward Compatibility ✅
- Apps with Application instance continue using service container
- No changes required to existing application code
- Facades try App context first, fall back only if needed

---

## Laravel Pattern Compliance

### Config Facade Pattern:
- ✓ Loads from `config/` directory (like Laravel's config path)
- ✓ Supports dot notation (like Laravel's `config('database.default')`)
- ✓ Returns default if key not found
- ✓ Caches loaded config (like Laravel's config cache)

### Log Facade Pattern:
- ✓ Service container first (facade root)
- ✓ Graceful degradation to console
- ✓ Standard log levels (debug/info/warn/error)
- ✓ Respects environment settings

### Facade Pattern:
- ✓ Service container priority (tries Application first)
- ✓ Graceful fallback (standalone mode)
- ✓ No breaking changes (backward compatible)
- ✓ Production-ready error handling

---

## Publishing Instructions

### 1. Copy Changes to vasuzex Repo
Copy updated files from neasto's node_modules:
```bash
# Config.js
cp /Users/rishi/Desktop/work/neasto/node_modules/.pnpm/vasuzex@2.2.4_*/node_modules/vasuzex/framework/Support/Facades/Config.js \
   <vasuzex-repo>/framework/Support/Facades/Config.js

# Log.js
cp /Users/rishi/Desktop/work/neasto/node_modules/.pnpm/vasuzex@2.2.4_*/node_modules/vasuzex/framework/Support/Facades/Log.js \
   <vasuzex-repo>/framework/Support/Facades/Log.js
```

### 2. Update package.json
```json
{
  "version": "2.3.0"
}
```

### 3. Update CHANGELOG.md
```markdown
## [2.3.0] - 2026-02-18

### Added
- **Standalone Script Support**: Config and Log facades now work without Application instance
- Config facade loads .cjs files from config/ directory in standalone mode
- Log facade falls back to console.log with ISO timestamps in standalone mode
- Graceful degradation pattern: tries service container first, falls back if no Application

### Changed
- Config.js: Enhanced with standalone config loading (backward compatible)
- Log.js: Enhanced with console fallback logging (backward compatible)

### Technical
- Follows Laravel service container pattern with graceful fallback
- Production-ready error handling
- Zero breaking changes - all existing apps continue working unchanged
```

### 4. Git Workflow
```bash
git checkout -b feature/standalone-facade-support
git add framework/Support/Facades/Config.js
git add framework/Support/Facades/Log.js
git add package.json
git add CHANGELOG.md
git commit -m "feat: Add standalone script support to Config and Log facades (v2.3.0)

- Enable facades to work without Application instance
- Load config from files in standalone mode
- Fallback logging for standalone scripts
- Maintains backward compatibility
- Follows Laravel graceful degradation pattern"
git push origin feature/standalone-facade-support
```

### 5. Create PR & Merge
Review changes, merge to main

### 6. Publish to npm
```bash
npm version 2.3.0
npm publish
git push --tags
```

### 7. Update neasto
```bash
cd /Users/rishi/Desktop/work/neasto
pnpm update vasuzex
# Should install vasuzex@2.3.0
```

---

## Summary

This is a **proper Laravel-standard implementation**, not a quick patch:

✅ **Service container priority** - Uses Application-bound services when available  
✅ **Graceful degradation** - Falls back intelligently when no Application  
✅ **Production-ready** - Proper error handling, caching, performance  
✅ **Zero breaking changes** - All existing code continues working  
✅ **Laravel patterns** - Follows Laravel's facade and config patterns  

**Version: 2.3.0** (minor version - new backward-compatible feature)
