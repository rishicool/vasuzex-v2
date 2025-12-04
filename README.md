# Vasuzex V2 (Alpha)

> Laravel-inspired Node.js framework with **optimized dependency management**

[![npm version](https://img.shields.io/npm/v/vasuzex.svg)](https://www.npmjs.com/package/vasuzex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-orange)](https://pnpm.io)

---

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
- pnpm >= 10.0.0

### Install pnpm (if not installed)
```bash
npm install -g pnpm@10.0.0
```

### Clone and Install
```bash
git clone https://github.com/rishicool/vasuzex.git vasuzex-v2
cd vasuzex-v2
pnpm install
```

**Installation Time:** ~12 seconds  
**Disk Space:** 247MB (vs 600-800MB in traditional monorepos)

---

## 🚀 Quick Start

### Create Your First App
```bash
# Using the CLI
npx vasuzex make:app my-api

# Or manually create
mkdir -p apps/my-api
cd apps/my-api
```

### Minimal App Structure
```
apps/my-api/
├── src/
│   ├── index.js
│   └── controllers/
├── package.json  (only scripts, NO dependencies!)
└── .env
```

### App package.json (Minimal!)
```json
{
  "name": "my-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

**No dependencies needed!** Apps automatically use hoisted dependencies from root.

### Sample API (src/index.js)
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DB } from 'vasuzex/Database';

const app = express();

// Middleware (all from root node_modules)
app.use(cors());
app.use(helmet());
app.use(express.json());

// Database (GuruORM)
const db = DB.connection();

app.get('/users', async (req, res) => {
  const users = await db.table('users').all();
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

**All imports work automatically!** No need to install express, cors, helmet, etc.

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

- [Migration Results](./MIGRATION_RESULTS.md) - V2 migration details
- [Dependency Strategy](./docs/DEPENDENCY_MANAGEMENT_STRATEGY.md) - Why hybrid approach?
- [Import Aliases](./docs/IMPORT_ALIASES.md) - How to import modules
- [Getting Started](./docs/getting-started/installation.md) - Detailed setup guide

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
