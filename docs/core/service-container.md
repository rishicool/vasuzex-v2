# Service Container

The Service Container is a powerful tool for managing class dependencies and performing dependency injection in Vasuzex. It's the heart of the framework, inspired by Laravel's IoC (Inversion of Control) container.

## Introduction

The container allows you to:
- **Bind** interfaces to concrete implementations
- **Resolve** dependencies automatically
- **Manage** singletons and instances
- **Inject** dependencies into classes

Think of it as a registry that knows how to create and provide instances of your classes.

## Basic Usage

### Accessing the Container

The container is available through the Application instance:

```javascript
import { Application } from 'vasuzex';

const app = new Application(process.cwd());
await app.boot();

// Access container
const container = app.container;
```

### Binding Services

#### Simple Binding

Bind a class to the container:

```javascript
class EmailService {
  send(to, message) {
    console.log(`Sending email to ${to}: ${message}`);
  }
}

// Bind the service
app.bind('EmailService', EmailService);

// Resolve the service
const emailService = app.make('EmailService');
emailService.send('user@example.com', 'Hello!');
```

#### Binding with Factory Functions

Use a factory function for more control:

```javascript
app.bind('Mailer', () => {
  return new Mailer({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
  });
});
```

#### Singleton Binding

Singletons are created once and reused:

```javascript
// Traditional singleton
class Database {
  constructor() {
    this.connection = this.connect();
  }
  
  connect() {
    return 'DB Connection';
  }
}

app.singleton('Database', Database);

// Both resolve to the same instance
const db1 = app.make('Database');
const db2 = app.make('Database');

console.log(db1 === db2); // true
```

#### Binding Instances

Bind an already-created instance:

```javascript
const config = {
  app: { name: 'My App' },
  database: { host: 'localhost' }
};

app.instance('config', config);

// Retrieve the instance
const appConfig = app.make('config');
```

### Resolving Services

#### Using `make()`

```javascript
// Resolve by abstract name
const service = app.make('EmailService');

// Resolve with alias
app.alias('email', 'EmailService');
const email = app.make('email');
```

#### Constructor Injection

The container can automatically inject dependencies:

```javascript
class UserRepository {
  constructor() {
    this.data = [];
  }
  
  findAll() {
    return this.data;
  }
}

class UserService {
  constructor(repository) {
    this.repository = repository;
  }
  
  getUsers() {
    return this.repository.findAll();
  }
}

// Bind both
app.singleton('UserRepository', UserRepository);
app.bind('UserService', () => {
  const repo = app.make('UserRepository');
  return new UserService(repo);
});

// Resolve UserService (repository auto-injected)
const userService = app.make('UserService');
```

## Advanced Usage

### Aliases

Create shortcuts for long binding names:

```javascript
app.singleton('App\\Services\\EmailService', EmailService);
app.alias('email', 'App\\Services\\EmailService');

// Use the short alias
const email = app.make('email');
```

### Contextual Binding

Different classes can receive different implementations of the same interface:

```javascript
class FileLogger {
  log(message) {
    console.log(`[FILE] ${message}`);
  }
}

class DatabaseLogger {
  log(message) {
    console.log(`[DB] ${message}`);
  }
}

// Bind different loggers for different contexts
app.bind('FileUploadService.Logger', FileLogger);
app.bind('UserService.Logger', DatabaseLogger);
```

### Checking if Bound

```javascript
if (app.has('EmailService')) {
  const email = app.make('EmailService');
}
```

### Removing Bindings

```javascript
// Forget a binding
app.forget('EmailService');

// Clear all bindings
app.flush();
```

## Practical Examples

### Example 1: Database Service

```javascript
import { Container } from 'vasuzex';

class DatabaseConnection {
  constructor(config) {
    this.config = config;
    this.connected = false;
  }
  
  connect() {
    console.log(`Connecting to ${this.config.host}:${this.config.port}`);
    this.connected = true;
    return this;
  }
  
  query(sql) {
    if (!this.connected) {
      this.connect();
    }
    console.log(`Executing: ${sql}`);
    return [];
  }
}

class UserRepository {
  constructor(db) {
    this.db = db;
  }
  
  findAll() {
    return this.db.query('SELECT * FROM users');
  }
  
  find(id) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Set up container
const container = new Container();

// Bind database as singleton
container.singleton('database', () => {
  return new DatabaseConnection({
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  });
});

// Bind repository
container.bind('UserRepository', () => {
  const db = container.make('database');
  return new UserRepository(db);
});

// Use it
const userRepo = container.make('UserRepository');
const users = userRepo.findAll();
```

### Example 2: Service Layer with Dependencies

```javascript
class CacheService {
  constructor() {
    this.store = new Map();
  }
  
  get(key) {
    return this.store.get(key);
  }
  
  set(key, value, ttl = 3600) {
    this.store.set(key, value);
    setTimeout(() => this.store.delete(key), ttl * 1000);
  }
}

class LoggerService {
  log(level, message, context = {}) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
  
  info(message, context) {
    this.log('info', message, context);
  }
  
  error(message, context) {
    this.log('error', message, context);
  }
}

class ProductService {
  constructor(cache, logger) {
    this.cache = cache;
    this.logger = logger;
  }
  
  async getProduct(id) {
    // Check cache
    const cached = this.cache.get(`product_${id}`);
    if (cached) {
      this.logger.info('Product retrieved from cache', { id });
      return cached;
    }
    
    // Fetch from database
    this.logger.info('Fetching product from database', { id });
    const product = { id, name: 'Sample Product', price: 99.99 };
    
    // Cache it
    this.cache.set(`product_${id}`, product);
    
    return product;
  }
}

// Bind services
app.singleton('cache', CacheService);
app.singleton('logger', LoggerService);

app.bind('ProductService', () => {
  const cache = app.make('cache');
  const logger = app.make('logger');
  return new ProductService(cache, logger);
});

// Use the service
const productService = app.make('ProductService');
const product = await productService.getProduct(1);
```

