# Bootstrap Process

> **Laravel-inspired application bootstrapping**

Vasuzex follows Laravel's bootstrap pattern to initialize the application before handling requests.

## Overview

```
BaseServer.start()
  ↓
  initializeServices() [custom]
  ↓
  createApp() [returns BaseApp]
  ↓
  app.bootstrap() [Laravel-style]
  ↓
  Load Environment & Configuration
  ↓
  app.build() [setup middleware & routes]
  ↓
  express.listen()
```

## Bootstrap Classes

Located in `framework/Foundation/Bootstrap/`:

### 1. LoadEnvironmentVariables
Loads `.env` file into `process.env`

### 2. LoadConfiguration  
Loads all `/config/*.cjs` files into ConfigRepository

## Usage

### Automatic (Recommended)

BaseServer automatically bootstraps the application:

```javascript
import { BaseServer } from 'vasuzex';

class MyServer extends BaseServer {
  async createApp() {
    const { createApp } = await import('./app.js');
    return createApp(); // Returns BaseApp instance
  }
}

const server = new MyServer({
  appName: 'my-api',
  projectRoot: '/path/to/project'
});

await server.start();
// ✅ Bootstrap runs automatically before listen()
```

### Manual (Advanced)

For custom scenarios:

```javascript
import { BaseApp } from 'vasuzex';

const app = new BaseApp({
  rootDir: '/path/to/project'
});

// Bootstrap manually
await app.bootstrap();

// Then build
const express = app.build();
```

## Bootstrap Order

**Exactly like Laravel:**

1. **LoadEnvironmentVariables**
   - Reads `.env` file
   - Populates `process.env`

2. **LoadConfiguration**
   - Scans `/config` directory
   - Loads all `.cjs` files
   - Registers ConfigRepository in container

3. **Application Ready**
   - Config available via `app.config('database')`
   - Facades can access services
   - Middleware can use configuration

## Configuration Access

After bootstrap:

```javascript
// In BaseApp or any container-aware class
const dbConfig = this.config('database');
const appName = this.config('app.name');

// Using Facade (after bootstrap)
import { Config } from 'vasuzex';
const mailDriver = Config.get('mail.default');
```

## Test Environment

Tests can skip bootstrap:

```javascript
// In tests - app without config
const app = new BaseApp();
app.build(); // Works without bootstrap
// Config access gracefully fails
```

## Comparison with Laravel

| Laravel | Vasuzex |
|---------|---------|
| `Kernel::$bootstrappers` | `Application.bootstrap()` |
| `LoadEnvironmentVariables` | ✅ Same |
| `LoadConfiguration` | ✅ Same |
| Called in `Kernel::handle()` | Called in `BaseServer.start()` |
| Runs before middleware | ✅ Same |

## When Bootstrap Runs

✅ **Automatic:**
- `BaseServer.start()` - Production servers
- Before `express.listen()`

❌ **Not automatic:**
- Tests (unless explicitly called)
- Standalone `new BaseApp()` (call `bootstrap()` manually)

## Config Files Expected

All files in `/config/` directory:

```
config/
├── app.cjs           # Application settings
├── database.cjs      # Database connections
├── cache.cjs         # Cache drivers
├── mail.cjs          # Email configuration
├── security.cjs      # Security middleware
└── ...               # 26 total config files
```

These are **automatically copied** by `create-vasuzex` installer.

## Best Practices

1. **Always use BaseServer** - Handles bootstrap automatically
2. **Keep config in /config/** - Don't hardcode settings
3. **Use env() in config** - `env('DB_HOST', 'localhost')`
4. **Access via config()** - Don't read `process.env` directly

## Example: Full Setup

```javascript
// apps/my-app/api/src/index.js
import { BaseServer } from 'vasuzex';

class ApiServer extends BaseServer {
  async createApp() {
    const { createApp } = await import('./app.js');
    return createApp();
  }
}

const server = new ApiServer({
  appName: 'my-api',
  projectRoot: '/path/to/project'
});

await server.start();
```

```javascript
// apps/my-app/api/src/app.js
import { BaseApp } from 'vasuzex';

export function createApp() {
  const app = new BaseApp();
  
  // Override methods
  app.setupRoutes = function() {
    this.registerRoute('/api', myRoutes);
  };
  
  return app.build();
}
```

**Result:**
1. BaseServer creates app
2. Automatically calls `app.bootstrap()` 
3. Loads environment & config
4. Calls `app.build()` to setup Express
5. Starts listening on port

## Migration from Non-Bootstrap Code

If you have old code without bootstrap:

**Before:**
```javascript
const app = new BaseApp();
const express = app.build();
// ❌ Config not loaded
```

**After:**
```javascript
const app = new BaseApp({ rootDir: projectRoot });
await app.bootstrap(); // ✅ Load config first
const express = app.build();
```

Or better - use BaseServer:

```javascript
class MyServer extends BaseServer {
  async createApp() {
    const app = new BaseApp();
    return app.build();
  }
}
await new MyServer().start(); // ✅ Bootstrap automatic
```
