# Vasuzex V2 - Full Stack Application Guide

Complete guide for building full stack applications with Vasuzex V2.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
- [Backend API Development](#backend-api-development)
- [Frontend Web Development](#frontend-web-development)
- [Database Management](#database-management)
- [Authentication Flow](#authentication-flow)
- [API Client Integration](#api-client-integration)
- [Deployment](#deployment)

---

## 🚀 Quick Start

### Create Full Stack Project

```bash
# Using npx (recommended)
npx create-vasuzex my-project

# Or using pnpm
pnpm create vasuzex my-project

# Or using npm
npm create vasuzex my-project
```

### Select Options

When prompted:
- **Template**: Choose `Full Stack (API + Web)`
- **App Name**: Enter your app name (e.g., `blog`, `shop`, `admin`)
- **Web Framework**: Choose `React`, `Vue.js`, `Svelte`, or `Vanilla JS`
- **Database**: Choose `PostgreSQL`, `MySQL`, or `SQLite`
- **Configure Database**: Select `Yes` to configure now or `No` to configure later

### Start Development

```bash
cd my-project

# Terminal 1 - Start API Server
cd apps/blog/api
pnpm dev

# Terminal 2 - Start Web App
cd apps/blog/web
pnpm dev
```

- **API Server**: http://localhost:3000
- **Web App**: http://localhost:3001

---

## 📁 Project Structure

```
my-project/
├── config/                    # All framework configurations (copied from vasuzex-v2)
│   ├── app.cjs               # Application settings
│   ├── auth.cjs              # Authentication config
│   ├── database.cjs          # Database connections
│   ├── filesystems.cjs       # File storage config
│   ├── mail.cjs              # Email settings
│   ├── cache.cjs             # Cache drivers
│   ├── queue.cjs             # Queue jobs
│   ├── session.cjs           # Session management
│   ├── logging.cjs           # Logging config
│   ├── http.cjs              # HTTP server config
│   ├── cors.cjs              # CORS settings
│   ├── security.cjs          # Security settings
│   ├── upload.cjs            # File upload config
│   ├── media.cjs             # Media processing
│   ├── image.cjs             # Image manipulation
│   ├── sms.cjs               # SMS services
│   ├── notification.cjs      # Push notifications
│   ├── payment.cjs           # Payment gateways
│   ├── translation.cjs       # Multi-language
│   ├── location.cjs          # Geolocation
│   ├── geoip.cjs             # IP geolocation
│   └── formatter.cjs         # Indian phone/currency formatters
│
├── database/
│   ├── models/               # Shared database models
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── migrations/           # Database migrations
│   │   └── 2025_12_03_202543_create_users_table.js
│   └── seeders/              # Database seeders
│       └── UserSeeder.js
│
├── apps/                     # Your applications
│   └── blog/
│       ├── api/              # Backend API server
│       │   ├── src/
│       │   │   ├── controllers/    # HTTP controllers
│       │   │   │   ├── AuthController.js
│       │   │   │   └── BaseController.js
│       │   │   ├── models/         # App-specific models (uses ../../../database/models)
│       │   │   │   └── User.js
│       │   │   ├── services/       # Business logic
│       │   │   │   └── AuthService.js
│       │   │   ├── middleware/     # Custom middleware
│       │   │   │   └── errorHandler.js
│       │   │   ├── routes/         # API routes
│       │   │   │   ├── auth.js
│       │   │   │   └── index.js
│       │   │   ├── requests/       # Request validation
│       │   │   │   └── auth.js
│       │   │   └── helpers/        # Utility functions
│       │   │       └── env.js
│       │   ├── index.js            # App entry point (BlogServer class)
│       │   ├── package.json
│       │   └── .env
│       │
│       └── web/              # Frontend web app
│           ├── src/
│           │   ├── components/     # React/Vue/Svelte components
│           │   ├── pages/          # Page components
│           │   ├── services/       # API client services
│           │   │   └── api.js
│           │   ├── hooks/          # Custom hooks (React)
│           │   ├── stores/         # State management
│           │   ├── utils/          # Utility functions
│           │   ├── App.jsx
│           │   └── main.jsx
│           ├── public/             # Static assets
│           ├── index.html
│           ├── package.json
│           ├── vite.config.js
│           └── .env
│
├── node_modules/             # Centralized dependencies (all packages share)
├── .env                      # Root environment config
├── package.json              # Root package with all dependencies
├── pnpm-workspace.yaml       # Workspace configuration
├── turbo.json                # Turborepo build config
└── README.md
```

---

## ⚙️ Configuration Files

All configuration files are located in the **`config/`** directory at the project root. These files are copied from `vasuzex-v2/config/` when you create a new project.

### Key Configuration Files

#### 1. `config/app.cjs` - Application Settings
```javascript
module.exports = {
  name: process.env.APP_NAME || 'Vasuzex',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  url: process.env.APP_URL || 'http://localhost:3000',
  timezone: 'UTC',
  locale: 'en',
};
```

#### 2. `config/database.cjs` - Database Configuration
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
    mysql: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
};
```

#### 3. `config/auth.cjs` - Authentication Settings
```javascript
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  guards: {
    api: {
      driver: 'jwt',
      provider: 'users',
    },
  },
  providers: {
    users: {
      driver: 'database',
      model: 'User',
    },
  },
};
```

#### 4. `config/http.cjs` - HTTP Server Config
```javascript
module.exports = {
  port: process.env.PORT || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
};
```

### All Available Config Files

| File | Purpose |
|------|---------|
| `app.cjs` | Application-wide settings |
| `auth.cjs` | Authentication & authorization |
| `database.cjs` | Database connections |
| `cache.cjs` | Cache drivers (Redis, Memory) |
| `session.cjs` | Session management |
| `filesystems.cjs` | File storage (Local, S3, etc.) |
| `mail.cjs` | Email configuration (SMTP, etc.) |
| `queue.cjs` | Queue jobs (Redis, Database) |
| `logging.cjs` | Logging configuration |
| `http.cjs` | HTTP server settings |
| `security.cjs` | Security headers, CSP |
| `upload.cjs` | File upload settings |
| `media.cjs` | Media processing |
| `image.cjs` | Image manipulation (Sharp) |
| `sms.cjs` | SMS services (Twilio, etc.) |
| `notification.cjs` | Push notifications |
| `payment.cjs` | Payment gateways |
| `translation.cjs` | Multi-language support |
| `location.cjs` | Geolocation services |
| `geoip.cjs` | IP-based geolocation |
| `formatter.cjs` | Indian phone/currency formatters |

---

## 🔧 Backend API Development

### Project Structure

The API server follows a clean architecture pattern:

```
apps/blog/api/
├── src/
│   ├── controllers/      # Handle HTTP requests
│   ├── services/         # Business logic
│   ├── middleware/       # Custom middleware
│   ├── routes/           # Route definitions
│   ├── requests/         # Request validation
│   └── helpers/          # Utility functions
└── index.js              # App entry (extends BaseApp)
```

### Main App File (`index.js`)

```javascript
import { BaseApp } from 'vasuzex';
import { env } from './helpers/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getAllRoutes } from './routes/index.js';

class BlogServer extends BaseApp {
  constructor() {
    super({
      serviceName: process.env.APP_NAME || 'blog-api',
      corsOrigin: env('CORS_ORIGIN', 'http://localhost:3001')
    });
  }

  async setupRoutes() {
    this.app.use('/api', getAllRoutes());
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }
}

const server = new BlogServer();
await server.start();
```

### Creating Controllers

```javascript
// src/controllers/PostController.js
import { BaseController } from './BaseController.js';
import Post from '../models/Post.js';

export class PostController extends BaseController {
  async index(req, res) {
    try {
      const posts = await Post.findAll();
      return this.success(res, posts, 'Posts retrieved successfully');
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async store(req, res) {
    try {
      const post = await Post.create(req.body);
      return this.success(res, post, 'Post created', 201);
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}
```

### Creating Routes

```javascript
// src/routes/posts.js
import { Router } from 'express';
import { PostController } from '../controllers/PostController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const postController = new PostController();

router.get('/', (req, res) => postController.index(req, res));
router.post('/', authenticate, (req, res) => postController.store(req, res));

export default router;
```

### Environment Variables (`.env`)

```env
# App
APP_NAME=blog-api
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:3000
PORT=3000

# Database
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=blog_db
DB_USERNAME=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3001
```

---

## 🎨 Frontend Web Development

### React Example

```javascript
// src/services/api.js
import { createApiClient } from '@vasuzex/client';

export const api = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// src/pages/Login.jsx
import { useState } from 'react';
import { api } from '../services/api';

export function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 💾 Database Management

### Create Migration

```bash
pnpm make:migration create_posts_table
```

```javascript
// database/migrations/2025_12_07_create_posts_table.js
export async function up(db) {
  await db.schema.createTable('posts', (table) => {
    table.increments('id');
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('title');
    table.text('content');
    table.timestamps();
  });
}

export async function down(db) {
  await db.schema.dropTable('posts');
}
```

### Create Model

```bash
pnpm make:model Post
```

```javascript
// database/models/Post.js
import { Model } from 'vasuzex/Database';

export default class Post extends Model {
  static tableName = 'posts';
  
  static relationships = {
    user: {
      type: 'belongsTo',
      model: 'User',
      foreignKey: 'user_id'
    }
  };
}
```

### Run Migrations

```bash
# Run all pending migrations
pnpm db:migrate

# Check migration status
pnpm db:migrate:status

# Rollback last migration
pnpm db:rollback

# Fresh migrate + seed
pnpm db:reset
```

### Create Seeder

```bash
pnpm make:seeder PostSeeder
```

```javascript
// database/seeders/PostSeeder.js
import Post from '../models/Post.js';

export default class PostSeeder {
  async run() {
    await Post.create({
      user_id: 1,
      title: 'Welcome to Vasuzex V2',
      content: 'This is your first post!'
    });
  }
}
```

---

## 🔐 Authentication Flow

### Backend - Auth Controller

Already generated in `src/controllers/AuthController.js`:

```javascript
export class AuthController extends BaseController {
  async register(req, res) {
    // Hash password, create user, return JWT token
  }

  async login(req, res) {
    // Validate credentials, return JWT token
  }

  async me(req, res) {
    // Return authenticated user info
  }

  async logout(req, res) {
    // Optional: Blacklist token
  }
}
```

### Frontend - Auth Hook (React)

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return { user, loading, login, logout };
}
```

---

## 🌐 API Client Integration

### Using Vasuzex Client Package

```javascript
// Frontend: src/services/api.js
import { createApiClient } from '@vasuzex/client';

export const api = createApiClient({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT token
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor
api.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Making API Calls

```javascript
// GET request
const posts = await api.get('/posts');

// POST request
const newPost = await api.post('/posts', {
  title: 'My Post',
  content: 'Hello world'
});

// PUT request
const updated = await api.put(`/posts/${id}`, { title: 'Updated' });

// DELETE request
await api.delete(`/posts/${id}`);
```

---

## 🚀 Deployment

### Production Build

```bash
# Build API
cd apps/blog/api
pnpm build

# Build Web
cd apps/blog/web
pnpm build
```

### Environment Variables (Production)

```env
# .env (production)
NODE_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=postgres
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=production_db
DB_USERNAME=your-username
DB_PASSWORD=your-secure-password

JWT_SECRET=your-very-secure-secret-change-this
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment (Example)

```dockerfile
# Dockerfile (API)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

---

## 📝 Best Practices

1. **Configuration Management**
   - All configs in `config/` directory
   - Use environment variables for sensitive data
   - Never commit `.env` files

2. **Database**
   - Always use migrations for schema changes
   - Keep models in `database/models/` for sharing between apps
   - Use seeders for test data

3. **API Design**
   - Follow RESTful conventions
   - Use proper HTTP status codes
   - Validate all inputs using `requests/`

4. **Frontend**
   - Use `@vasuzex/client` for API calls
   - Store JWT tokens securely
   - Handle errors gracefully

5. **Security**
   - Use strong JWT secrets
   - Enable CORS only for trusted origins
   - Validate and sanitize all inputs

---

## 🔗 Related Documentation

- [Installation Guide](./installation.md)
- [Project Structure](./project-structure.md)
- [Database Guide](../database/getting-started.md)
- [CLI Commands](../cli/commands.md)
- [API Reference](../api/README.md)

---

**Happy Full Stack Development with Vasuzex V2! 🎉**
