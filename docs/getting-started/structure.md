# Directory Structure

Understanding the Vasuzex framework directory structure will help you navigate and organize your applications effectively.

## Overview

```
vasuzex/
├── apps/                    # Your applications
├── bin/                     # Executable scripts
├── config/                  # Configuration files
├── database/               # Database layer
├── docs/                   # Documentation
├── examples/               # Usage examples
├── framework/              # Framework core
├── tests/                  # Test files
├── .env                    # Environment variables
├── package.json           # Dependencies
└── pnpm-workspace.yaml    # Monorepo config
```

## Root Directory

### `apps/`

Contains your applications. Each app is independent with its own:

```
apps/
├── blog-api/              # Blog API application
│   ├── api/              # API routes and controllers
│   └── web/              # Web frontend (if applicable)
├── media-server/         # Media server application
│   ├── src/
│   ├── config/
│   └── package.json
└── your-app/             # Your custom application
    ├── server.js
    ├── routes/
    ├── controllers/
    └── middleware/
```

**Purpose**: Separate concerns and enable multiple apps in one workspace.

### `bin/`

Executable scripts and CLI tools:

```
bin/
└── create-vasuzex.js     # Project generator script
```

### `config/`

Framework-wide configuration files:

```
config/
├── app.cjs               # App settings
├── auth.cjs              # Authentication
├── broadcasting.cjs      # Broadcasting
├── cache.cjs             # Cache configuration
├── database.cjs          # Database connections
├── filesystems.cjs       # File storage
├── formatter.cjs         # Formatter service
├── geoip.cjs            # GeoIP settings
├── hashing.cjs          # Password hashing
├── http.cjs             # HTTP settings
├── image.cjs            # Image processing
├── location.cjs         # Location services
├── logging.cjs          # Logging
├── mail.cjs             # Email configuration
├── media.cjs            # Media management
├── notification.cjs     # Notifications
├── queue.cjs            # Queue configuration
├── services.cjs         # External services
├── session.cjs          # Session management
├── sms.cjs              # SMS configuration
├── translation.cjs      # Translations
└── upload.cjs           # File upload
```

**Purpose**: Centralized configuration accessible via `Config` facade.

### `database/`

Database-related files:

```
database/
├── migrations/           # Database migrations
│   ├── 001_create_posts_table.mjs
│   └── 002_create_comments_table.mjs
├── models/              # Eloquent models
│   ├── User.js
│   ├── Post.js
│   └── index.js
└── seeders/            # Database seeders
    ├── UserSeeder.js
    └── ProductSeeder.js
```

**Purpose**: Database schema, models, and sample data.

### `framework/`

The core framework code:

```
framework/
├── index.js              # Main entry point
├── Auth/                 # Authentication system
│   ├── AuthManager.js
│   ├── Guards/
│   └── UserProviders/
├── Broadcasting/         # Broadcasting system
│   ├── BroadcastManager.js
│   └── Broadcasters/
├── Config/              # Config repository
│   └── Repository.js
├── Console/             # CLI system
│   ├── Application.js
│   ├── Commands/
│   └── Schedule.js
├── Database/            # Database layer
│   ├── Model.js
│   ├── QueryBuilder.js
│   ├── Relations.js
│   └── Observer.js
├── Filesystem/          # File operations
│   └── Filesystem.js
├── Foundation/          # Core foundation
│   ├── Application.js
│   ├── Container.js
│   ├── ServiceProvider.js
│   └── Bootstrap/
├── Http/                # HTTP layer
│   ├── Controller.js
│   ├── Request.js
│   ├── Response.js
│   ├── Middleware/
│   └── Resources/
├── Pagination/          # Pagination
│   └── Paginator.js
├── Routing/            # Router system
│   ├── Router.js
│   └── RouteCollection.js
├── Services/           # Framework services
│   ├── Cache/
│   ├── Formatter/
│   ├── GeoIP/
│   ├── Location/
│   ├── SMS/
│   ├── Upload/
│   └── Validation/
├── Support/            # Helper utilities
│   ├── Facades/
│   ├── Helpers/
│   └── Collection.js
├── Translation/        # Internationalization
│   └── Translator.js
└── Validation/         # Validation system
    ├── Validator.js
    └── Rules/
```