### Example 3: Payment Gateway Abstraction

```javascript
// Abstract interface
class PaymentGateway {
  charge(amount, token) {
    throw new Error('Method not implemented');
  }
}

// Concrete implementations
class StripeGateway extends PaymentGateway {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }
  
  charge(amount, token) {
    console.log(`Charging $${amount} via Stripe`);
    return { success: true, transaction_id: 'stripe_123' };
  }
}

class PayPalGateway extends PaymentGateway {
  constructor(clientId, secret) {
    super();
    this.clientId = clientId;
    this.secret = secret;
  }
  
  charge(amount, token) {
    console.log(`Charging $${amount} via PayPal`);
    return { success: true, transaction_id: 'paypal_456' };
  }
}

// Bind based on environment
const gateway = process.env.PAYMENT_GATEWAY || 'stripe';

if (gateway === 'stripe') {
  app.singleton('PaymentGateway', () => {
    return new StripeGateway(process.env.STRIPE_API_KEY);
  });
} else if (gateway === 'paypal') {
  app.singleton('PaymentGateway', () => {
    return new PayPalGateway(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_SECRET
    );
  });
}

// Payment service doesn't care which gateway
class PaymentService {
  constructor(gateway) {
    this.gateway = gateway;
  }
  
  processPayment(amount, token) {
    return this.gateway.charge(amount, token);
  }
}

app.bind('PaymentService', () => {
  const gateway = app.make('PaymentGateway');
  return new PaymentService(gateway);
});

// Use it
const paymentService = app.make('PaymentService');
const result = paymentService.processPayment(100, 'tok_123');
```

## Container in Service Providers

Service providers use the container to register bindings:

```javascript
import { ServiceProvider } from 'vasuzex';

class AppServiceProvider extends ServiceProvider {
  register() {
    // Bind services
    this.app.singleton('cache', CacheService);
    this.app.singleton('logger', LoggerService);
    
    // Bind with factory
    this.app.bind('mailer', () => {
      return new Mailer(this.app.make('config').get('mail'));
    });
  }
  
  boot() {
    // Access resolved services
    const logger = this.app.make('logger');
    logger.info('Application booted');
  }
}
```

## Method Reference

### Binding Methods

| Method | Description |
|--------|-------------|
| `bind(abstract, concrete, singleton)` | Bind a service to the container |
| `singleton(abstract, concrete)` | Bind a singleton service |
| `instance(abstract, instance)` | Bind an existing instance |
| `alias(alias, abstract)` | Create an alias for a binding |

### Resolution Methods

| Method | Description |
|--------|-------------|
| `make(abstract)` | Resolve a service from the container |
| `has(abstract)` | Check if a binding exists |

### Management Methods

| Method | Description |
|--------|-------------|
| `forget(abstract)` | Remove a binding |
| `flush()` | Clear all bindings |

## Best Practices

### 1. Use Interfaces/Abstracts

```javascript
// Good: Depend on abstractions
app.bind('LoggerInterface', FileLogger);

class UserService {
  constructor(logger) {
    this.logger = logger; // LoggerInterface
  }
}

// Bad: Depend on concrete implementation
class UserService {
  constructor() {
    this.logger = new FileLogger(); // Tightly coupled
  }
}
```

### 2. Prefer Singletons for Stateless Services

```javascript
// Stateless services - use singleton
app.singleton('logger', Logger);
app.singleton('cache', CacheService);

// Stateful services - use regular binding
app.bind('ShoppingCart', ShoppingCart);
```

### 3. Use Factory Functions for Configuration

```javascript
// Good: Configuration injected
app.singleton('database', () => {
  const config = app.make('config');
  return new Database(config.get('database'));
});

// Bad: Hardcoded configuration
app.singleton('database', () => {
  return new Database({ host: 'localhost' });
});
```

### 4. Keep Service Creation Logic in Providers

```javascript
// Good: In service provider
class DatabaseServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('db', () => {
      return new DatabaseConnection(
        this.app.make('config').get('database')
      );
    });
  }
}

// Bad: In application code
const db = new DatabaseConnection(config);
app.instance('db', db);
```

### 5. Use Descriptive Names

```javascript
// Good
app.bind('App\\Services\\EmailService', EmailService);
app.alias('email', 'App\\Services\\EmailService');

// Avoid
app.bind('es', EmailService);
```

## Comparison with Laravel

Vasuzex's container is inspired by Laravel but adapted for JavaScript:

| Laravel (PHP) | Vasuzex (Node.js) |
|---------------|-------------------|
| `$app->bind()` | `app.bind()` |
| `$app->singleton()` | `app.singleton()` |
| `$app->instance()` | `app.instance()` |
| `$app->make()` | `app.make()` |
| `app('service')` | `app.make('service')` |
| Type-hinting | Manual injection |

## Troubleshooting

### Binding Not Found Error

```javascript
// Error: No binding found for "EmailService"
const email = app.make('EmailService');

// Fix: Ensure service is bound
app.bind('EmailService', EmailService);
```

### Circular Dependencies

```javascript
// Avoid circular dependencies
class A {
  constructor(b) { this.b = b; }
}

class B {
  constructor(a) { this.a = a; }
}

// This will fail - use lazy resolution or refactor
```

### Singleton Not Reusing Instance

```javascript
// Wrong: Using bind() instead of singleton()
app.bind('cache', CacheService);

// Correct: Use singleton()
app.singleton('cache', CacheService);
```

## Next Steps

- [Service Providers](service-providers.md)
- [Facades](facades.md)
- [Configuration](../getting-started/configuration.md)
