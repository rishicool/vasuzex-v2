# Full Stack Setup - Quick Reference

## 🎯 What You Get

When you install Vasuzex V2 with the **Full Stack template**, you get:

### ✅ Complete Backend API
- Express.js server with BaseApp pattern
- Authentication system (JWT-based)
  - `/api/auth/register` - User registration
  - `/api/auth/login` - User login (returns JWT)
  - `/api/auth/me` - Get authenticated user
  - `/api/auth/logout` - Logout
- Clean architecture (Controllers → Services → Models)
- Request validation (Joi schemas)
- Error handling middleware
- CORS configured for frontend

### ✅ Complete Frontend Web
- React/Vue/Svelte app (your choice)
- Vite for fast HMR and build
- Pre-configured API client (`@vasuzex/client`)
- Authentication integration ready
- Environment variables configured

### ✅ All Config Files in Root
**Location: `./config/`** (copied from vasuzex-v2/config/)

All 26 configuration files:
```
config/
├── app.cjs              # Application settings
├── auth.cjs             # JWT authentication
├── database.cjs         # Database connections
├── filesystems.cjs      # File storage (S3, Local, etc.)
├── mail.cjs             # Email configuration
├── cache.cjs            # Cache drivers (Redis, Memory)
├── queue.cjs            # Queue jobs
├── session.cjs          # Session management
├── http.cjs             # HTTP server settings
├── cors.cjs             # CORS configuration
├── security.cjs         # Security headers
├── logging.cjs          # Logging configuration
├── upload.cjs           # File upload settings
├── media.cjs            # Media processing
├── image.cjs            # Image manipulation
├── sms.cjs              # SMS services (Twilio, etc.)
├── notification.cjs     # Push notifications
├── payment.cjs          # Payment gateways
├── translation.cjs      # Multi-language support
├── location.cjs         # Geolocation services
├── geoip.cjs            # IP geolocation
├── formatter.cjs        # Indian phone/currency formatters
├── broadcasting.cjs     # WebSocket/events
├── hashing.cjs          # Password hashing
├── services.cjs         # Service providers
└── cdn.cjs              # CDN configuration
```

### ✅ Shared Database Layer
```
database/
├── models/              # Shared models (User, Post, etc.)
├── migrations/          # Database schema migrations
└── seeders/             # Database seeders
```

### ✅ Centralized Dependencies
**All dependencies in root `node_modules/`**
- No duplicate packages
- 64% disk space savings
- Single version for entire project
- Apps inherit all dependencies automatically

---

## 🚀 One-Command Setup

```bash
# Create full stack project
npx create-vasuzex my-project

# Select options:
# ✅ Template: Full Stack (API + Web)
# ✅ App name: blog
# ✅ Web framework: React (or Vue/Svelte)
# ✅ Database: PostgreSQL (or MySQL/SQLite)
# ✅ Configure now: Yes

cd my-project

# Everything is ready!
# - config/ copied ✅
# - node_modules/ installed ✅
# - API generated ✅
# - Web generated ✅
# - Database configured ✅
```

---

## 📂 What Gets Generated