**Purpose**: Framework internals. You typically don't modify these files.

## Application Structure

When you create a new app with `npx vasuzex generate:app`, you get:

```
apps/your-app/
├── server.js            # Application entry point
├── routes/              # Route definitions
│   ├── api.js
│   └── web.js
├── controllers/         # Controllers
│   ├── AuthController.js
│   ├── PostController.js
│   └── UserController.js
├── middleware/          # Custom middleware
│   ├── Authenticate.js
│   └── RateLimiter.js
├── requests/           # Form request validation
│   ├── CreatePostRequest.js
│   └── LoginRequest.js
├── resources/          # API resources
│   ├── UserResource.js
│   └── PostResource.js
├── services/           # Business logic
│   ├── PostService.js
│   └── NotificationService.js
├── jobs/              # Queue jobs
│   ├── ProcessUpload.js
│   └── SendEmail.js
├── events/            # Events
│   ├── UserRegistered.js
│   └── PostCreated.js
├── listeners/         # Event listeners
│   ├── SendWelcomeEmail.js
│   └── UpdateCache.js
├── config/           # App-specific config
│   └── app.js
├── storage/          # File storage
│   ├── app/
│   ├── logs/
│   └── cache/
├── public/           # Public assets
│   ├── images/
│   ├── css/
│   └── js/
└── package.json      # App dependencies
```

## Database Directory

### `migrations/`

Database schema migrations:

```javascript
// database/migrations/001_create_users_table.mjs
export async function up(db) {
  await db.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('name');
    table.string('email').unique();
    table.string('password');
    table.timestamps();
  });
}

export async function down(db) {
  await db.schema.dropTable('users');
}
```

### `models/`

Eloquent ORM models:

```javascript
// database/models/User.js
import { Model } from 'vasuzex';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
  
  posts() {
    return this.hasMany('Post');
  }
}
```

### `seeders/`

Database seeders for sample data:

```javascript
// database/seeders/UserSeeder.js
export class UserSeeder {
  async run(db) {
    await db.table('users').insert([
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
    ]);
  }
}
```

## Import Aliases

Vasuzex provides convenient import aliases:

```javascript
// Framework imports
import { Application, DB, Cache } from 'vasuzex';

// Models
import { User, Post } from '#models';

// Database
import { getDatabase } from '#database';

// Config
import config from '#config';
```

**Configured in `jsconfig.json`**:

```json
{
  "compilerOptions": {
    "paths": {
      "vasuzex": ["./framework/index.js"],
      "vasuzex/*": ["./framework/*"],
      "#models": ["./database/models/index.js"],
      "#models/*": ["./database/models/*"],
      "#database": ["./database/index.js"],
      "#config": ["./config/index.js"]
    }
  }
}
```

See [Import Aliases Guide](../IMPORT_ALIASES.md) for complete details.

## Storage Directory

### Default Structure

```
storage/
├── app/              # Application files
│   ├── public/      # Publicly accessible
│   └── private/     # Private files
├── logs/            # Log files
│   ├── app.log
│   └── error.log
├── cache/           # File-based cache
│   └── data/
└── uploads/         # Uploaded files
    ├── images/
    └── documents/
```

### Configuration

Storage locations are configured in `config/filesystems.cjs`:

```javascript
module.exports = {
  default: 'local',
  
  disks: {
    local: {
      driver: 'local',
      root: 'storage/app',
    },
    
    public: {
      driver: 'local',
      root: 'storage/app/public',
      url: env('APP_URL') + '/storage',
      visibility: 'public',
    },
  },
};
```

## Framework Core Structure

### Foundation Layer

