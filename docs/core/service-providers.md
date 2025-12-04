# Service Providers

Service Providers are the central place for configuring and bootstrapping your application's services. They register services into the [Service Container](service-container.md) and perform any setup needed for those services.

## Introduction

Every Vasuzex application boots through service providers. Service providers tell Vasuzex how to bind services into the container and how to configure them. The framework itself uses service providers to bootstrap core services like the database, cache, and mail systems.

### Two-Phase Bootstrapping

Service providers have two phases:

1. **Register**: Bind services into the container
2. **Boot**: Configure services (all services are now available)

This ensures all services are registered before any provider tries to use them.

## Creating Service Providers

### Basic Structure

```javascript
import { ServiceProvider } from 'vasuzex';

export class AppServiceProvider extends ServiceProvider {
  /**
   * Register any application services
   */
  register() {
    // Bind services to the container
    this.app.singleton('MyService', MyService);
  }

  /**
   * Bootstrap any application services
   */
  boot() {
    // Configure services (all services are registered)
  }
}
```

### The `register` Method

Use `register()` to bind services into the container:

```javascript
export class AppServiceProvider extends ServiceProvider {
  register() {
    // Simple binding
    this.app.bind('Repository', UserRepository);
    
    // Singleton binding
    this.app.singleton('Cache', CacheService);
    
    // Binding with factory function
    this.app.singleton('Mailer', () => {
      const config = this.app.make('config');
      return new Mailer(config.get('mail'));
    });
    
    // Binding instance
    this.app.instance('version', '1.0.0');
  }
}
```

**Important**: Only bind services in `register()`. Don't try to use other services yet - they might not be registered.

### The `boot` Method

Use `boot()` to configure services after all providers have registered their services:

```javascript
export class AppServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('logger', LoggerService);
  }

  boot() {
    // Safe to use services here
    const logger = this.app.make('logger');
    logger.info('Application booting');
    
    // Register observers
    User.observe(UserObserver);
    
    // Define routes, policies, etc.
  }
}
```

## Registering Providers

Register your service providers in your application bootstrap:

```javascript
import { Application } from 'vasuzex';
import { AppServiceProvider } from './providers/AppServiceProvider.js';
import { DatabaseServiceProvider } from './providers/DatabaseServiceProvider.js';

const app = new Application(process.cwd());

// Register providers
app.register(AppServiceProvider);
app.register(DatabaseServiceProvider);

// Boot the application
await app.boot();
```

## Practical Examples

### Example 1: Database Service Provider

```javascript
import { ServiceProvider } from 'vasuzex';
import { DatabaseConnection } from '../services/DatabaseConnection.js';
import { Model } from 'vasuzex';

export class DatabaseServiceProvider extends ServiceProvider {
  register() {
    // Register database connection
    this.app.singleton('db', () => {
      const config = this.app.make('config');
      return new DatabaseConnection(config.get('database'));
    });
    
    // Register query builder
    this.app.bind('QueryBuilder', () => {
      const db = this.app.make('db');
      return new QueryBuilder(db);
    });
  }

  async boot() {
    // Set up Model static properties
    const db = this.app.make('db');
    Model.setConnection(db);
    
    // Connect to database
    await db.connect();
    
    // Log connection
    const logger = this.app.make('logger');
    logger.info('Database connected');
  }
}
```

### Example 2: Cache Service Provider

```javascript
import { ServiceProvider } from 'vasuzex';
import { CacheManager } from '../services/CacheManager.js';
import { RedisStore } from '../services/Cache/RedisStore.js';
import { MemoryStore } from '../services/Cache/MemoryStore.js';

export class CacheServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('cache', () => {
      const config = this.app.make('config');
      const cacheConfig = config.get('cache');
      
      return new CacheManager({
        default: cacheConfig.default,
        stores: {
          redis: new RedisStore(cacheConfig.stores.redis),
          memory: new MemoryStore(cacheConfig.stores.memory),
        }
      });
    });
    
    // Alias for convenience
    this.app.alias('Cache', 'cache');
  }

  boot() {
    // Cache is ready to use
    const cache = this.app.make('cache');
    console.log(`Cache driver: ${cache.getDefaultDriver()}`);
  }
}
```

