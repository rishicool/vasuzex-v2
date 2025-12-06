# Vasuzex V2 (Alpha)

> Laravel-inspired Node.js framework with **optimized dependency management**

[![npm version](https://img.shields.io/npm/v/vasuzex.svg)](https://www.npmjs.com/package/vasuzex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-orange)](https://pnpm.io)

---

## STRICT ❌ - NOT FOR PROD USE


## 🆕 What's New in V2?

### **Hybrid Dependency Management**
V2 introduces a revolutionary approach to dependency management in monorepos:

✅ **Single `node_modules`** - All dependencies in one place  
✅ **64% Disk Space Savings** - No duplicate packages across apps  
✅ **Centralized Version Control** - Manage all versions from root  
✅ **Faster CI/CD** - One installation for entire monorepo  
✅ **Zero Config for Apps** - Apps inherit all dependencies automatically  

**Migration Path**: See [MIGRATION_RESULTS.md](./MIGRATION_RESULTS.md)

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 10.0.0 (will be installed automatically if missing)

### Quick Install
```bash
npx create-vasuzex my-app
```

That's it! The installer will:
- ✅ Install pnpm if not present
- ✅ Set up project structure
- ✅ Configure hybrid dependencies
- ✅ Install all dependencies (single node_modules)
- ✅ Generate starter apps (optional)

**Installation Time:** ~30 seconds  
**Disk Space:** 250-300MB (vs 600-800MB in traditional monorepos)

---

## 🚀 Quick Start

### Option 1: Full Stack App (Recommended)

Create a complete full stack application with API backend + Web frontend:

```bash
# Create project
npx create-vasuzex my-app

# Choose "Full Stack (API + Web)" template
# Select web framework (React/Vue/Svelte)
# Configure database (PostgreSQL/MySQL/SQLite)

cd my-app

# All config files are automatically copied to ./config/
# All dependencies installed in root node_modules/

# Run migrations
pnpm db:migrate

# Terminal 1 - Start API server
cd apps/blog/api
pnpm dev

# Terminal 2 - Start web app
cd apps/blog/web
pnpm dev
```

- ✅ API Server: http://localhost:3000
- ✅ Web App: http://localhost:3001
- ✅ All configs in `./config/` directory

### Option 2: Manual App Generation

```bash
# 1. Create minimal project
npx create-vasuzex my-app
cd my-app

# 2. Generate apps manually
pnpm exec vasuzex generate:app blog --type fullstack
# or
pnpm exec vasuzex generate:app shop --type api
pnpm exec vasuzex generate:app admin --type web
```

### Project Structure After Installation

```
my-app/
├── config/                   # ⭐ ALL framework configs copied here
│   ├── app.cjs              # Application settings
│   ├── auth.cjs             # JWT authentication
│   ├── database.cjs         # Database connections
│   ├── filesystems.cjs      # File storage (S3, Local)
│   ├── mail.cjs             # Email settings
│   ├── cache.cjs            # Cache drivers
│   ├── queue.cjs            # Queue jobs
│   ├── session.cjs          # Sessions
│   ├── http.cjs             # HTTP server
│   ├── upload.cjs           # File uploads
│   ├── media.cjs            # Media processing
│   ├── image.cjs            # Image manipulation
│   ├── sms.cjs              # SMS services
│   ├── payment.cjs          # Payment gateways
│   ├── translation.cjs      # Multi-language
│   └── ... (20+ config files)
│
├── apps/
│   └── blog/
│       ├── api/             # Backend Express server
│       │   ├── src/
│       │   │   ├── controllers/    # HTTP controllers
│       │   │   ├── services/       # Business logic
│       │   │   ├── middleware/     # Auth, validation
│       │   │   ├── routes/         # API routes
│       │   │   └── models/         # Database models
│       │   ├── index.js            # Server entry point
│       │   └── package.json        # Scripts only (no deps)
│       │
│       └── web/             # Frontend React/Vue/Svelte
│           ├── src/
│           │   ├── components/
│           │   ├── pages/
│           │   └── services/       # API client
│           ├── index.html
│           ├── vite.config.js
│           └── package.json        # Scripts only (no deps)
│
├── database/
│   ├── models/              # Shared GuruORM models
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
│
├── node_modules/            # ⭐ Single hoisted node_modules (all deps)
├── package.json             # ⭐ ALL dependencies defined here
├── .env                     # Root environment config
├── pnpm-workspace.yaml      # Workspace definition
└── turbo.json               # Build pipeline config
```

**Key Features:**
- ✅ **All configs in `./config/`** - Easily customize any framework feature
- ✅ **Single `node_modules/`** - 64% disk space savings
- ✅ **Centralized dependencies** - Manage versions in one place
- ✅ **Zero config for apps** - Apps inherit all dependencies

---

## 🎯 Full Stack Development

Vasuzex V2 makes full stack development seamless:

### Backend API (Express)
```javascript
// apps/blog/api/index.js
import { BaseApp } from 'vasuzex';

class BlogServer extends BaseApp {
  async setupRoutes() {
    this.app.use('/api', getAllRoutes());
  }
}

const server = new BlogServer();
await server.start();
```

### Frontend Web (React/Vue/Svelte)
```javascript
// apps/blog/web/src/services/api.js
import { createApiClient } from '@vasuzex/client';

export const api = createApiClient({
  baseURL: 'http://localhost:3000/api'
});

// Usage
const posts = await api.get('/posts');
const newPost = await api.post('/posts', { title: 'Hello' });
```

### Authentication Flow
```javascript
// Backend: Auto-generated AuthController
POST /api/auth/register  // Register new user
POST /api/auth/login     // Login (returns JWT)
GET  /api/auth/me        // Get authenticated user
POST /api/auth/logout    // Logout

// Frontend: Auto-configured API client
const { data } = await api.post('/auth/login', credentials);
localStorage.setItem('token', data.token);
api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
```

📖 **[Full Stack Guide →](./docs/getting-started/fullstack-guide.md)**

---

## 🎨 CLI Commands

### Project Creation
```bash
npx create-vasuzex my-app              # Create new project
```

### App Generation
```bash
pnpm exec vasuzex generate:app blog              # Full-stack (prompts for framework)
pnpm exec vasuzex generate:app shop --type api   # API only
pnpm exec vasuzex generate:app admin --type web  # Web only (React/Vue/Svelte)
```

### Database Commands
```bash
pnpm db:migrate                        # Run migrations
pnpm db:rollback                       # Rollback last migration
pnpm db:seed                           # Run seeders
pnpm db:fresh                          # Drop all tables & re-migrate
```

### Make Commands
```bash
pnpm exec vasuzex make:model User               # Create model
pnpm exec vasuzex make:migration create_users   # Create migration
pnpm exec vasuzex make:seeder UserSeeder        # Create seeder
pnpm exec vasuzex make:controller UserController # Create controller
```

### Dependency Management
```bash
pnpm exec vasuzex add:dep axios         # Add dependency to root
pnpm exec vasuzex delete:app blog       # Delete app completely
```

### Development
```bash
pnpm dev                               # Run all apps
pnpm dev:blog-api                      # Run specific API
pnpm dev:blog-web                      # Run specific web app
```

---

## 🛠 Available Dependencies

### Backend Framework
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import multer from 'multer';
```

### Frontend Frameworks
```javascript
import React from 'react';
import { createApp } from 'vue';
import { onMount } from 'svelte';
```

### Database
```javascript
import { DB } from 'vasuzex/Database';
import pg from 'pg';
```

### Utilities
```javascript
import axios from 'axios';
import sharp from 'sharp';
import { Str } from 'vasuzex/Support/Str';
import { Collection } from 'vasuzex/Support/Collection';
```

### Build Tools
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import svelte from '@sveltejs/vite-plugin-svelte';
```

**Full list:** See `package.json` dependencies

---

## 📁 Project Structure

```
vasuzex-v2/
├── node_modules/          # ✅ SINGLE node_modules (247MB)
├── package.json           # All dependencies declared here
├── pnpm-lock.yaml         # Shared lockfile
├── pnpm-workspace.yaml    # Workspace config
├── .npmrc                 # Hoisting configuration
│
├── framework/             # Core framework
│   ├── Foundation/
│   ├── Database/
│   ├── Http/
│   ├── Support/
│   └── Services/
│
├── database/              # Database layer
│   ├── models/
│   ├── migrations/
│   └── seeders/
│
├── config/                # Configuration files
│   ├── app.cjs
│   ├── database.cjs
│   └── ...
│
├── apps/                  # Your applications
│   ├── blog-api/
│   │   ├── api/
│   │   └── web/
│   └── media-server/
│
├── docs/                  # Documentation
│   ├── DEPENDENCY_MANAGEMENT_STRATEGY.md
│   └── IMPORT_ALIASES.md
│
└── examples/              # Working examples
    └── dependency-strategies/
```

---

## 🎯 Core Features

### 1. **Database (GuruORM)**
```javascript
import { DB, Model } from 'vasuzex/Database';

// Query Builder
const users = await DB.table('users')
  .where('active', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .all();

// Eloquent-style Models
class User extends Model {
  static table = 'users';
  
  posts() {
    return this.hasMany(Post, 'user_id');
  }
}

const user = await User.find(1);
const posts = await user.posts();
```

### 2. **HTTP & Routing**
```javascript
import { Router } from 'vasuzex/Http';

const router = Router();

router.get('/users', async (req, res) => {
  const users = await User.all();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});
```

### 3. **Validation (Joi)**
```javascript
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().min(18).max(120)
});

const { error, value } = schema.validate(req.body);
```

### 4. **Authentication**
```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hash password
const hash = await bcrypt.hash(password, 10);

// Generate JWT
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

// Verify JWT
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 5. **File Uploads**
```javascript
import multer from 'multer';
import sharp from 'sharp';

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
  // Resize image
  await sharp(req.file.path)
    .resize(800, 600)
    .toFile('uploads/resized.jpg');
  
  res.json({ success: true });
});
```

### 6. **Services (Location, GeoIP, SMS, etc.)**
```javascript
import { LocationManager, GeoIPManager, SmsManager } from 'vasuzex';

