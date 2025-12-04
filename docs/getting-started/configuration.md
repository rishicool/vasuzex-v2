# Configuration

Vasuzex uses Laravel-style configuration files located in the `config/` directory. All configuration files return JavaScript objects and support environment variables through the `env()` helper.

## Configuration Files

All configuration files are located in the `config/` directory:

```
config/
├── app.cjs              # Application settings
├── auth.cjs             # Authentication config
├── broadcasting.cjs     # Broadcasting settings
├── cache.cjs            # Cache configuration
├── database.cjs         # Database connections
├── filesystems.cjs      # File storage
├── formatter.cjs        # Formatter service
├── geoip.cjs           # GeoIP settings
├── hashing.cjs         # Password hashing
├── http.cjs            # HTTP settings
├── image.cjs           # Image processing
├── location.cjs        # Location services
├── logging.cjs         # Logging configuration
├── mail.cjs            # Email settings
├── media.cjs           # Media management
├── notification.cjs    # Notifications
├── queue.cjs           # Queue configuration
├── services.cjs        # External services
├── session.cjs         # Session management
├── sms.cjs             # SMS configuration
├── translation.cjs     # Translations
└── upload.cjs          # File upload settings
```

## Environment Variables

### The `.env` File

Your application's configuration values that vary by environment should be stored in a `.env` file in your project root:

```env
# Application
APP_NAME=Vasuzex
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost
APP_KEY=base64:your-secret-key-here
APP_TIMEZONE=UTC
APP_LOCALE=en
API_PREFIX=/api

# Database - PostgreSQL
DB_CONNECTION=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=vasuzex_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=null

# Cache
CACHE_DRIVER=redis
CACHE_PREFIX=vasuzex_cache

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="${APP_NAME}"

# SMS (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890

# File Storage
FILESYSTEM_DISK=local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Accessing Environment Variables

Use the `env()` helper in config files:

```javascript
// config/app.cjs
function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

module.exports = {
  name: env('APP_NAME', 'Vasuzex'),
  debug: env('APP_DEBUG', 'true') === 'true',
  url: env('APP_URL', 'http://localhost'),
};
```

**Important**: Never use `env()` outside configuration files. Always access config values through the Config service.

## Accessing Configuration Values

### Using Config Facade

```javascript
import { Config } from 'vasuzex';

// Get a configuration value
const appName = Config.get('app.name');
const dbConnection = Config.get('database.default');

// Get with default value
const apiPrefix = Config.get('app.api_prefix', '/api');

// Get nested values with dot notation
const postgresHost = Config.get('database.connections.postgresql.host');

// Check if config exists
if (Config.has('app.key')) {
  // Config exists
}

// Set config at runtime
Config.set('app.custom', 'value');

// Get all config for a file
const appConfig = Config.get('app');
```

### Direct Import (Not Recommended)

```javascript
// Only use in config files themselves
import config from '#config';

const appName = config.app.name;
const dbConfig = config.database;
```

## Application Configuration

### `config/app.cjs`

```javascript
module.exports = {
  // Application name
  name: env('APP_NAME', 'Vasuzex'),

  // Environment (local, development, staging, production)
  env: env('NODE_ENV', 'local'),

  // Debug mode (enable detailed errors)
  debug: env('APP_DEBUG', 'true') === 'true',

  // Application URL
  url: env('APP_URL', 'http://localhost'),

  // Timezone (UTC, America/New_York, Asia/Kolkata, etc.)
  timezone: env('APP_TIMEZONE', 'UTC'),

  // Default locale
  locale: env('APP_LOCALE', 'en'),

  // Encryption key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  key: env('APP_KEY', ''),

  // API prefix for routes
  api_prefix: env('API_PREFIX', '/api'),

  // CORS allowed origins
  cors_origins: env('CORS_ORIGINS', '').split(',').filter(Boolean),
};
```

## Database Configuration

### `config/database.cjs`

```javascript
module.exports = {
  // Default connection to use
  default: env('DB_CONNECTION', 'postgresql'),

  // Database connections
  connections: {
    postgresql: {
      driver: 'postgresql',
      host: env('POSTGRES_HOST', 'localhost'),
      port: parseInt(env('POSTGRES_PORT', '5432'), 10),
      database: env('POSTGRES_DB', 'vasuzex_dev'),
      user: env('POSTGRES_USER', 'postgres'),
      password: env('POSTGRES_PASSWORD', ''),
      charset: 'utf8',
      schema: 'public',
    },

    mysql: {
      driver: 'mysql',
      host: env('DB_HOST', 'localhost'),
      port: parseInt(env('DB_PORT', '3306'), 10),
      database: env('DB_DATABASE', 'vasuzex'),
      user: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
    },
  },

  // Migration table name
  migrations: 'migrations',

  // Redis configuration
  redis: {
    client: 'ioredis',
    default: {
      host: env('REDIS_HOST', 'localhost'),
      port: parseInt(env('REDIS_PORT', '6379'), 10),
      password: env('REDIS_PASSWORD', null),
      database: 0,
    },
  },
};
```

## Cache Configuration

### `config/cache.cjs`

```javascript
module.exports = {
  // Default cache driver (redis, memory, file)
  default: env('CACHE_DRIVER', 'redis'),

  // Cache stores
  stores: {
    redis: {
      driver: 'redis',
      connection: 'default',
      prefix: env('CACHE_PREFIX', 'vasuzex_cache'),
    },

    memory: {
      driver: 'memory',
      maxSize: 100, // MB
    },

    file: {
      driver: 'file',
      path: 'storage/cache',
    },
  },

  // Default cache lifetime (seconds)
  ttl: 3600,
};
```

## Service-Specific Configuration

### Mail (`config/mail.cjs`)

```javascript
module.exports = {
  default: env('MAIL_MAILER', 'smtp'),

  mailers: {
    smtp: {
      transport: 'smtp',
      host: env('MAIL_HOST', 'smtp.mailtrap.io'),
      port: env('MAIL_PORT', 2525),
      encryption: env('MAIL_ENCRYPTION', 'tls'),
      username: env('MAIL_USERNAME'),
      password: env('MAIL_PASSWORD'),
    },

    ses: {
      transport: 'ses',
      key: env('AWS_ACCESS_KEY_ID'),
      secret: env('AWS_SECRET_ACCESS_KEY'),
      region: env('AWS_DEFAULT_REGION', 'us-east-1'),
    },
  },

  from: {
    address: env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    name: env('MAIL_FROM_NAME', 'Vasuzex'),
  },
};
```

### File Storage (`config/filesystems.cjs`)

```javascript
module.exports = {
  default: env('FILESYSTEM_DISK', 'local'),

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

    s3: {
      driver: 's3',
      key: env('AWS_ACCESS_KEY_ID'),
      secret: env('AWS_SECRET_ACCESS_KEY'),
      region: env('AWS_DEFAULT_REGION'),
      bucket: env('AWS_BUCKET'),
    },
  },
};
```

### SMS (`config/sms.cjs`)

```javascript
module.exports = {
  default: env('SMS_PROVIDER', 'twilio'),

  providers: {
    twilio: {
      account_sid: env('TWILIO_ACCOUNT_SID'),
      auth_token: env('TWILIO_AUTH_TOKEN'),
      from: env('TWILIO_FROM_NUMBER'),
    },

    msg91: {
      auth_key: env('MSG91_AUTH_KEY'),
      sender_id: env('MSG91_SENDER_ID'),
      route: env('MSG91_ROUTE', '4'),
    },
  },
};
```

## Environment-Specific Configuration

### Local Development

```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=postgresql
CACHE_DRIVER=memory
QUEUE_CONNECTION=sync
```

### Production

```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=postgresql
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