### Example 3: Mail Service Provider

```javascript
import { ServiceProvider } from 'vasuzex';
import { MailManager } from '../services/MailManager.js';
import { SmtpTransport } from '../services/Mail/SmtpTransport.js';
import { SesTransport } from '../services/Mail/SesTransport.js';

export class MailServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('mailer', () => {
      const config = this.app.make('config').get('mail');
      
      const manager = new MailManager(config);
      
      // Register transports
      manager.extend('smtp', () => new SmtpTransport(config.mailers.smtp));
      manager.extend('ses', () => new SesTransport(config.mailers.ses));
      
      return manager;
    });
  }

  boot() {
    // Test mail configuration in development
    const env = this.app.make('config').get('app.env');
    
    if (env === 'local') {
      const mailer = this.app.make('mailer');
      console.log(`Mail driver: ${mailer.getDefaultDriver()}`);
    }
  }
}
```

### Example 4: Validation Service Provider

```javascript
import { ServiceProvider } from 'vasuzex';
import { Validator } from '../services/Validator.js';
import { indianPANValidator } from '../validators/IndianValidators.js';

export class ValidationServiceProvider extends ServiceProvider {
  register() {
    this.app.bind('validator', () => {
      return new Validator();
    });
  }

  boot() {
    const validator = this.app.make('validator');
    
    // Register custom validators
    validator.extend('pan', indianPANValidator);
    validator.extend('gstin', (value) => {
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
    });
    
    // Register custom messages
    validator.setMessage('pan', 'The :attribute must be a valid PAN number.');
    validator.setMessage('gstin', 'The :attribute must be a valid GSTIN.');
  }
}
```

### Example 5: Repository Pattern Provider

```javascript
import { ServiceProvider } from 'vasuzex';
import { UserRepository } from '../repositories/UserRepository.js';
import { PostRepository } from '../repositories/PostRepository.js';

export class RepositoryServiceProvider extends ServiceProvider {
  register() {
    // Register repositories
    this.app.bind('UserRepository', () => {
      const db = this.app.make('db');
      const cache = this.app.make('cache');
      return new UserRepository(db, cache);
    });
    
    this.app.bind('PostRepository', () => {
      const db = this.app.make('db');
      const cache = this.app.make('cache');
      return new PostRepository(db, cache);
    });
  }

  boot() {
    // Repository services are ready
  }
}
```

## Deferred Providers

Deferred providers only load when their services are actually needed:

```javascript
export class HeavyServiceProvider extends ServiceProvider {
  /**
   * Indicates if loading should be deferred
   */
  static deferred = true;

  /**
   * Services provided by this provider
   */
  provides() {
    return ['heavy-service'];
  }

  register() {
    this.app.singleton('heavy-service', () => {
      // This only runs when heavy-service is first requested
      return new HeavyService();
    });
  }
}
```

## Provider Options

Pass options when registering a provider:

```javascript
// Register with options
app.register(CustomServiceProvider, {
  apiKey: process.env.API_KEY,
  endpoint: 'https://api.example.com'
});

// Access options in provider
export class CustomServiceProvider extends ServiceProvider {
  register() {
    const options = this.app.make(`${this.constructor.name}.options`);
    
    this.app.singleton('api-client', () => {
      return new ApiClient({
        key: options.apiKey,
        endpoint: options.endpoint
      });
    });
  }
}
```

## Boot Methods with Dependencies

Inject dependencies into boot methods:

