# Vasuzex

> A Laravel-inspired Node.js framework built for **multi-app monorepos** — shared models, shared config, multiple APIs and frontends under one roof, powered by Turborepo.

[![npm version](https://img.shields.io/npm/v/vasuzex.svg)](https://www.npmjs.com/package/vasuzex)
[![npm downloads](https://img.shields.io/npm/dm/vasuzex.svg)](https://www.npmjs.com/package/vasuzex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io)

**[📖 Full Documentation →](https://vasuzex.xdeve.com/guide/)**

---

---

## What is Vasuzex?

Vasuzex is a Laravel-inspired Node.js framework **purpose-built for monorepo applications**. Unlike traditional Node.js frameworks that manage a single server, Vasuzex treats your entire product as a workspace — with shared database models, shared configuration, and multiple apps (APIs + frontends) all living under one roof.

Most real-world products aren't a single API. You need a customer-facing storefront, a merchant dashboard, and an admin panel — each with its own API, its own frontend, and its own auth rules. But all three share the same database and the same business logic.

**Vasuzex solves this directly:**

| Without Vasuzex | With Vasuzex |
|---|---|
| 3–6 separate repositories | One monorepo project |
| Duplicated models & migrations across every repo | Shared `database/models/` — one source of truth |
| Version conflicts between app dependencies | Single `node_modules` via pnpm hoisting |
| Manual port management | Auto-assigned ports per app |
| Manual Turborepo setup | Pre-configured `turbo.json` out of the box |

---

## Requirements

Before you begin, ensure your machine has:

- **Node.js v18+** (v22 recommended) — Vasuzex uses ESM modules
- **pnpm v8+** — Required for workspace management: `npm install -g pnpm`
- **PostgreSQL 14+**, **MySQL 8+**, or **SQLite** — at least one database engine

---

## Quick Start

### Step 1 — Install Globally

```bash
npm install -g vasuzex

# Verify
create-vasuzex --version
vasuzex --version
```

This makes two commands available system-wide:

| Command | Purpose |
|---|---|
| `create-vasuzex` | Scaffold a new Vasuzex project |
| `vasuzex` | Run framework commands: migrate, seed, generate apps, etc. |

### Step 2 — Create a Project

```bash
create-vasuzex my-app
```

The interactive wizard asks:

| Prompt | Options |
|---|---|
| Template | `fullstack`, `api-only`, `web-only`, `api-media`, `minimal` |
| App name | Any lowercase name, e.g. `blog` |
| Frontend | React, Vue.js, Svelte, Vanilla JS |
| Database | PostgreSQL, MySQL, SQLite |
| DB credentials | host, port, name, user, password — written to `.env` automatically |

**What happens behind the scenes (10 automated steps):**

1. Creates `config/`, `database/`, `apps/` directory structure
2. Copies 26 config files — auth, cache, database, mail, queue, security, etc.
3. Generates the `database/` workspace package with models, migrations, seeders
4. Creates root `package.json` with all dependencies and Turborepo scripts
5. Sets up `pnpm-workspace.yaml`
6. Runs `pnpm install` — single installation for the entire monorepo
7. Generates your apps — API server + Web frontend based on template choice
8. Creates the database — runs `CREATE DATABASE` automatically
9. Runs migrations & seeders — tables created, default data seeded
10. Initializes git — first commit with all generated code

**Example output:**

```
$ create-vasuzex my-app

✔ Template: fullstack
✔ App name: blog
✔ Frontend: React
✔ Database: PostgreSQL

📦 Installing dependencies...
🔧 Generating API app...
🎨 Generating Web app...
🗄️  Creating database...
📋 Running migrations...
🌱 Seeding database...
🎉 Done!

Your project is ready at ./my-app

  cd my-app
  pnpm run dev:blog-api   # Start API on port 3000
  pnpm run dev:blog-web   # Start Web on port 4000
```

### Non-Interactive Mode (CI/CD)

```bash
npx create-fresh my-app
```

Creates a project with sensible defaults (fullstack, React, PostgreSQL) without any prompts.

---

## Project Structure

```
my-app/
├── config/                    # Shared configuration (26 files)
│   ├── app.cjs                #   Application settings
│   ├── auth.cjs               #   Guards, providers, JWT
│   ├── database.cjs           #   PostgreSQL/MySQL/Redis connections
│   ├── cache.cjs              #   Cache drivers (redis, file, memory)
│   ├── mail.cjs               #   SMTP, SendGrid, SES, Mailgun
│   ├── queue.cjs              #   Job queue drivers
│   ├── security.cjs           #   Helmet, CORS, CSRF, rate limiting
│   ├── session.cjs            #   Session drivers
│   ├── payment.cjs            #   Razorpay, Stripe, PhonePe
│   └── ...                    #   + 17 more config files
├── database/                  # Shared database layer
│   ├── models/                #   Eloquent models (User, Product, etc.)
│   ├── migrations/            #   Schema migrations
│   ├── seeders/               #   Data seeders
│   ├── index.js               #   Database connection entry
│   └── package.json           #   @my-app/database workspace package
├── apps/
│   ├── customer/
│   │   ├── api/               # Customer API (port 3000)
│   │   │   ├── src/
│   │   │   │   ├── index.js
│   │   │   │   ├── routes/
│   │   │   │   ├── controllers/
│   │   │   │   ├── middleware/
│   │   │   │   └── services/
│   │   │   ├── .env           #   APP_PORT=3000
│   │   │   └── package.json
│   │   └── web/               # Customer frontend (port 4000)
│   │       ├── src/
│   │       ├── .env
│   │       └── vite.config.js
│   └── admin/
│       ├── api/               # Admin API (port 3001)
│       └── web/               # Admin frontend (port 4001)
├── .env                       # Root environment variables
├── .gitignore
├── .npmrc                     # pnpm hoisting config
├── package.json               # Root — all dependencies + scripts
├── pnpm-workspace.yaml        # Workspace: apps/*/* , database
└── turbo.json                 # Turborepo task config
```

---

## Generating More Apps

After your initial project, add more apps at any time:

```bash
# Fullstack app (API + Web)
vasuzex generate:app customer

# API-only
vasuzex generate:app customer --type api

# Web-only with React
vasuzex generate:app customer --type web --framework react

# Remove an app
vasuzex delete:app customer --force
vasuzex delete:app customer --type api --force
```

Port assignment is automatic — API apps start at 3000 and increment; web apps start at 4000.

---

## Running Your Apps

Vasuzex uses Turborepo for parallel execution across all apps.

```bash
# Start everything in parallel
pnpm run dev

# Start a specific app
pnpm run dev:customer-api   # port 3000
pnpm run dev:customer-web   # port 4000
pnpm run dev:business-api   # port 3001

# Turborepo filters for custom combinations
turbo run dev --filter=customer-api --filter=customer-web
turbo run dev --filter=*-api        # all APIs, no frontends
turbo run dev --filter=!admin-*     # everything except admin
```

**Turborepo Tasks:**

| Task | Command | Behavior |
|---|---|---|
| `dev` | `pnpm run dev` | Starts all dev servers in parallel |
| `build` | `pnpm run build` | Builds all apps, caches `dist/` output |
| `start` | `pnpm run start` | Starts production servers (requires build) |
| `lint` | `pnpm run lint` | Lints all apps |
| `clean` | `pnpm run clean` | Removes build artifacts |

---

## Database Management

The database is shared across all apps. All database commands run at the project root:

```bash
# Migrations
pnpm run db:migrate       # Run pending migrations
pnpm run db:rollback      # Rollback last batch
pnpm run db:reset         # Drop all tables + re-migrate
pnpm run db:seed          # Run seeders

# Generators
pnpm run make:model       # Create a new model
pnpm run make:migration   # Create a new migration
pnpm run make:seeder      # Create a new seeder
```

---

## Architecture

Vasuzex is modeled after Laravel's battle-tested patterns, adapted for Node.js.

### Service Container

The `Application` class extends an IoC Container. Services are registered as bindings and resolved on demand:

```javascript
import { Application } from 'vasuzex/Foundation';

const app = new Application(import.meta.dirname);
await app.bootstrap();

// Register services
app.singleton('cache', () => new CacheManager(app));
app.bind('mailer', () => new MailManager(app));
app.instance('config', configRepo);

// Resolve
const cache = app.make('cache');
```

### Facades

Facades provide static, expressive access to container services:

```javascript
import { Cache, Mail, Auth, DB, Log } from 'vasuzex';

await Cache.put('key', 'value', 3600);
const value = await Cache.get('key');

await Mail.send({ to: 'user@example.com', subject: 'Welcome' });

const user = Auth.user();
const posts = await DB.table('posts').get();

Log.info('Application started');
```

**Available Facades:**

| Facade | Service | Purpose |
|---|---|---|
| `Auth` | AuthManager | Authentication & guards |
| `Cache` | CacheManager | Array, Redis, file caching |
| `Config` | ConfigRepository | Configuration access |
| `DB` | DatabaseManager | Query builder |
| `Hash` | HashManager | Password hashing |
| `Log` | LogManager | Logging |
| `Mail` | MailManager | Email sending |
| `Queue` | QueueManager | Job queues |
| `Security` | SecurityService | JWT, OTP, hashing |
| `Session` | SessionManager | Session management |
| `SMS` | SMSManager | SMS sending |
| `Storage` | StorageManager | File storage (local, S3) |
| `Upload` | UploadManager | File uploads |
| `Validator` | ValidationFactory | Validation |

### Service Providers

Providers are the central place to register and boot services:

```javascript
import { ServiceProvider } from 'vasuzex/Foundation';

class PaymentServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('payment', () => {
      return new PaymentGateway(this.app.make('config'));
    });
  }

  boot() {
    // Safe to use other services here — all providers are registered
    const event = this.app.make('events');
    event.listen('order.completed', handlePayment);
  }
}
```

---

## HTTP Layer

### Routing

```javascript
import { Router } from 'vasuzex';

const router = new Router();

router.get('/users', async (req, res) => {
  const users = await User.all();
  res.json({ success: true, data: users });
});

router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// Route Groups — shared prefix + middleware
router.group({ prefix: '/admin', middleware: [authMiddleware] }, (r) => {
  r.get('/dashboard', AdminController.dashboard);
  r.get('/users', AdminController.users);
  r.post('/users', AdminController.createUser);
});

// Nested groups
router.group({ prefix: '/api' }, (r) => {
  r.post('/auth/login', AuthController.login);

  r.group({ middleware: [authenticate()] }, (r) => {
    r.get('/me', AuthController.me);
    r.put('/me', AuthController.updateProfile);
  });
});

// Mount on the application
app.use('/api', router.getRouter());
```

**All Router Methods:**

| Method | Signature |
|---|---|
| `get()` | `router.get(path, ...handlers)` |
| `post()` | `router.post(path, ...handlers)` |
| `put()` | `router.put(path, ...handlers)` |
| `patch()` | `router.patch(path, ...handlers)` |
| `delete()` | `router.delete(path, ...handlers)` |
| `any()` | `router.any(path, ...handlers)` — all HTTP methods |
| `group()` | `router.group(options, callback)` |
| `use()` | `router.use(...middleware)` |

---

## Database — Eloquent Models

Vasuzex uses GuruORM's Eloquent-inspired Active Record ORM.

### Defining Models

```javascript
import Model from 'vasuzex/Database/Model';

class User extends Model {
  // table inferred as 'users' from class name
}

class BlogPost extends Model {
  static table = 'blog_posts';        // override table name
  static primaryKey = 'post_id';      // override primary key
  static timestamps = true;           // auto-manage created_at/updated_at
  static softDeletes = true;          // enable soft deletes
  static fillable = ['title', 'body', 'user_id'];
  static hidden = ['deleted_at'];
  static casts = {
    is_published: 'boolean',
    metadata: 'json',
    published_at: 'date',
  };
}
```

### Querying

```javascript
// Simple lookups
const users = await User.all();
const user = await User.find(42);
const user = await User.findOrFail(42);  // throws ModelNotFoundException

// Fluent query builder
const admins = await User.where('role', 'admin').get();
const recent = await User.query()
  .where('role', 'admin')
  .where('active', true)
  .orderBy('name')
  .limit(10)
  .get();

// Pagination
const result = await User.paginate(15, 1);
// { data: [...], total: 100, perPage: 15, currentPage: 1, lastPage: 7 }
```

### Creating, Updating, Deleting

```javascript
// Create
const user = await User.create({ name: 'John', email: 'john@example.com' });

// Update
const user = await User.find(1);
user.name = 'Jane';
await user.save();

// Or: fill + save
await user.fill({ name: 'Jane', email: 'jane@example.com' }).save();

// Bulk update
await User.updateWhere({ role: 'guest' }, { active: false });

// Delete
await user.delete();
await User.destroy(1);

// Soft delete / restore
await user.delete();          // sets deleted_at
await user.restore();         // clears deleted_at
await user.forceDelete();     // permanent removal

const all = await User.withTrashed().get();
const trashed = await User.onlyTrashed().get();
```

### Accessors & Mutators

```javascript
class User extends Model {
  getFullNameAttribute() {
    return `${this.attributes.first_name} ${this.attributes.last_name}`;
  }

  // Async mutators are fully supported
  async setPasswordAttribute(value) {
    const bcrypt = await import('bcryptjs');
    this.attributes.password = await bcrypt.hash(value, 12);
  }

  setEmailAttribute(value) {
    this.attributes.email = value.toLowerCase().trim();
  }
}

const user = await User.find(1);
user.full_name; // 'John Doe'
```

### Query Scopes

```javascript
class Post extends Model {
  scopePublished(query) {
    return query.where('status', 'published');
  }

  scopeRecent(query, days = 7) {
    const since = new Date(Date.now() - days * 86400000);
    return query.where('created_at', '>=', since);
  }
}

const posts = await Post.query()
  .published()
  .recent(14)
  .get();
```

### Import Aliases

Every app in the monorepo can import shared code via built-in aliases:

| Alias | Resolves to | Purpose |
|---|---|---|
| `vasuzex` | `./framework/index.js` | Framework classes |
| `#framework` | `./framework/index.js` | Same as above |
| `#database` | `./database/index.js` | DB connection + query builder |
| `#models` | `./database/models/index.js` | All Eloquent models |
| `#config` | `./config/index.cjs` | Config loader |

```javascript
// In any app's controller
import { Product, Order, User } from '#models';

class ProductController extends Controller {
  async index(req, res) {
    const products = await Product.where('active', true).paginate(15);
    return this.success(res, products);
  }
}
```

---

## React UI

Vasuzex ships a React UI library (`vasuzex/react`) with production-ready components used internally for admin interfaces.

### DataTable

A full-featured data table with server-side pagination, sorting, per-column searching, and **built-in debounce + request cancellation** — search requests fire only after the user stops typing (400 ms debounce) and any in-flight request is automatically aborted if the user types again before it resolves.

```jsx
import { DataTable } from 'vasuzex/react';

function UsersPage() {
  const columns = [
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    { key: 'role', label: 'Role' },
    { key: 'created_at', label: 'Created', sortable: true },
  ];

  return (
    <DataTable
      title="Users"
      columns={columns}
      apiEndpoint="/api/users"
    />
  );
}
```

---

## Manual Setup

If you prefer to add Vasuzex to an existing Node.js project:

```bash
npm install vasuzex
```

```javascript
// src/index.js
import { Application } from 'vasuzex/Foundation';

const app = new Application(import.meta.dirname);
await app.bootstrap();

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

**Minimum `.env`:**

```env
APP_NAME=my-app
APP_ENV=development
APP_PORT=3000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=my_app
DB_USERNAME=postgres
DB_PASSWORD=

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

**Environment file cascade** (later files override earlier ones):

| File | Priority | Committed |
|---|---|---|
| `.env` | 1 (lowest) | Yes |
| `.env.local` | 2 | No (gitignored) |
| `.env.development` | 3 | Yes |
| `.env.production` | 3 | Yes |
| `.env.<env>.local` | 4 (highest) | No |

---

## CLI Reference

```bash
# Project creation
create-vasuzex my-app               # Interactive scaffold
npx create-fresh my-app             # Non-interactive (fullstack defaults)

# App management
vasuzex generate:app customer                        # Fullstack
vasuzex generate:app customer --type api             # API only
vasuzex generate:app customer --type web --framework react
vasuzex delete:app customer --force

# Database
vasuzex migrate                     # Run pending migrations
pnpm run db:rollback                # Rollback last batch
pnpm run db:reset                   # Drop all + re-migrate
pnpm run db:seed                    # Run seeders

# Generators
vasuzex make:model User
vasuzex make:migration create_users_table
vasuzex make:seeder UserSeeder

# Testing
pnpm test
pnpm test:coverage
pnpm test:watch
```

---

## Testing

```bash
pnpm test               # Run all tests
pnpm test:coverage      # With coverage report
pnpm test:watch         # Watch mode
```

---

## Documentation

Full documentation with examples, API reference, and guides lives at:

**[https://vasuzex.xdeve.com/guide/](https://vasuzex.xdeve.com/guide/)**

| Section | URL |
|---|---|
| Installation | https://vasuzex.xdeve.com/guide/ |
| Architecture | https://vasuzex.xdeve.com/guide/architecture |
| Configuration | https://vasuzex.xdeve.com/guide/configuration |
| Routing | https://vasuzex.xdeve.com/guide/routing |
| Request | https://vasuzex.xdeve.com/guide/request |
| Response | https://vasuzex.xdeve.com/guide/response |
| Controllers | https://vasuzex.xdeve.com/guide/controllers |
| Middleware | https://vasuzex.xdeve.com/guide/middleware |
| Models | https://vasuzex.xdeve.com/guide/models |
| Relationships | https://vasuzex.xdeve.com/guide/relationships |
| Observers & Events | https://vasuzex.xdeve.com/guide/observers |
| Migrations | https://vasuzex.xdeve.com/guide/migrations |
| Seeding | https://vasuzex.xdeve.com/guide/seeding |
| Validation | https://vasuzex.xdeve.com/guide/validation |

---

## Contributing

Contributions are welcome. Please open an issue to discuss what you'd like to change before submitting a pull request. See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT © Vasuzex

---

**NPM:** https://www.npmjs.com/package/vasuzex


---
