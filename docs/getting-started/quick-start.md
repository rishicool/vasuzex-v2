# Quick Start

Get started with Vasuzex V2 in under 5 minutes.

## Create Project

```bash
npx create-vasuzex my-app
```

You'll be prompted to choose:
1. **Template:** 
   - `Minimal` - Empty workspace with config only
   - `API Only (Backend)` - Single API app
   - `Web Only (Frontend)` - Single web app
   - `Full Stack (API + Web)` - Both API and web apps
   - `API + Media Server` - API with media handling
2. **App Name:** e.g., blog, shop, admin
3. **Web Framework:** React, Vue, Svelte, or Vanilla JS (if web app)
4. **Database:** PostgreSQL, MySQL, or SQLite
5. **Database Configuration:** (optional)

## Install Dependencies

If not done automatically:

```bash
cd my-app
pnpm install
```

## Setup Database

```bash
# Create database (PostgreSQL example)
createdb my_app

# Run migrations
pnpm db:migrate
```

## Start Development

For Full Stack template with "blog" app:

```bash
# Terminal 1: Start API
pnpm dev:blog-api

# Terminal 2: Start Web
pnpm dev:blog-web

# OR run all apps at once
pnpm dev
```

Your apps are now running:
- API: http://localhost:3000
- Web: http://localhost:5173

## Test API

```bash
curl http://localhost:3000/health
```

## Next Steps

- [CLI Commands](../cli/commands.md) - Learn all available commands
- [Database Guide](../database/getting-started.md) - Models, migrations, seeders
- [Project Structure](project-structure.md) - Understand the file organization