```javascript
export class AppServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('router', Router);
    this.app.singleton('logger', Logger);
  }

  boot() {
    // Get dependencies
    const router = this.app.make('router');
    const logger = this.app.make('logger');
    
    // Use them
    router.get('/health', (req, res) => {
      logger.info('Health check');
      res.json({ status: 'ok' });
    });
  }
}
```

## Testing Service Providers

```javascript
import { Application } from 'vasuzex';
import { AppServiceProvider } from './AppServiceProvider.js';

describe('AppServiceProvider', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.register(AppServiceProvider);
  });

  test('registers services', async () => {
    await app.boot();
    
    expect(app.has('MyService')).toBe(true);
    expect(app.make('MyService')).toBeInstanceOf(MyService);
  });

  test('boots services', async () => {
    await app.boot();
    
    const service = app.make('MyService');
    expect(service.isBooted).toBe(true);
  });
});
```

## Built-in Service Providers

Vasuzex includes several core service providers:

### DatabaseServiceProvider

Registers database connection and Model setup:

```javascript
import { DatabaseServiceProvider } from 'vasuzex';

app.register(DatabaseServiceProvider);
```

### FormatterServiceProvider

Registers the formatter service for Indian formats:

```javascript
import { FormatterServiceProvider } from 'vasuzex';

app.register(FormatterServiceProvider);
```

### CacheServiceProvider

Registers caching services:

```javascript
import { CacheServiceProvider } from 'vasuzex';

app.register(CacheServiceProvider);
```

## Best Practices

### 1. Keep Providers Focused

Each provider should handle one area of functionality:

```javascript
// Good: Focused provider
export class DatabaseServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('db', DatabaseConnection);
  }
}

// Bad: Kitchen sink provider
export class AppServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('db', DatabaseConnection);
    this.app.singleton('cache', CacheService);
    this.app.singleton('mailer', MailService);
    // Too much responsibility
  }
}
```

### 2. Use Register for Bindings Only

```javascript
// Good: Only bindings in register
export class CacheServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('cache', CacheManager);
  }

  boot() {
    // Use services here
    const cache = this.app.make('cache');
    cache.configure();
  }
}

// Bad: Using services in register
export class CacheServiceProvider extends ServiceProvider {
  register() {
    const logger = this.app.make('logger'); // Might not exist yet!
    this.app.singleton('cache', CacheManager);
  }
}
```

### 3. Don't Hardcode Configuration

```javascript
// Good: Use config
export class MailServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('mailer', () => {
      const config = this.app.make('config');
      return new Mailer(config.get('mail'));
    });
  }
}

// Bad: Hardcoded values
export class MailServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('mailer', () => {
      return new Mailer({ host: 'smtp.mailtrap.io' });
    });
  }
}
```

### 4. Order Matters

Register providers in dependency order:

```javascript
// Good: Dependencies first
app.register(ConfigServiceProvider);
app.register(LoggerServiceProvider);
app.register(DatabaseServiceProvider); // Uses logger

// Bad: Wrong order might cause issues
app.register(DatabaseServiceProvider); // Needs logger
app.register(LoggerServiceProvider); // Registered after
```

### 5. Use Descriptive Names

```javascript
// Good
export class AuthenticationServiceProvider extends ServiceProvider { }
export class NotificationServiceProvider extends ServiceProvider { }

// Bad
export class ASP extends ServiceProvider { }
export class NSP extends ServiceProvider { }
```

## Comparison with Laravel

| Laravel (PHP) | Vasuzex (Node.js) |
|---------------|-------------------|
| `public function register()` | `register() { }` |
| `public function boot()` | `boot() { }` |
| `protected $defer = true` | `static deferred = true` |
| `$this->app->singleton()` | `this.app.singleton()` |
| Type-hinting in boot | Manual resolution |

## Next Steps

- [Service Container](service-container.md)
- [Facades](facades.md)
- [Configuration](../getting-started/configuration.md)
- [Dependency Injection](service-container.md#constructor-injection)
