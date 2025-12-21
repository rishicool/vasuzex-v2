# Import Aliases Guide

Clean, Laravel-style import aliases for the Vasuzex framework.

## 🎯 Two Different Contexts

### Framework Development (Internal)
If you're working **inside the framework/** directory:
- Use `#framework/*` for framework imports
- Use `#models/*` for models
- Use `#database` for database
- Use `#config` for config

### Application Development (Users)
If you're building an **app using Vasuzex** (after npm install):
- Use `vasuzex` for framework imports
- Use `#models/*` for your models
- Use `#database` for database
- Use `#config` for config

## Available Aliases

| Alias | Path | Who Uses It |
|-------|------|-------------|
| `#framework` | `./framework/index.js` | Framework developers (internal code) |
| `#framework/*` | `./framework/*` | Framework developers (internal code) |
| `vasuzex` | `vasuzex` package | App developers (after npm install) |
| `vasuzex/*` | `vasuzex/*` package | App developers (after npm install) |
| `#database` | `./database/index.js` | Both (local project database) |
| `#models` | `./database/models/index.js` | Both (local project models) |
| `#models/*` | `./database/models/*` | Both (individual model files) |
| `#config` | `./config/index.cjs` | Both (local project config) |

## When to Use Which Alias

### ⚙️ Framework Internal Code (YOU are developing Vasuzex):
```javascript
// Use #framework for internal framework files
import { CacheManager } from '#framework/Services/Cache/CacheManager.js';
import { ServiceProvider } from '#framework/Foundation/ServiceProvider.js';
import { RateLimiter } from '#framework/Support/RateLimiter.js';
```

### 👨‍💻 Application Code (USERS building apps with Vasuzex):
```javascript
// Use vasuzex after npm install
import { DB, Cache, Auth } from 'vasuzex';
import { Application } from 'vasuzex/Foundation/Application';
import Model from 'vasuzex/Database/Model';
```

### 📦 Models (Both contexts):
```javascript
// Always use #models for your project's models
import { User, Post, Comment } from '#models';
import { User } from '#models/User.js';
```

### 🗄️ Database (Both contexts):
```javascript
// Always use #database for database utilities
import db from '#database';
```

### ⚙️ Config (Both contexts):
```javascript
// Always use #config for configuration
import config from '#config';
```

## Configuration Files

### package.json
Node.js native import maps (requires Node 18+):

```json
{
  "name": "vasuzex",
  "exports": {
    ".": "./framework/index.js",
    "./Foundation/*": "./framework/Foundation/*.js",
    "./Database/*": "./framework/Database/*.js",
    "./Support/*": "./framework/Support/*.js",
    "./Services/*": "./framework/Services/*/index.js"
  },
  "imports": {
    "#framework": "./framework/index.js",
    "#framework/*": "./framework/*",
    "#database": "./database/index.js",
    "#models": "./database/models/index.js",
    "#models/*": "./database/models/*",
    "#config": "./config/index.cjs"
  }
}
```

**Important:**
- `"exports"` → Makes `vasuzex/*` available to users after npm install
- `"imports"` → Makes `#framework/*`, `#models/*` work locally during development

### jsconfig.json
Provides IDE autocomplete and path resolution:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "vasuzex": ["./framework/index.js"],
      "vasuzex/*": ["./framework/*"],
      "#framework": ["./framework/index.js"],
      "#framework/*": ["./framework/*"],
      "#database": ["./database/index.js"],
      "#models": ["./database/models/index.js"],
      "#models/*": ["./database/models/*"],
      "#config": ["./config/index.cjs"]
    }
  }
}
```

### jest.config.js
For testing with Jest:

```javascript
export default {
  moduleNameMapper: {
    '^vasuzex$': '<rootDir>/framework/index.js',
    '^vasuzex/(.*)$': '<rootDir>/framework/$1',
    '^#framework$': '<rootDir>/framework/index.js',
    '^#framework/(.*)$': '<rootDir>/framework/$1',
    '^#models$': '<rootDir>/database/models/index.js',
    '^#models/(.*)$': '<rootDir>/database/models/$1',
    '^#database$': '<rootDir>/database/index.js',
    '^#config$': '<rootDir>/config/index.cjs'
  }
};
```

## Usage Examples

### Framework Internal Code

```javascript
/**
 * Example: CacheServiceProvider.js (inside framework/)
 */
import { CacheManager } from '#framework/Services/Cache/CacheManager.js';
import { ServiceProvider } from '#framework/Foundation/ServiceProvider.js';

export class CacheServiceProvider extends ServiceProvider {
  async register() {
    this.app.singleton('cache', () => new CacheManager(this.app));
  }
}
```

```javascript
/**
 * Example: API Template Generator (inside framework/)
 */
import { User, Post, Comment } from '#models';

export class PostController {
  async index() {
    const posts = await Post.with('comments').get();
    return posts.map(p => p.toArray());
  }
}
```

### User Application Code

```javascript
/**
 * Example: app.js (user's application after npm install vasuzex)
 */
import { Application, DB, Cache, Auth } from 'vasuzex';
import Model from 'vasuzex/Database/Model';
import { User, Post } from '#models';  // User's models

const app = new Application(process.cwd());

// Use facades
app.get('/posts', async (req, res) => {
  const posts = await Cache.remember('posts', 3600, async () => {
    return await Post.where('published', true).get();
  });
  
  res.json({ data: posts });
});
```
import Model from 'vasuzex/Database/Model';

// Relations
import { Relations } from 'vasuzex/Database/Relations';
```