// Geocoding
const location = await LocationManager.geocode('New York');

// GeoIP Lookup
const geo = await GeoIPManager.lookup('8.8.8.8');

// Send SMS
await SmsManager.send('+1234567890', 'Hello!');
```

---

## 🔧 Configuration

### .npmrc (Hoisting Config)
```ini
hoist=true
hoist-pattern[]=*
shamefully-hoist=true
shared-workspace-lockfile=true
strict-peer-dependencies=false
auto-install-peers=true
```

**This is the magic!** Forces all dependencies to root `node_modules`.

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/**/api'
  - 'apps/**/web'
  - 'apps/media-server'
```

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASS=secret

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
```

---

## 📊 Dependency Management

### Adding New Dependencies

**For All Apps (Recommended):**
```bash
# Add to root package.json
pnpm add axios -w
```

**For Specific App (If Really Needed):**
```bash
# Add to app package.json
cd apps/my-api
pnpm add some-package
```

**Note:** Root dependencies are automatically available to all apps via hoisting.

### Version Overrides
If an app needs a different version:

```json
// Root package.json
{
  "pnpm": {
    "overrides": {
      "express": "^5.2.1",
      "react": "^18.2.0"
    }
  }
}
```

---

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Tests
```bash
pnpm test -- formatter.test.js
```

### Test Coverage
```bash
pnpm test:coverage
```

### Watch Mode
```bash
pnpm test:watch
```

---

## 🏗 Build & Deploy

### Development
```bash
# All apps
pnpm dev

