# Vasuzex V2 Documentation

> **Version:** 2.0.0-alpha.1  
> **Architecture:** Hybrid Dependency Management  
> **Package Manager:** pnpm >= 10.0.0

Welcome to Vasuzex V2 - a Laravel-inspired Node.js framework with hybrid dependency management for monorepos.

## Quick Links

### Getting Started
- [Installation](getting-started/installation.md) - Install Vasuzex globally or use npx
- [Quick Start](getting-started/quick-start.md) - Create your first project in 5 minutes
- [Project Structure](getting-started/project-structure.md) - Understanding the file structure

### CLI & Commands
- [Complete CLI Reference](cli/commands.md) - All commands (create, generate, database, make, dependencies)

### Core Concepts
- [Service Container](core/service-container.md) - Dependency injection
- [Service Providers](core/service-providers.md) - Bootstrapping services
- [Facades](core/facades.md) - Static proxy pattern

### Database
- [Getting Started](database/getting-started.md) - Database setup, models, migrations, seeders, queries

### Advanced
- [Dependency Management Strategy](DEPENDENCY_MANAGEMENT_STRATEGY.md) - V2 hybrid dependencies explained
- [Import Aliases](IMPORT_ALIASES.md) - Path alias configuration

## What's New in V2?

### 🎯 Hybrid Dependency Management
All dependencies centralized in root `package.json` - apps use hoisted packages from root `node_modules`.

**Benefits:**
- 38% disk space savings
- Faster installations
- No version conflicts
- Single source of truth

### 📦 Minimal App Manifests
App `package.json` files contain only scripts - no dependencies.

```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

### ⚡ pnpm Hoisting
Automatic hoisting configuration via `.npmrc`:

```ini
hoist=true
shamefully-hoist=true
shared-workspace-lockfile=true
```

### 🔄 Zero Breaking Changes
All V1 APIs work in V2 - only dependency location changed.

## Quick Start

```bash
# Install globally (optional)
npm install -g vasuzex@latest

# Create new project
npx create-vasuzex my-app

# Or with global install
create-vasuzex my-app

# Navigate and setup
cd my-app
pnpm install  # If not done automatically

# Generate full-stack app
pnpm exec vasuzex generate:app blog

# Run migrations
pnpm db:migrate

# Start development
pnpm dev:blog-api  # API at http://localhost:3000
pnpm dev:blog-web  # Web at http://localhost:5173
```

## Architecture Overview

```
my-project/
├── package.json              # ALL dependencies here
├── node_modules/             # Single hoisted node_modules
├── .npmrc                    # Hoisting configuration
├── pnpm-workspace.yaml       # Workspace definition
├── apps/
│   ├── blog/
│   │   ├── api/
│   │   │   └── package.json  # Scripts only
│   │   └── web/
│   │       └── package.json  # Scripts only
│   └── media-server/
│       └── package.json      # Scripts only
├── config/                   # Centralized config
├── database/                 # Centralized database
│   ├── models/
│   ├── migrations/
│   └── seeders/
└── framework/                # Framework core (from vasuzex)
```

## Support

- **GitHub:** [github.com/rishicool/vasuzex](https://github.com/rishicool/vasuzex)
- **Issues:** [github.com/rishicool/vasuzex/issues](https://github.com/rishicool/vasuzex/issues)
- **Version:** 2.0.0-alpha.1

## License

MIT License - see [LICENSE](../LICENSE) for details.