### Import Configuration

```javascript
// Config service
import { Config } from 'vasuzex';

// Or direct import
import config from '#config';
```

### Import Service Providers

```javascript
import { 
  ConfigServiceProvider,
  LogServiceProvider,
  CacheServiceProvider 
} from 'vasuzex';

// Or specific provider
import { AuthServiceProvider } from 'vasuzex/Foundation/Providers/AuthServiceProvider';
```

## Complete Application Example

```javascript
/**
 * Blog API with Aliases
 */

// Import framework with facades
import { 
  Application,
  DB,
  Cache,
  Auth,
  Hash,
  Log,
  Config
} from 'vasuzex';

// Import models
import { Post, User, Comment } from '#models';

// Import providers
import { 
  ConfigServiceProvider,
  LogServiceProvider,
  CacheServiceProvider,
  AuthServiceProvider,
  DatabaseServiceProvider
} from 'vasuzex';

// Create app
const app = new Application(process.cwd());

// Register providers
app.register(ConfigServiceProvider);
app.register(LogServiceProvider);
app.register(CacheServiceProvider);
app.register(AuthServiceProvider);
app.register(DatabaseServiceProvider);

// Bootstrap
await app.boot();

// Use facades
const express = app.getExpressApp();

express.get('/posts', async (req, res) => {
  const posts = await Cache.remember('posts', 3600, async () => {
    return await Post.where('status', 'published').get();
  });
  
  res.json({ data: posts.map(p => p.toArray()) });
});

express.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (await Auth.attempt({ email, password })) {
    const user = Auth.user();
    Log.info('User logged in', { user_id: user.id });
    res.json({ user: user.toArray() });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const PORT = Config.get('app.port', 3000);
express.listen(PORT, () => {
  Log.info(`App started on port ${PORT}`);
});
```

## Model Example with Aliases

```javascript
/**
 * database/models/Post.js
 */

import Model from 'vasuzex/Database/Model';
import { Relations } from 'vasuzex/Database/Relations';
import { Comment } from '#models/Comment.js';

export class Post extends Model {
  static tableName = 'posts';
  static fillable = ['title', 'content', 'author'];
  
  comments() {
    return Relations.hasMany(this, Comment, 'post_id', 'id');
  }
}
```

## Migration from Old Imports

### Before (Relative Paths)
```javascript
import { Application } from '../../framework/Foundation/Application.js';
import Model from '../../framework/Database/Model.js';
import { Post } from './Post.js';
import { Hash } from '../../framework/Hashing/Hash.js';
```

### After (Aliases)
```javascript
import { Application, Model, Hash } from 'vasuzex';
import { Post } from '#models';
```

## Benefits

1. **Clean Imports**: No more `../../../../../../`
2. **Refactor-Safe**: Move files without breaking imports
3. **Laravel-like**: Familiar namespace pattern
4. **IDE Support**: Full autocomplete with jsconfig.json
5. **Consistent**: Same import style across entire project

## Comparison with Laravel

Laravel:
```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Post;
```

neasto:
```javascript
import { DB, Cache } from 'vasuzex';
import { Post } from '#models';
```

## Common Mistakes to Avoid

### ❌ DON'T: Use ugly relative paths
```javascript
// BAD - Hard to maintain, breaks when you move files
import { User } from '../../../../../database/models/User.js';
import { CacheManager } from '../../Services/Cache/CacheManager.js';
```

### ✅ DO: Use appropriate aliases
```javascript
// GOOD - Framework internal code
import { User } from '#models/User.js';
import { CacheManager } from '#framework/Services/Cache/CacheManager.js';

// GOOD - User application code (after npm install vasuzex)
import { DB, Cache } from 'vasuzex';
import { User } from '#models/User.js';
```

### ❌ DON'T: Mix conventions or use wrong alias
```javascript
// BAD - Using vasuzex in framework internal files (won't work locally!)
import { CacheManager } from 'vasuzex/Services/Cache/CacheManager';

// BAD - Using #framework in user apps (won't work after npm install!)
import { DB } from '#framework';
```

### ✅ DO: Use correct alias for your context
```javascript
// GOOD - Framework internal (you're developing Vasuzex itself)
import { CacheManager } from '#framework/Services/Cache/CacheManager.js';

// GOOD - User app (you installed vasuzex from npm)
import { DB, Cache } from 'vasuzex';
```

## Quick Reference

| Context | Framework Files | Models | Database | Config |
|---------|----------------|--------|----------|--------|
| **Framework Dev** | `#framework/*` | `#models/*` | `#database` | `#config` |
| **User App** | `vasuzex/*` | `#models/*` | `#database` | `#config` |

## Why Two Different Aliases?

**The Problem:**
- Node.js `"imports"` field only works for **local subpath imports** (starts with `#`)
- It does NOT allow a package to import itself by name during development
- `vasuzex/*` only works **after** the package is published to npm

**The Solution:**
- Framework internal code uses `#framework/*` (works locally via "imports")
- User code uses `vasuzex/*` (works after npm install via "exports")
- Models/Database/Config use `#*` (always local to project)

## Notes

- **Always include `.js` extension** when using `#framework/*` or `#models/*` imports
- `#` prefix = Node.js subpath imports convention (works locally)
- `vasuzex` = Package name (works after npm install)
- IDE autocomplete works for both via jsconfig.json
- Jest tests work for both via jest.config.js moduleNameMapper
- No build step required - native Node.js features (18+)