**`Foundation/Application.js`**: Core application instance
- Service container management
- Service provider registration
- Application bootstrapping
- Configuration loading

**`Foundation/Container.js`**: Dependency injection container
- Service binding and resolution
- Singleton management
- Dependency injection

**`Foundation/ServiceProvider.js`**: Service provider base class
- Service registration
- Bootstrapping logic

### HTTP Layer

**`Http/Request.js`**: HTTP request wrapper
- Input retrieval
- Validation
- File uploads

**`Http/Response.js`**: HTTP response wrapper
- JSON responses
- Redirects
- File downloads

**`Http/Controller.js`**: Controller base class
- Middleware support
- Dependency injection

### Database Layer

**`Database/Model.js`**: Eloquent ORM base model
- CRUD operations
- Relationships
- Query scopes
- Soft deletes

**`Database/QueryBuilder.js`**: Fluent query builder
- Select, insert, update, delete
- Joins and aggregates
- Where conditions

**`Database/Relations.js`**: Relationship definitions
- hasOne, hasMany
- belongsTo, belongsToMany
- Eager loading

## Configuration Files

### Application Config (`config/app.cjs`)

```javascript
module.exports = {
  name: env('APP_NAME', 'Vasuzex'),
  env: env('NODE_ENV', 'local'),
  debug: env('APP_DEBUG', 'true') === 'true',
  url: env('APP_URL', 'http://localhost'),
  timezone: env('APP_TIMEZONE', 'UTC'),
  locale: env('APP_LOCALE', 'en'),
  key: env('APP_KEY', ''),
};
```

### Database Config (`config/database.cjs`)

```javascript
module.exports = {
  default: env('DB_CONNECTION', 'postgresql'),
  
  connections: {
    postgresql: {
      driver: 'postgresql',
      host: env('POSTGRES_HOST', 'localhost'),
      port: parseInt(env('POSTGRES_PORT', '5432'), 10),
      database: env('POSTGRES_DB', 'vasuzex_dev'),
      user: env('POSTGRES_USER', 'postgres'),
      password: env('POSTGRES_PASSWORD', ''),
    },
  },
};
```

## Best Practices

### 1. Organize by Feature

Group related files together:

```
apps/blog/
├── posts/
│   ├── PostController.js
│   ├── PostService.js
│   ├── PostResource.js
│   └── routes.js
└── comments/
    ├── CommentController.js
    ├── CommentService.js
    └── routes.js
```

### 2. Separate Concerns

Keep business logic in services:

```
controllers/     # HTTP handling only
services/        # Business logic
models/          # Data layer
```

### 3. Use Import Aliases

```javascript
// Good
import { User } from '#models';
import { DB } from 'vasuzex';

// Avoid
import { User } from '../../database/models/User.js';
import { DB } from '../../framework/Database/index.js';
```

### 4. Keep Configs in `config/`

Don't hardcode configuration:

```javascript
// Good
import { Config } from 'vasuzex';
const apiUrl = Config.get('app.url');

// Bad
const apiUrl = 'http://localhost:3000';
```

### 5. Naming Conventions

- **Models**: PascalCase, singular (`User`, `Post`)
- **Controllers**: PascalCase with suffix (`UserController`, `PostController`)
- **Files**: Match class name (`UserController.js`)
- **Migrations**: snake_case with timestamp prefix
- **Config files**: lowercase with `.cjs` extension

## Monorepo Structure

Vasuzex uses pnpm workspaces for monorepo management:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'framework'
```

### Benefits

- Share dependencies across apps
- Single `node_modules` at root
- Consistent versioning
- Easy inter-app references

### Workspace Commands

```bash
# Install dependencies for all apps
pnpm install

# Run command in specific app
pnpm --filter blog-api dev

# Run command in all apps
pnpm -r dev
```

## Next Steps

- [Quick Start Guide](quickstart.md)
- [Service Container](../core/service-container.md)
- [Database Guide](../database/getting-started.md)
- [Routing](../http/routing.md)