### Testing

```env
APP_ENV=testing
APP_DEBUG=true
DB_CONNECTION=postgresql
DB_DATABASE=vasuzex_test
CACHE_DRIVER=memory
QUEUE_CONNECTION=sync
SESSION_DRIVER=memory
```

## Configuration Caching

For production environments, cache your configuration for better performance:

```bash
# Cache configuration
npx vasuzex config:cache

# Clear configuration cache
npx vasuzex config:clear
```

Cached configuration is stored in `bootstrap/cache/config.json`.

## Best Practices

### 1. Never Commit `.env`

Always add `.env` to `.gitignore`:

```gitignore
.env
.env.local
.env.production
```

### 2. Use `.env.example`

Provide an example environment file:

```bash
cp .env .env.example
# Remove sensitive values from .env.example
git add .env.example
```

### 3. Type Conversion

Convert string env values to appropriate types:

```javascript
// Boolean
debug: env('APP_DEBUG', 'true') === 'true',

// Number
port: parseInt(env('APP_PORT', '3000'), 10),

// Array
origins: env('CORS_ORIGINS', '').split(',').filter(Boolean),
```

### 4. Validate Required Config

Check critical config on app boot:

```javascript
import { Application, Config } from 'vasuzex';

const app = new Application(process.cwd());
await app.boot();

// Validate
if (!Config.get('app.key')) {
  throw new Error('APP_KEY is not set');
}
```

### 5. Use Meaningful Defaults

Always provide sensible defaults:

```javascript
// Good
port: parseInt(env('PORT', '3000'), 10),

// Bad - might fail unexpectedly
port: parseInt(env('PORT'), 10),
```

## Configuration Helpers

### Creating Custom Configuration Files

Create a new config file in `config/`:

```javascript
// config/custom.cjs
function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

module.exports = {
  option1: env('CUSTOM_OPTION1', 'default'),
  option2: env('CUSTOM_OPTION2', 'default'),
  
  nested: {
    setting: env('CUSTOM_NESTED_SETTING', 'value'),
  },
};
```

Access it:

```javascript
import { Config } from 'vasuzex';

const value = Config.get('custom.option1');
const nested = Config.get('custom.nested.setting');
```

## Troubleshooting

### Configuration Not Loading

1. Check file is `.cjs` extension
2. Verify module.exports syntax
3. Check for syntax errors
4. Clear config cache: `npx vasuzex config:clear`

### Environment Variables Not Working

1. Check `.env` file exists in project root
2. Verify variable names match exactly
3. Restart the application
4. Check for typos in variable names

### Type Issues

```javascript
// Common mistake
port: env('PORT'), // Returns string "3000"

// Correct
port: parseInt(env('PORT', '3000'), 10), // Returns number 3000
```

## Next Steps

- [Directory Structure](structure.md)
- [Quick Start Guide](quickstart.md)
- [Service Providers](../core/service-providers.md)
