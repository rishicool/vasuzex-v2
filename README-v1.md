# Vasuzex Framework

> **✅ PRODUCTION READY - v1.0.4**  
> Fully tested framework with comprehensive API/Web scaffolding, Eloquent ORM, Facades, and zero-configuration setup.  
> Perfect for building modern monorepo applications with Node.js.

A Laravel-inspired Node.js framework with Eloquent ORM, Facades, Service Container, and zero-configuration setup.

[![npm version](https://img.shields.io/npm/v/vasuzex.svg)](https://www.npmjs.com/package/vasuzex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

### Create a New Project

```bash
# Using npx (no installation required)
npx create-vasuzex my-app

# Using npm
npm create vasuzex my-app

# Using pnpm
pnpm create vasuzex my-app

# Follow the interactive setup
cd my-app

# Install dependencies (if not auto-installed)
npm install  # or: pnpm install

# Run migrations
npm run db:migrate  # or: pnpm db:migrate

# Start development
npm run dev  # or: pnpm dev
```

Your app is running at `http://localhost:3000`! 🎉

---

## 📦 Installation Options

### Option 1: NPX/NPM Create (Recommended for Quick Start)

No installation needed - works with npm, pnpm, or yarn:

```bash
# NPX (npm 5.2+)
npx create-vasuzex my-app

# NPM
npm create vasuzex my-app

# PNPM
pnpm create vasuzex my-app

# Yarn
yarn create vasuzex my-app
```

### Option 2: Global Installation (Recommended for Active Development)

Install once, use everywhere:

```bash
# Using npm
npm install -g vasuzex

# Using pnpm
pnpm add -g vasuzex

# Using yarn
yarn global add vasuzex

# Now you can use commands globally
create-vasuzex my-app
cd my-app
vasuzex generate:app my-api
vasuzex make:model User
vasuzex db:migrate
```

### Option 3: Local Dependency (For Existing Projects)

Add to your existing project:

```bash
# Using npm
npm install vasuzex

# Using pnpm
pnpm add vasuzex

# Using yarn
yarn add vasuzex

# Use via npx or direct command
npx vasuzex generate:app my-api
```

**All three options work identically - choose what fits your workflow!**

---

## ✨ Features

### 🎯 Core Features

- **🚀 Zero Configuration** - Interactive CLI sets up everything automatically
- **📦 Monorepo Ready** - Build multiple apps in one repository
- **🎨 Laravel-Inspired** - Familiar architecture for PHP developers
- **🔧 Starter Templates** - API, Web (React/Vue/Svelte), Media Server
- **⚡ Web Scaffolding** - Full React, Vue, Svelte apps with Vite
- **📁 Clean Imports** - `import { Application, DB } from 'vasuzex'`
- **💾 Multiple Databases** - PostgreSQL, MySQL, SQLite support

### 🗄️ Database & ORM

- **GuruORM Built-in** - Eloquent-style ORM included (no separate install)
- **Relationships** - hasMany, belongsTo, hasOne, belongsToMany
- **Query Builder** - Fluent, expressive database queries
- **Migrations** - Version control for your database
- **Seeders** - Populate database with test data
- **Soft Deletes** - Trash and restore records
- **Scopes** - Reusable query constraints
- **Observers** - React to model events
- **Mutators** - Transform attributes on get/set

### 🔐 Authentication & Security

- **Guards** - Session, token, JWT authentication
- **Middleware** - Protect routes and verify permissions
- **Password Hashing** - Bcrypt built-in
- **Authorization** - Gate and Policy support
- **CSRF Protection** - Cross-site request forgery prevention

### 📧 Communication Services

- **Mail** - Send emails (SMTP, SendGrid, Mailgun)
- **SMS** - Send text messages (Twilio, AWS SNS)
- **Notifications** - Multi-channel notifications
- **Broadcasting** - Real-time events (Socket.io, Pusher)

### 💾 Caching & Storage

- **Cache** - Redis, Memory, File-based caching
- **File Storage** - Local, S3, Digital Ocean Spaces
- **File Upload** - Multipart form data handling
- **Image Processing** - Resize, crop, optimize with Sharp

### 🛠️ Utilities

- **Validation** - Comprehensive validation rules
- **Indian Validators** - PAN, Aadhaar, GSTIN, Phone validation
- **Formatter** - Currency, dates, numbers (Indian formats)
- **Location** - Geocoding, distance calculations, Indian states
- **GeoIP** - IP geolocation with MaxMind
- **Queue** - Background job processing
- **Translation** - Multi-language support
- **Logging** - Winston-based logging

---

## 📚 Documentation

### Getting Started

- **[Installation](./docs/getting-started/installation.md)** - Install Vasuzex and create your first project
- **[Quick Start Guide](./docs/getting-started/quickstart.md)** - Build your first app in 10 minutes
- **[Configuration](./docs/getting-started/configuration.md)** - Configure your application
- **[Directory Structure](./docs/getting-started/structure.md)** - Understand the project layout

### Core Concepts

- **[Service Container](./docs/core/service-container.md)** - Dependency injection
- **[Service Providers](./docs/core/service-providers.md)** - Bootstrap services
- **[Facades](./docs/core/facades.md)** - Static-like interfaces
- **[Import Aliases](./docs/IMPORT_ALIASES.md)** - Clean import paths

### Database

- **[Getting Started](./docs/database/getting-started.md)** - Database basics
- **[Query Builder](./docs/database/query-builder.md)** - Build SQL queries
- **[Eloquent ORM](./docs/database/eloquent.md)** - Work with models
- **[Relationships](./docs/database/relationships.md)** - Model relationships
- **[Migrations](./docs/database/migrations.md)** - Database versioning
- **[Seeding](./docs/database/seeding.md)** - Populate data

### HTTP & Routing

- **[Routing](./docs/http/routing.md)** - Define routes
- **[Controllers](./docs/http/controllers.md)** - Handle requests
- **[Middleware](./docs/http/middleware.md)** - Filter requests
- **[Validation](./framework/Services/Validation/README.md)** - Validate input

### Services

- **[Cache](./framework/Services/Cache/README.md)**
- **[Mail](./framework/Services/Mail/README.md)**
- **[SMS](./framework/Services/SMS/README.md)**
- **[File Upload](./framework/Services/Upload/README.md)**
- **[Image Processing](./framework/Services/Media/README.md)**
- **[Formatter](./framework/Services/Formatter/README.md)**
- **[Location](./framework/Services/Location/README.md)**
- **[GeoIP](./framework/Services/GeoIP/README.md)**

**[See all documentation →](./docs/README.md)**

---

## 💡 Usage Examples

### Import the Framework

```javascript
// Clean imports - everything from one place
import { 
  Application,
  DB,
  Cache,
  Auth,
  Hash,
  Log,
  Mail,
  SMS
} from 'vasuzex';

// Import models
import { User, Post, Comment } from '#models';

// Start application
const app = new Application(process.cwd());
await app.boot();
```

### Database Queries

```javascript
import { DB } from 'vasuzex';

// Query builder
const users = await DB.table('users')
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();

// Raw queries
const result = await DB.raw('SELECT * FROM users WHERE id = ?', [1]);

// Transactions
await DB.transaction(async () => {
  await DB.table('users').insert({ name: 'John' });
  await DB.table('posts').insert({ title: 'Hello' });
});
```

### Eloquent Models

```javascript
import { User, Post } from '#models';

// Find by ID
const user = await User.find(1);

// Create
const post = await Post.create({
  title: 'My First Post',
  content: 'Hello World!',
  user_id: user.id
});

// Update
await user.update({ name: 'John Doe' });

// Delete
await post.delete();  // Soft delete
await post.forceDelete();  // Permanent delete

// Relationships
const posts = await user.posts().getResults();
const author = await post.user().getResults();

// Query scopes
const published = await Post.where('status', 'published').get();
```

### Caching

```javascript
import { Cache } from 'vasuzex';

// Store for 1 hour (3600 seconds)
await Cache.put('key', 'value', 3600);

// Retrieve
const value = await Cache.get('key', 'default');

// Remember (get or set)
const posts = await Cache.remember('posts', 3600, async () => {
  return await Post.all();
});

// Forget
await Cache.forget('key');

// Clear all
await Cache.flush();
```

### Authentication

```javascript
import { Auth, Hash } from 'vasuzex';

// Attempt login
const success = await Auth.attempt({
  email: 'user@example.com',
  password: 'secret'
});

if (success) {
  const user = Auth.user();
  console.log('Logged in:', user.name);
}

// Hash password
const hashed = await Hash.make('password');

// Verify password
const valid = await Hash.check('password', hashed);
```

### File Upload

```javascript
import { Upload } from 'vasuzex';

// In Express route
app.post('/upload', Upload.single('file'), async (req, res) => {
  const file = req.file;
  
  console.log('Uploaded:', file.filename);
  console.log('Path:', file.path);
  console.log('Size:', file.size);
  
  res.json({ success: true, file });
});

// Multiple files
app.post('/upload-multiple', Upload.array('files', 10), async (req, res) => {
  const files = req.files;
  
  res.json({ 
    success: true, 
    count: files.length 
  });
});
```

### Image Processing

```javascript
import { Media } from 'vasuzex';

// Resize image
await Media.resize('/path/to/image.jpg', {
  width: 300,
  height: 200,
  fit: 'cover'
});

// Create thumbnail
await Media.thumbnail('/path/to/image.jpg', 150);

// Optimize
await Media.optimize('/path/to/image.jpg', {
  quality: 80
});
```

### Validation

```javascript
import { Validator } from 'vasuzex';

const rules = {
  email: 'required|email',
  password: 'required|min:8',
  age: 'required|integer|min:18',
  phone: 'required|indian_phone'
};

const validator = new Validator(req.body, rules);

if (validator.fails()) {
  return res.status(422).json({
    errors: validator.errors()
  });
}

const validated = validator.validated();
```

### Logging

```javascript
import { Log } from 'vasuzex';

Log.info('User logged in', { user_id: 123 });
Log.error('Error occurred', { error: err.message });
Log.warning('Cache miss');
Log.debug('Debug info', { data });
```

---

## 🏗️ Project Structure

```
my-app/
├── apps/                    # Your applications
│   ├── blog-api/           # Blog API app
│   │   ├── api/            # API code
│   │   └── web/            # Web code
│   └── media-server/       # Media processing
├── config/                  # Laravel-style configs
│   ├── app.cjs             # Application config
│   ├── database.cjs        # Database connections
│   ├── auth.cjs            # Authentication
│   ├── cache.cjs           # Cache drivers
│   ├── mail.cjs            # Mail services
│   └── ...                 # More configs
├── database/               # Database layer
│   ├── models/            # Eloquent models
│   │   ├── User.js
│   │   └── Post.js
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── node_modules/          # Dependencies
│   └── vasuzex/           # Framework core
├── .env                   # Environment variables
├── .env.example          # Environment template
├── package.json          # Project manifest
└── README.md             # Documentation
```

---

## 🔧 Available Commands

### Project Creation

```bash
# Create new project
npx create-vasuzex my-app
# or if installed globally
create-vasuzex my-app
```

### Database Operations

```bash
# Using npm/npx
npm run db:migrate
npx vasuzex migrate

# Using pnpm
pnpm db:migrate
pnpm vasuzex migrate

# Check migration status
npm run db:migrate:status
pnpm db:migrate:status

# Rollback last migration
npx vasuzex migrate:rollback

# Seed database
npm run db:seed
pnpm db:seed

# Fresh migration + seed
npm run db:reset
pnpm db:reset
```

### Code Generation

```bash
# Generate API application (works with npm, pnpm, yarn)
npx vasuzex generate:app blog --type api
pnpm vasuzex generate:app blog --type api
npm run generate:app blog --type api  # if you added to scripts

# Generate Web application (with framework selection)
npx vasuzex generate:app blog --type web
pnpm vasuzex generate:app blog --type web
# Interactive prompt will ask: React, Vue, Svelte, or Plain HTML

# Or specify framework directly
npx vasuzex generate:app blog --type web --framework react
pnpm vasuzex generate:app shop --type web --framework vue

# Generate both API + Web
npx vasuzex generate:app blog
pnpm vasuzex generate:app blog

# Generate media server
npx vasuzex generate:media-server
pnpm vasuzex generate:media-server --port 4003

# Create model
npx vasuzex make:model Product
pnpm vasuzex make:model Product --migration

# Create migration
npx vasuzex make:migration create_products_table
pnpm vasuzex make:migration create_products_table

# Create seeder
pnpm make:seeder ProductSeeder
npx vasuzex make:seeder ProductSeeder
```

### Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm dev:blog-api
pnpm dev:media-server

# Run tests
pnpm test

# Lint code
pnpm lint
```

---

## 🎯 Use Cases

### API Development

Build RESTful APIs with built-in:
- Authentication & JWT
- Request validation
- Database ORM
- File uploads
- Error handling

```javascript
// Example API endpoint
import { Controller } from 'vasuzex';
import { Product } from '#models';

export class ProductController extends Controller {
  async index(req, res) {
    const products = await Product.all();
    return res.json({ success: true, data: products });
  }
  
  async store(req, res) {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  }
}
```

### Microservices

Build multiple services in one monorepo:
- Shared models and configs
- Independent deployment
- Service communication
- Centralized database

### Media Processing

Handle image uploads and processing:
- Upload validation
- Automatic resizing
- Thumbnail generation
- Multiple storage backends

### Background Jobs

Process tasks asynchronously:
- Email sending
- Report generation
- Data processing
- Scheduled tasks

---

## 🚦 System Requirements

- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0
- **pnpm**: >= 8.0.0 (recommended)
- **Database**: PostgreSQL 12+, MySQL 5.7+, or SQLite 3+

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Documentation**: [https://github.com/rishicool/vasuzex/tree/main/docs](https://github.com/rishicool/vasuzex/tree/main/docs)
- **Issues**: [https://github.com/rishicool/vasuzex/issues](https://github.com/rishicool/vasuzex/issues)
- **NPM Package**: [https://www.npmjs.com/package/vasuzex](https://www.npmjs.com/package/vasuzex)
- **GitHub**: [https://github.com/rishicool/vasuzex](https://github.com/rishicool/vasuzex)

---

## 🙏 Acknowledgments

Inspired by:
- **Laravel** - For the elegant architecture and developer experience
- **Express** - For the HTTP server foundation
- **Knex** - For query builder inspiration

---

## 📞 Support

Having issues? Check our [documentation](./docs/README.md) or [open an issue](https://github.com/rishicool/vasuzex/issues).

---

**Made with ❤️ by the Vasuzex Team**

---

## Quick Reference

### Import Framework

```javascript
import { Application, DB, Cache, Auth } from 'vasuzex';
import { User, Post } from '#models';
```

### Create Project

```bash
npx create-vasuzex my-app
cd my-app
pnpm install && pnpm db:migrate && pnpm dev
```

### Common Commands

```bash
vasuzex generate:app my-api      # Generate new app
vasuzex make:model User          # Create model
vasuzex make:migration ...       # Create migration
vasuzex db:migrate               # Run migrations
vasuzex db:seed                  # Seed database
```

### CRUD Operations

```javascript
// Create
const user = await User.create({ name: 'John', email: 'john@example.com' });

// Read
const users = await User.all();
const user = await User.find(1);
const active = await User.where('active', true).get();

// Update
await user.update({ name: 'Jane' });

// Delete
await user.delete();
```

---

**Happy coding with Vasuzex! 🎉**