# Specific app
turbo run dev --filter=my-api
```

### Production Build
```bash
pnpm build
```

### Production Run
```bash
pnpm start
```

---

## 📚 Documentation

### Getting Started
- 🚀 [**Full Stack Setup**](./docs/FULL_STACK_SETUP.md) - Quick reference for fullstack apps
- 📖 [Full Stack Guide](./docs/getting-started/fullstack-guide.md) - Complete fullstack tutorial
- 📦 [Installation](./docs/getting-started/installation.md) - Detailed setup guide
- 🏗️ [Project Structure](./docs/getting-started/project-structure.md) - Understanding the structure

### Advanced
- 🔄 [Migration Results](./MIGRATION_RESULTS.md) - V2 migration details
- 📦 [Dependency Strategy](./docs/DEPENDENCY_MANAGEMENT_STRATEGY.md) - Why hybrid approach?
- 🔗 [Import Aliases](./docs/IMPORT_ALIASES.md) - How to import modules
- 🗄️ [Database Guide](./docs/database/getting-started.md) - Database & migrations

### Configuration
All 26 config files are in `./config/` directory:
- `auth.cjs`, `database.cjs`, `mail.cjs`, `sms.cjs`, `payment.cjs`, etc.
- See [Full Stack Setup](./docs/FULL_STACK_SETUP.md) for complete list

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

MIT © Vasuzex Team

---

## 🆚 V1 vs V2 Comparison

| Feature | V1 (1.0.11) | V2 (2.0.0-alpha) |
|---------|-------------|-------------------|
| **Dependency Management** | Per-app node_modules | Centralized hoisting |
| **Disk Space** | 600-800MB | 247MB |
| **Installation Time** | ~30-40s | ~12s |
| **App Setup** | Full package.json | Scripts only |
| **Version Control** | Per-app | Centralized |
| **CI/CD Speed** | Slower | Faster |
| **Breaking Changes** | - | None (backward compatible) |

---

## 🔗 Links

- **NPM:** https://www.npmjs.com/package/vasuzex
- **GitHub:** https://github.com/rishicool/vasuzex
- **Documentation:** [/docs](./docs)
- **Examples:** [/examples](./examples)

---

## ⚡️ Quick Examples

### REST API
```javascript
import express from 'express';
import { DB } from 'vasuzex/Database';

const app = express();
app.use(express.json());

app.get('/api/users', async (req, res) => {
  const users = await DB.table('users').all();
  res.json(users);
});

app.listen(3000);
```

### React SSR
```javascript
import { renderToString } from 'react-dom/server';
import App from './App';

const html = renderToString(<App />);
```

### Vue 3 App
```javascript
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

### Database Migration
```javascript
import { DB } from 'vasuzex/Database';

await DB.schema().createTable('users', (table) => {
  table.id();
  table.string('name');
  table.string('email').unique();
  table.timestamps();
});
```

---

## 🎉 Why Vasuzex V2?

1. **Laravel-Inspired** - Familiar syntax for PHP developers
2. **Monorepo Ready** - Built for multi-app projects
3. **Optimized Dependencies** - 64% smaller than traditional setup
4. **Full-Stack** - Backend + Frontend in one framework
5. **Modern Stack** - ES Modules, async/await, latest Node.js
6. **Type Safe** - TypeScript support (coming soon)
7. **Battle Tested** - Proven in production environments

---

**Star ⭐️ this repo if you find it helpful!**

---

**Questions?** Open an issue or discussion on GitHub.

**Last Updated:** December 4, 2024  
**Version:** 2.0.0-alpha.1  
**Status:** 🚧 Alpha (Ready for testing)
