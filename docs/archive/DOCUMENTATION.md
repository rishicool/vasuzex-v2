# Vasuzex V2 Documentation

> **Version:** 2.0.0-alpha.1  
> **Architecture:** Hybrid Dependency Management (Root-level + Hoisting)  
> **Package Manager:** pnpm >= 10.0.0  
> **Node.js:** >= 18.0.0

## Table of Contents
- [Installation](#installation)
- [Project Structure](#project-structure)
- [CLI Commands](#cli-commands)
- [Creating New Projects](#creating-new-projects)
- [Generating Apps](#generating-apps)
- [Database Commands](#database-commands)
- [Dependency Management](#dependency-management)
- [V2 Features](#v2-features)

---

## Installation

### Global Installation (Recommended)

```bash
npm install -g vasuzex@2.0.0-alpha.1
# or
pnpm add -g vasuzex@2.0.0-alpha.1
```

### Using npx (No Installation)

```bash
npx create-vasuzex my-project
```

---

## Project Structure

Vasuzex V2 uses a **hybrid dependency management** approach:

```
my-project/
├── package.json              # Root: ALL dependencies centralized here
├── .npmrc                    # Hoisting configuration
├── pnpm-workspace.yaml       # Workspace definition
├── node_modules/             # Single node_modules at root (hoisted)
├── apps/
│   ├── blog/
│   │   ├── api/
│   │   │   └── package.json  # Minimal: scripts only, NO dependencies
│   │   └── web/
│   │       └── package.json  # Minimal: scripts only, NO dependencies
│   └── media-server/
│       └── package.json      # Minimal: scripts only, NO dependencies
├── config/                   # Framework configs
├── database/
│   ├── models/
│   ├── migrations/
│   └── seeders/
└── framework/                # Framework core
```

### Key Architecture Changes in V2

1. **Root Dependencies:** All dependencies in root `package.json`
2. **Minimal App Manifests:** Apps have only scripts, no dependencies
3. **Hoisting:** Single `node_modules` at root via pnpm
4. **Disk Savings:** 38% reduction in disk space (tested)

---

## CLI Commands

### Available Commands

```bash
vasuzex --help
```

#### Project Creation
- `create-vasuzex <project-name>` - Create new Vasuzex project

#### App Generation
- `vasuzex generate:app <name>` - Generate new application
- `vasuzex generate:media-server` - Generate standalone media server
- `vasuzex delete:app <name>` - Delete application

#### Database Commands
- `vasuzex db:create` - Create database if not exists
- `vasuzex migrate` - Run database migrations
- `vasuzex migrate:status` - Show migration status
- `vasuzex migrate:rollback` - Rollback last migration
- `vasuzex db:seed` - Seed the database
- `vasuzex migrate:fresh` - Drop all tables and re-run migrations

#### Make Commands
- `vasuzex make:migration <name>` - Create migration file
- `vasuzex make:seeder <name>` - Create seeder file
- `vasuzex make:model <name>` - Create model file

#### Dependency Management
- `vasuzex add:dep <packages...>` - Add dependency to root and workspace apps

---

## Creating New Projects

### Interactive Setup

```bash
create-vasuzex my-app
```

This will:
1. Create project directory
2. Set up V2 structure with hoisting
3. Add all dependencies to root `package.json`
4. Create `.npmrc` with hoisting config
5. Install dependencies (single `node_modules`)
6. Prompt for template selection:
   - **Minimal** - Empty project (generate apps later)
   - **API Only** - Backend only
   - **Web Only** - Frontend only
   - **Full Stack** - API + Web
   - **API + Media Server** - Backend with media handling

### Manual Setup

```bash
mkdir my-app && cd my-app
npm init -y
npm install vasuzex@2.0.0-alpha.1
```

---

## Generating Apps

### Generate API App

```bash
vasuzex generate:app blog --type api
```

**Creates:**
```
apps/blog/api/
├── package.json          # Minimal: only scripts
├── server.js             # Express server
├── routes/
│   └── index.js
├── controllers/
│   └── ExampleController.js
├── middleware/
│   └── cors.js
└── config/
    └── app.js
```

**Root `package.json` automatically includes:**
- `dev:blog-api` - Development server (nodemon)
- `start:blog-api` - Production server

### Generate Web App

```bash
vasuzex generate:app blog --type web --framework react
```

**Creates:**
```
apps/blog/web/
├── package.json          # Minimal: only scripts
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── index.css
└── public/
```

**Frameworks Available:**
- `react` - React 18.2.0 + Vite
- `vue` - Vue 3.4.0 + Vite
- `svelte` - Svelte 4.2.0 + Vite
- `plain` - Vanilla JS + Vite

**Root `package.json` automatically includes:**
- `dev:blog-web` - Development server (Vite)
- `build:blog-web` - Production build
- `preview:blog-web` - Preview build

### Generate Both API + Web

```bash
vasuzex generate:app blog
```

Generates both API and Web apps in one command.

### Generate Media Server

```bash
vasuzex generate:media-server --port 4003
```

**Creates:**
```
apps/media-server/
├── package.json          # Minimal: only scripts
├── server.js
├── routes/
├── middleware/
└── uploads/
```

---

## Database Commands

### Setup Database

```bash
# Create database
vasuzex db:create

# Run migrations
vasuzex migrate

# Check migration status
vasuzex migrate:status
```

### Create Migration

```bash
vasuzex make:migration create_users_table
```

**Creates:** `database/migrations/YYYY_MM_DD_HHMMSS_create_users_table.js`

### Create Model

```bash
vasuzex make:model User --migration
```

**Creates:**
- `database/models/User.js`
- `database/migrations/YYYY_MM_DD_HHMMSS_create_users_table.js` (if --migration flag)

### Seed Database

```bash
# Create seeder
vasuzex make:seeder UserSeeder

# Run all seeders
vasuzex db:seed

# Run specific seeder
vasuzex db:seed --class UserSeeder
```

### Rollback Migration

```bash
# Rollback last batch
vasuzex migrate:rollback

# Rollback specific steps
vasuzex migrate:rollback --step 2
```

### Fresh Migration

```bash
# Drop all tables and re-migrate
vasuzex migrate:fresh

# Fresh + seed
vasuzex migrate:fresh --seed
```

---

## Dependency Management

### V2 Hybrid Approach

In V2, **all dependencies are in the root `package.json`**. Apps use hoisted dependencies from root `node_modules`.

### Add New Dependency

```bash
# Add to root
vasuzex add:dep lodash

# Add as dev dependency
vasuzex add:dep --dev eslint

# Add multiple packages
vasuzex add:dep lodash axios moment
```

### Pre-installed Dependencies in V2

**Backend:**
- express (5.2.1)
- cors (2.8.5)
- helmet (8.1.0)
- bcryptjs (2.4.3)
- jsonwebtoken (9.0.2)
- joi (17.13.3)
- pg (8.16.3)
- guruorm (2.0.0)
- multer (2.0.2)
- sharp (0.33.5)

**Frontend:**
- react (18.2.0)
- react-dom (18.2.0)
- vue (3.4.0)
- svelte (4.2.0)

**Dev Tools:**
- vite (5.0.0)
- turbo (2.6.1)
- nodemon (3.1.11)
- @vitejs/plugin-react (4.2.1)
- @vitejs/plugin-vue (5.0.0)
- @sveltejs/vite-plugin-svelte (3.0.0)

### Manual Dependency Addition

Edit root `package.json`:

```json
{
  "dependencies": {
    "your-new-package": "^1.0.0"
  }
}
```

Then run:
```bash
pnpm install
```

---

## V2 Features

### 1. Hybrid Dependency Management

**Before (V1):**
```
my-project/
├── node_modules/              # Framework deps
└── apps/
    └── blog/
        ├── api/
        │   ├── package.json   # express, cors, etc.
        │   └── node_modules/  # Duplicate deps
        └── web/
            ├── package.json   # react, vite, etc.
            └── node_modules/  # Duplicate deps
```
**Total:** ~350MB with 2 apps

**After (V2):**
```
my-project/
├── package.json               # ALL dependencies here
├── node_modules/              # Single hoisted node_modules
└── apps/
    └── blog/
        ├── api/
        │   └── package.json   # Scripts only, NO deps
        └── web/
            └── package.json   # Scripts only, NO deps
```
**Total:** ~217MB with 2 apps (38% savings)

### 2. Automatic Script Registration

When you generate an app, scripts are automatically added to root `package.json`:

```json
{
  "scripts": {
    "dev:blog-api": "turbo run dev --filter=blog-api",
    "start:blog-api": "turbo run start --filter=blog-api",
    "dev:blog-web": "turbo run dev --filter=blog-web",
    "build:blog-web": "turbo run build --filter=blog-web"
  }
}
```

### 3. Hoisting Configuration

`.npmrc` automatically created:

```ini
hoist=true
hoist-pattern[]=*
shamefully-hoist=true
shared-workspace-lockfile=true
```

### 4. Workspace Configuration

`pnpm-workspace.yaml` automatically created:

```yaml
packages:
  - 'apps/**/api'
  - 'apps/**/web'
  - 'apps/media-server'
```

### 5. Zero Breaking Changes

- All V1 APIs work in V2
- Same CLI commands
- Same project structure
- Only difference: dependency location

---

## Usage Examples

### Example 1: Create Full Stack App

```bash
# Create project
create-vasuzex my-blog

# Generate app
cd my-blog
vasuzex generate:app blog

# Setup database
vasuzex db:create
vasuzex migrate

# Start development
pnpm dev:blog-api    # API at http://localhost:3000
pnpm dev:blog-web    # Web at http://localhost:5173
```

### Example 2: Add New Feature

```bash
# Create model + migration
vasuzex make:model Post --migration

# Edit migration file
# database/migrations/2025_12_04_120000_create_posts_table.js

# Run migration
vasuzex migrate

# Create seeder
vasuzex make:seeder PostSeeder

# Run seeder
vasuzex db:seed --class PostSeeder
```

### Example 3: Multiple Apps

```bash
# Generate blog app
vasuzex generate:app blog

# Generate admin app
vasuzex generate:app admin

# Generate media server
vasuzex generate:media-server

# All use same root node_modules!
du -sh node_modules  # Single directory
```

---

## Troubleshooting

### Import Not Found

**Problem:** `Cannot find module 'express'`

**Solution:** Ensure dependency is in root `package.json` and hoisting is enabled:

```bash
# Check .npmrc exists
cat .npmrc

# Reinstall
pnpm install
```

### App Not Using Hoisted Dependencies

**Problem:** App trying to install own dependencies

**Solution:** Remove dependencies from app `package.json`:

```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
  // NO dependencies, devDependencies, or peerDependencies
}
```

### Multiple node_modules Directories

**Problem:** Found `apps/blog/api/node_modules`

**Solution:**
```bash
# Remove app-level node_modules
rm -rf apps/*/api/node_modules apps/*/web/node_modules

# Reinstall from root
pnpm install
```

---

## Migration from V1 to V2

### Step 1: Backup Project

```bash
cp -r my-project my-project-backup
```

### Step 2: Update Root package.json

Merge all app dependencies into root:

```bash
# From apps/blog/api/package.json and apps/blog/web/package.json
# Move all dependencies to root package.json
```

### Step 3: Create .npmrc

```bash
cat > .npmrc << 'EOF'
hoist=true
hoist-pattern[]=*
shamefully-hoist=true
shared-workspace-lockfile=true
EOF
```

### Step 4: Clean App package.json Files

Remove dependencies, keep only scripts:

```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### Step 5: Reinstall

```bash
rm -rf node_modules apps/*/api/node_modules apps/*/web/node_modules
pnpm install
```

### Step 6: Test

```bash
pnpm dev:blog-api
pnpm dev:blog-web
```

---

## FAQ

**Q: Why V2?**  
A: 38% disk space savings, faster installs, no dependency conflicts.

**Q: Breaking changes from V1?**  
A: None. Only dependency location changed.

**Q: Can I use npm/yarn?**  
A: V2 requires pnpm >= 10.0.0 for hoisting.

**Q: Do I need to change my code?**  
A: No. All imports work the same.

**Q: What if I need app-specific dependency?**  
A: Add to root `package.json`. All apps can access it.

**Q: Can I use V2 in production?**  
A: Yes. Tested and validated. Currently in alpha for feedback.

---

## Support

- **Issues:** https://github.com/rishicool/vasuzex/issues
- **Docs:** https://github.com/rishicool/vasuzex
- **Version:** 2.0.0-alpha.1

---

**Last Updated:** December 4, 2025  
**Author:** Vasuzex Team