```
my-project/
├── config/                    # ⭐ ALL 26 config files
│   ├── app.cjs
│   ├── auth.cjs
│   ├── database.cjs
│   └── ... (23 more)
│
├── apps/
│   └── blog/
│       ├── api/               # Backend Express server
│       │   ├── src/
│       │   │   ├── controllers/
│       │   │   │   ├── AuthController.js
│       │   │   │   └── BaseController.js
│       │   │   ├── services/
│       │   │   │   └── AuthService.js
│       │   │   ├── middleware/
│       │   │   │   ├── auth.js
│       │   │   │   └── errorHandler.js
│       │   │   ├── routes/
│       │   │   │   ├── auth.js
│       │   │   │   └── index.js
│       │   │   ├── requests/
│       │   │   │   └── auth.js
│       │   │   ├── models/
│       │   │   │   └── User.js (symlinked to ../../../database/models/)
│       │   │   └── helpers/
│       │   │       └── env.js
│       │   ├── index.js       # BlogServer class
│       │   ├── package.json   # Scripts only
│       │   └── .env
│       │
│       └── web/               # Frontend React/Vue/Svelte
│           ├── src/
│           │   ├── components/
│           │   ├── pages/
│           │   ├── services/
│           │   │   └── api.js  # Pre-configured API client
│           │   ├── App.jsx
│           │   └── main.jsx
│           ├── index.html
│           ├── vite.config.js
│           ├── package.json    # Scripts only
│           └── .env
│
├── database/
│   ├── models/
│   │   └── User.js
│   ├── migrations/
│   │   └── 2025_12_03_202543_create_users_table.js
│   └── seeders/
│       └── UserSeeder.js
│
├── node_modules/              # ⭐ Centralized (414MB)
├── package.json               # ⭐ ALL dependencies
├── .env                       # Root config
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🔧 Configuration Files Explained

### Key Config Files You'll Use

#### 1. `config/auth.cjs` - Authentication
```javascript
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,      // Change in .env
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  guards: {
    api: {
      driver: 'jwt',
      provider: 'users',
    },
  },
};
```

#### 2. `config/database.cjs` - Database
```javascript
module.exports = {
  default: process.env.DB_CONNECTION || 'postgres',
  connections: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
};
```

#### 3. `config/http.cjs` - HTTP Server
```javascript
module.exports = {
  port: process.env.PORT || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
};
```

#### 4. `config/filesystems.cjs` - File Storage
```javascript
module.exports = {
  default: process.env.FILESYSTEM_DRIVER || 'local',
  disks: {
    local: {
      driver: 'local',
      root: process.env.STORAGE_PATH || './storage/app',
    },
    s3: {
      driver: 's3',
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION,
      bucket: process.env.AWS_BUCKET,
    },
  },
};
```

#### 5. `config/mail.cjs` - Email
```javascript
module.exports = {
  default: process.env.MAIL_MAILER || 'smtp',
  mailers: {
    smtp: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT || 587,
      username: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PASSWORD,
      encryption: process.env.MAIL_ENCRYPTION || 'tls',
    },
  },
};
```

---

## 🎯 Development Workflow

### Step 1: Configure Database
Edit `.env` in project root:
```env
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=my_project_db
DB_USERNAME=postgres
DB_PASSWORD=secret
```

### Step 2: Run Migrations
```bash
pnpm db:migrate
```

### Step 3: Start Development Servers

**Terminal 1 - API:**
```bash
cd apps/blog/api
pnpm dev

# API running at http://localhost:3000
# Health check: http://localhost:3000/health
# Auth API: http://localhost:3000/api/auth/*
```

**Terminal 2 - Web:**
```bash
cd apps/blog/web
pnpm dev

# Web running at http://localhost:3001
# Auto-configured to call http://localhost:3000/api
```

### Step 4: Test Authentication

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get User (with token):**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🌐 Frontend Integration

### Pre-configured API Client

Already set up in `apps/blog/web/src/services/api.js`:

```javascript
import { createApiClient } from '@vasuzex/client';

export const api = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Auto-attach token
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

### Usage in Components

```javascript
// Login component
import { api } from '../services/api';

const handleLogin = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    // Redirect to dashboard
  } catch (error) {
    console.error(error.response?.data?.message);
  }
};

// Fetch data
const posts = await api.get('/posts');
const newPost = await api.post('/posts', { title: 'Hello' });
```

---

## 📦 All Dependencies Available

Since all dependencies are in root `node_modules/`, you can use:

### Backend
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import multer from 'multer';
import sharp from 'sharp';
import axios from 'axios';
import pg from 'pg';
```

### Frontend
```javascript
import React from 'react';
import { createApp } from 'vue';
import { onMount } from 'svelte';
import axios from 'axios';
```

### Framework
```javascript
import { BaseApp } from 'vasuzex';
import { DB, Model } from 'vasuzex/Database';
import { Str, Collection } from 'vasuzex/Support';
```

---

## 🔗 Next Steps

1. ✅ **Read the Full Guide**: [`docs/getting-started/fullstack-guide.md`](./getting-started/fullstack-guide.md)
2. ✅ **Customize Configs**: Edit files in `./config/` as needed
3. ✅ **Create Models**: `pnpm make:model Post`
4. ✅ **Create Controllers**: `pnpm exec vasuzex make:controller PostController`
5. ✅ **Add Routes**: Edit `apps/blog/api/src/routes/index.js`
6. ✅ **Build UI**: Create components in `apps/blog/web/src/components/`

---

## 🎉 Summary

**You have:**
- ✅ Complete backend API with authentication
- ✅ Complete frontend web app
- ✅ All 26 config files in `./config/`
- ✅ Shared database models and migrations
- ✅ Centralized dependencies (64% smaller)
- ✅ Pre-configured development setup
- ✅ Ready to build your app!

**Commands:**
```bash
# Development
pnpm dev              # Start all apps
cd apps/blog/api && pnpm dev    # API only
cd apps/blog/web && pnpm dev    # Web only

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:reset         # Fresh + seed

# Generate
pnpm make:model Post
pnpm make:migration create_posts
pnpm exec vasuzex make:controller PostController
```

---

**Happy coding! 🚀**
