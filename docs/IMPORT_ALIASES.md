# Import Aliases Guide

Laravel-style import aliases for the entire Neastore framework.

## Available Aliases

| Alias | Path | Description |
|-------|------|-------------|
| `vasuzex` | `./framework/index.js` | Main framework entry point |
| `vasuzex/*` | `./framework/*` | Any framework file |
| `#database` | `./database/index.js` | Database connection |
| `#database/*` | `./database/*` | Database files |
| `#models` | `./database/models/index.js` | All models |
| `#models/*` | `./database/models/*` | Individual models |
| `#config` | `./config/index.cjs` | Configuration |
| `#config/*` | `./config/*` | Config files |

## Configuration Files

### jsconfig.json
Provides IDE autocomplete and path resolution:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@framework": ["./framework/index.js"],
      "@framework/*": ["./framework/*"],
      ...
    }
  }
}
```

### package.json
Node.js native import maps (requires Node 18+):

```json
{
  "imports": {
    "vasuzex": "./framework/index.js",
    "vasuzex/*": "./framework/*",
    ...
  }
}
```

## Usage Examples

### Import Framework Components

```javascript
// Instead of: import { Application } from '../../framework/Foundation/Application.js';
import { Application, DB, Cache, Auth } from 'vasuzex';

// Instead of: import Model from '../../framework/Database/Model.js';
import { Model } from 'vasuzex';
```

### Import Facades

```javascript
// All facades from main framework
import { 
  DB, 
  Cache, 
  Auth, 
  Hash, 
  Log, 
  Mail, 
  Queue,
  Storage,
  Config,
  Event
} from 'vasuzex';

// Or individually
import DB from 'vasuzex/Support/Facades/DB';
import Cache from 'vasuzex/Support/Facades/Cache';
```

### Import Models

```javascript
// All models
import { Post, Comment, Task, User } from '#models';

// Individual model
import { Post } from '#models/Post.js';
import { User } from '#models/User.js';
```

### Import Database Services

```javascript
// Database connection
import { getDatabase } from '#database';

// Model base class
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

Neastore:
```javascript
import { DB, Cache } from 'vasuzex';
import { Post } from '#models';
```

## Notes

- Use `#` prefix for internal aliases (Node.js convention for subpath imports)
- Use `@` prefix in jsconfig.json (IDE/tooling convention)
- Aliases work in both development and production
- No build step required - native Node.js feature (18+)
