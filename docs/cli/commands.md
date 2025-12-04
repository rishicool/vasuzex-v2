# Vasuzex CLI Commands Reference

> **⚠️ WARNING: DEVELOPMENT VERSION**  
> This framework is currently under active development and is **NOT recommended for production use**.  
> Use at your own risk. APIs may change without notice. Expect bugs and breaking changes.

Complete reference for all Vasuzex CLI commands.

---

## Table of Contents

- [Installation](#installation)
- [Project Creation](#project-creation)
- [Application Generation](#application-generation)
- [Database Commands](#database-commands)
- [Code Generation](#code-generation)
- [Dependency Management](#dependency-management)
- [Command Syntax](#command-syntax)

---

## Installation

### Global Installation

```bash
# Install globally (recommended for developers)
npm install -g vasuzex

# Verify installation
vasuzex --version
create-vasuzex --version
```

### Using NPX (No Installation)

```bash
# Create project without installing
npx create-vasuzex my-app

# Run vasuzex commands
npx vasuzex generate:app my-api
```

### Local Project Usage

```bash
# In project directory
npx vasuzex <command>

# Or via package.json scripts
pnpm vasuzex <command>
```

---

## Project Creation

### `create-vasuzex`

Create a new Vasuzex project with interactive setup.

**Usage:**
```bash
create-vasuzex <project-name>
# or
npx create-vasuzex <project-name>
```

**Arguments:**
- `<project-name>` - Name of the project directory (required)

**Interactive Prompts:**

1. **Choose starter template:**
   - Minimal (Empty project - generate apps later)
   - With Blog API
   - With Media Server
   - Full Stack (Blog + Media)

2. **Choose database:**
   - PostgreSQL
   - MySQL
   - SQLite

3. **Configure database connection now?**
   - Yes: Enter host, port, database name, username, password
   - No: Configure later in `.env`

**Examples:**

```bash
# Create minimal project
npx create-vasuzex my-app

# Create with global install
create-vasuzex my-blog-api

# Project name validation
create-vasuzex my_app      # Valid
create-vasuzex my-app      # Valid
create-vasuzex My-App      # Valid
create-vasuzex my app      # Invalid (spaces not allowed)
```

**What it does:**

1. ✅ Creates project directory
2. ✅ Copies framework stubs
3. ✅ Generates `package.json` with project name
4. ✅ Creates `.env` file with database config
5. ✅ Installs dependencies via pnpm
6. ✅ Sets up import aliases
7. ✅ Copies starter apps (if selected)
8. ✅ Initializes Git repository
9. ✅ Creates initial commit

**After Creation:**

```bash
cd my-app
pnpm install  # If not done automatically
pnpm db:migrate
pnpm dev
```

---

## Application Generation

### `generate:app`

Generate a new application within your project.

**Usage:**
```bash
vasuzex generate:app <name> [options]
```

**Arguments:**
- `<name>` - Application name (required)

**Options:**
- `-t, --type <type>` - App type: `api`, `web`, or omit for both

**Examples:**

```bash
# Generate both API and Web
vasuzex generate:app blog

# Generate only API
vasuzex generate:app blog --type api
vasuzex generate:app blog -t api

# Generate only Web
vasuzex generate:app shop --type web
vasuzex generate:app shop -t web
```

**Generated Structure (API):**

```
apps/blog/
└── api/
    ├── .env
    ├── .env.example
    ├── package.json
    ├── config/
    │   └── app.cjs
    └── src/
        ├── index.js           # Framework bootstrap
        ├── server.js          # Express server
        ├── controllers/       # HTTP controllers
        │   ├── BaseController.js
        │   └── AuthController.js
        ├── middleware/        # Custom middleware
        │   ├── authMiddleware.js
        │   └── errorHandler.js
        ├── models/           # Eloquent models
        │   └── User.js
        ├── routes/           # Route definitions
        │   ├── index.js
        │   └── auth.routes.js
        ├── services/         # Business logic
        │   └── AuthService.js
        └── requests/         # Form validation
            └── AuthRequests.js
```

**What it does:**

1. ✅ Creates app directory structure
2. ✅ Generates MVC boilerplate
3. ✅ Creates `package.json` with dependencies
4. ✅ Adds dev/start scripts to root `package.json`
5. ✅ Sets up example routes and controllers
6. ✅ Configures environment files

**Start Generated App:**

```bash
# From root
pnpm dev:blog-api

# From app directory
cd apps/blog/api
pnpm dev
```

---

### `generate:media-server`

Generate a standalone media processing server.

**Usage:**
```bash
vasuzex generate:media-server [options]
```

**Options:**
- `-p, --port <port>` - Server port (default: 4003)

**Examples:**

```bash
# Generate with default port (4003)
vasuzex generate:media-server

# Generate with custom port
vasuzex generate:media-server --port 5000
vasuzex generate:media-server -p 5000
```

**Generated Structure:**

```
apps/media-server/
├── .env
├── .env.example
├── package.json
├── nodemon.json
├── README.md
├── config/
│   └── app.cjs
└── src/
    ├── index.js
    ├── controllers/
    │   └── ImageController.js
    └── routes/
        ├── index.js
        └── image.routes.js
```

**Features:**

- ✅ Image upload endpoint
- ✅ Dynamic resize/crop/optimize
- ✅ Multiple storage backends
- ✅ Sharp image processing
- ✅ CORS enabled
- ✅ Health check endpoint

**Start Media Server:**

```bash
pnpm dev:media-server

# Or from app directory
cd apps/media-server
pnpm dev
```

**Usage:**

```bash
# Upload image
curl -X POST http://localhost:4003/api/upload \
  -F "image=@/path/to/image.jpg"

# Get resized image
curl "http://localhost:4003/api/media/image.jpg?width=300&height=200"
```

---

### `delete:app`

Delete an application and cleanup references.

**Usage:**
```bash
vasuzex delete:app <name> [options]
```

**Arguments:**
- `<name>` - Application name (required)

**Options:**
- `-t, --type <type>` - App type: `api`, `web`, or omit to delete entire app
- `-f, --force` - Force delete without confirmation

**Examples:**

```bash
# Delete entire app (prompts confirmation)
vasuzex delete:app blog

# Delete only API
vasuzex delete:app blog --type api

# Force delete without confirmation
vasuzex delete:app blog --force
vasuzex delete:app blog -f

# Delete specific type with force
vasuzex delete:app shop --type web --force
```

**What it does:**

1. ⚠️ Confirms deletion (unless --force)
2. ✅ Removes app directory
3. ✅ Removes scripts from root `package.json`
4. ✅ Cleans up references

**Warning:** This action is irreversible. Make sure to backup before deleting.

---

## Database Commands

### `db:create`

Create database if it doesn't exist.

**Usage:**
```bash
vasuzex db:create
```

**Examples:**

```bash
vasuzex db:create
```

**What it does:**

1. Reads database config from `.env`
2. Connects to database server
3. Creates database if it doesn't exist
4. Confirms success

**Supported Databases:**
- PostgreSQL
- MySQL
- SQLite (auto-created on first use)

---

### `migrate`

Run all pending database migrations.

**Usage:**
```bash
vasuzex migrate
```

**Examples:**

```bash
vasuzex migrate

# Via package.json script
pnpm db:migrate
```

**What it does:**

1. Checks for pending migrations
2. Runs migrations in order
3. Updates migrations table
4. Shows success/failure for each

**Output:**

```
Running migrations...
✓ 2025_12_03_202543_create_users_table.js
✓ 2025_12_03_204948_create_posts_table.js
✓ 2025_12_03_205127_create_comments_table.js

Migrations completed successfully!
```

---

### `migrate:status`

Show status of all migrations.

**Usage:**
```bash
vasuzex migrate:status
```

**Examples:**

```bash
vasuzex migrate:status

# Via package.json script
pnpm db:migrate:status
```

**Output:**

```
Migration Status:

✓ 2025_12_03_202543_create_users_table.js (ran)
✓ 2025_12_03_204948_create_posts_table.js (ran)
✗ 2025_12_04_100000_add_avatar_to_users.js (pending)
```

---

### `migrate:rollback`

Rollback the last batch of migrations.

**Usage:**
```bash
vasuzex migrate:rollback [options]
```

**Options:**
- `-s, --step <steps>` - Number of migrations to rollback (default: 1)

**Examples:**

```bash
# Rollback last migration
vasuzex migrate:rollback

# Rollback last 3 migrations
vasuzex migrate:rollback --step 3
vasuzex migrate:rollback -s 3

# Via package.json script
pnpm db:rollback
```

**What it does:**

1. Identifies last batch of migrations
2. Runs `down()` method for each
3. Removes from migrations table
4. Shows rolled back migrations

---

### `db:seed`

Seed the database with test data.

**Usage:**
```bash
vasuzex db:seed [options]
```

**Options:**
- `-c, --class <class>` - Specific seeder class to run

**Examples:**

```bash
# Run all seeders
vasuzex db:seed

# Run specific seeder
vasuzex db:seed --class UserSeeder
vasuzex db:seed -c ProductSeeder

# Via package.json script
pnpm db:seed
```

**What it does:**

1. Finds all seeders in `database/seeders/`
2. Runs seeders in order (or specific seeder)
3. Populates database with test data
4. Shows success/failure for each

---

### `migrate:fresh`

Drop all tables and re-run all migrations.

**Usage:**
```bash
vasuzex migrate:fresh [options]
```

**Options:**
- `--seed` - Seed the database after migration

**Examples:**

```bash
# Fresh migration
vasuzex migrate:fresh

# Fresh migration + seed
vasuzex migrate:fresh --seed

# Via package.json script
pnpm db:reset  # Runs migrate:fresh --seed
```

**Warning:** This drops ALL tables and data. Use with caution!

**What it does:**

1. ⚠️ Drops all database tables
2. ✅ Runs all migrations from scratch
3. ✅ Seeds database (if --seed flag)
4. ✅ Fresh database state

---

## Code Generation

### `make:migration`

Create a new migration file.

**Usage:**
```bash
vasuzex make:migration <name>
```

**Arguments:**
- `<name>` - Migration name (required)

**Examples:**

```bash
# Create migration
vasuzex make:migration create_products_table
vasuzex make:migration add_avatar_to_users
vasuzex make:migration create_post_likes_table

# Via package.json script
pnpm make:migration create_orders_table
```

**Generated File:**

```
database/migrations/2025_12_04_100000_create_products_table.js
```

**File Content:**

```javascript
export async function up(db) {
  await db.schema.createTable('products', (table) => {
    table.increments('id');
    table.string('name');
    table.text('description').nullable();
    table.decimal('price', 10, 2);
    table.timestamps();
  });
}

export async function down(db) {
  await db.schema.dropTable('products');
}
```

**Then run:**

```bash
vasuzex migrate
```

---

### `make:seeder`

Create a new seeder file.

**Usage:**
```bash
vasuzex make:seeder <name>
```

**Arguments:**
- `<name>` - Seeder name (required, should end with "Seeder")

**Examples:**

```bash
# Create seeder
vasuzex make:seeder UserSeeder
vasuzex make:seeder ProductSeeder
vasuzex make:seeder PostSeeder

# Via package.json script
pnpm make:seeder OrderSeeder
```

**Generated File:**

```
database/seeders/ProductSeeder.js
```

**File Content:**

```javascript
import { Product } from '#models';

export class ProductSeeder {
  async run() {
    await Product.create([
      {
        name: 'Product 1',
        description: 'Description for product 1',
        price: 99.99
      },
      {
        name: 'Product 2',
        description: 'Description for product 2',
        price: 149.99
      }
    ]);
    
    console.log('Products seeded successfully');
  }
}
```

**Then run:**

```bash
vasuzex db:seed --class ProductSeeder
```

---

### `make:model`

Create a new Eloquent model.

**Usage:**
```bash
vasuzex make:model <name> [options]
```

**Arguments:**
- `<name>` - Model name (required, PascalCase)

**Options:**
- `-m, --migration` - Create migration file along with model

**Examples:**

```bash
# Create model only
vasuzex make:model Product
vasuzex make:model User

# Create model + migration
vasuzex make:model Product --migration
vasuzex make:model Order -m

# Via package.json script
pnpm make:model Category --migration
```

**Generated File:**

```
database/models/Product.js
```

**File Content:**

```javascript
import { Model } from 'vasuzex';

export class Product extends Model {
  static table = 'products';
  
  static fillable = [
    'name',
    'description',
    'price'
  ];
  
  static casts = {
    price: 'float'
  };
  
  // Relationships
  // category() {
  //   return this.belongsTo('Category');
  // }
}
```

**Don't forget to export:**

Edit `database/models/index.js`:

```javascript
export { User } from './User.js';
export { Post } from './Post.js';
export { Product } from './Product.js';  // Add this
```

---

## Dependency Management

### `add:dep`

Add dependency to root and workspace apps.

**Usage:**
```bash
vasuzex add:dep <packages...> [options]
```

**Arguments:**
- `<packages...>` - One or more package names

**Options:**
- `-D, --dev` - Add as dev dependency
- `-w, --workspace` - Install in all workspace apps

**Examples:**

```bash
# Add single dependency to root
vasuzex add:dep axios

# Add multiple dependencies
vasuzex add:dep lodash moment dayjs

# Add dev dependency
vasuzex add:dep jest --dev
vasuzex add:dep prettier eslint -D

# Add to all workspace apps
vasuzex add:dep axios --workspace
vasuzex add:dep axios -w

# Add dev dependency to all apps
vasuzex add:dep jest --dev --workspace
```

**What it does:**

1. ✅ Adds package(s) to root `package.json`
2. ✅ Runs `pnpm install`
3. ✅ Optionally adds to all workspace apps (with -w)
4. ✅ Shows installed packages

---

## Command Syntax

### Help

Get help for any command:

```bash
# General help
vasuzex --help
vasuzex -h

# Command-specific help
vasuzex generate:app --help
vasuzex migrate --help
```

### Version

Check Vasuzex version:

```bash
vasuzex --version
vasuzex -V
```

### Running Commands

**Three ways to run commands:**

1. **Global install:**
```bash
npm install -g vasuzex
vasuzex generate:app my-api
```

2. **NPX (no install):**
```bash
npx vasuzex generate:app my-api
```

3. **Package scripts:**
```bash
# Add to package.json
{
  "scripts": {
    "vasuzex": "vasuzex",
    "db:migrate": "vasuzex migrate"
  }
}

# Run
pnpm vasuzex generate:app my-api
pnpm db:migrate
```

---

## Common Workflows

### New Project Setup

```bash
# 1. Create project
npx create-vasuzex my-app
cd my-app

# 2. Create database
createdb my_app  # PostgreSQL
# or
mysql -u root -p -e "CREATE DATABASE my_app;"  # MySQL

# 3. Run migrations
pnpm db:migrate

# 4. Seed database
pnpm db:seed

# 5. Start development
pnpm dev
```

---

### Add New Feature

```bash
# 1. Create migration
vasuzex make:migration create_products_table

# 2. Edit migration file
# database/migrations/YYYY_MM_DD_HHMMSS_create_products_table.js

# 3. Run migration
vasuzex migrate

# 4. Create model
vasuzex make:model Product

# 5. Create seeder
vasuzex make:seeder ProductSeeder

# 6. Edit seeder file
# database/seeders/ProductSeeder.js

# 7. Run seeder
vasuzex db:seed --class ProductSeeder
```

---

### Generate New App

```bash
# 1. Generate app
vasuzex generate:app shop --type api

# 2. Navigate to app
cd apps/shop/api

# 3. Install dependencies (if needed)
pnpm install

# 4. Start development
pnpm dev

# Or from root
pnpm dev:shop-api
```

---

### Reset Database

```bash
# Warning: This drops all data!

# 1. Fresh migration + seed
vasuzex migrate:fresh --seed

# Or via script
pnpm db:reset
```

---

## Environment Variables

Commands respect these `.env` variables:

```env
# Database
DB_CONNECTION=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=my_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret

# Application
APP_NAME=MyApp
APP_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000

# Paths
MIGRATIONS_PATH=database/migrations
SEEDERS_PATH=database/seeders
MODELS_PATH=database/models
```

---

## Troubleshooting

### Command Not Found

**Problem:**
```bash
vasuzex: command not found
```

**Solutions:**

```bash
# Use npx
npx vasuzex <command>

# Or install globally
npm install -g vasuzex

# Or use package script
pnpm vasuzex <command>
```

---

### Permission Denied

**Problem:**
```bash
EACCES: permission denied
```

**Solution:**

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.zshrc
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
```

---

### Migration Failed

**Problem:**
```bash
Error running migration: table already exists
```

**Solution:**

```bash
# Check migration status
vasuzex migrate:status

# Rollback if needed
vasuzex migrate:rollback

# Or fresh start (⚠️ drops all data)
vasuzex migrate:fresh
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `create-vasuzex <name>` | Create new project |
| `vasuzex generate:app <name>` | Generate new app |
| `vasuzex generate:media-server` | Generate media server |
| `vasuzex delete:app <name>` | Delete app |
| `vasuzex db:create` | Create database |
| `vasuzex migrate` | Run migrations |
| `vasuzex migrate:status` | Check migration status |
| `vasuzex migrate:rollback` | Rollback migrations |
| `vasuzex db:seed` | Seed database |
| `vasuzex migrate:fresh` | Fresh migration |
| `vasuzex make:migration <name>` | Create migration |
| `vasuzex make:seeder <name>` | Create seeder |
| `vasuzex make:model <name>` | Create model |
| `vasuzex add:dep <packages...>` | Add dependencies |
| `vasuzex --help` | Show help |
| `vasuzex --version` | Show version |

---

**For more information, see [Documentation](../README.md)**
