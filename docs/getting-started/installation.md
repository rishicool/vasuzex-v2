# Installation

Vasuzex is a Laravel-inspired framework for Node.js with powerful CLI tools and elegant syntax.

## Requirements

- **Node.js:** >= 18.0.0
- **pnpm:** >= 10.0.0 (will be auto-installed if missing)
- **Git:** For version control (recommended)

## Check Requirements

```bash
node --version  # Should be >= 18.0.0
```

## Installation

### Option 1: Quick Start with npx (Recommended)

Create a new project without installing anything globally:

```bash
npx create-vasuzex my-app
```

This will:
- ✅ Auto-install pnpm if not present
- ✅ Set up project structure
- ✅ Install all dependencies
- ✅ Configure database
- ✅ Generate starter apps (optional)

### Option 2: Global Installation

Install Vasuzex CLI globally for repeated use:

```bash
npm install -g vasuzex@latest
```

Verify installation:

```bash
vasuzex --version
create-vasuzex --version
```

Create projects:

```bash
create-vasuzex my-app
```

### Option 3: Development from Source

For contributing or development:

```bash
git clone https://github.com/yourusername/vasuzex-v2.git
cd vasuzex-v2
pnpm install
node bin/create-vasuzex.js my-app
```

## After Installation

### Navigate to Project

```bash
cd my-app
```

### Install Dependencies

If not done automatically:

```bash
pnpm install
```

### Configure Database

Edit `.env` file:

```env
DB_CONNECTION=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=my_app
DB_USERNAME=postgres
DB_PASSWORD=secret
```

### Run Migrations

```bash
pnpm db:migrate
```

### Start Development

```bash
# Start all apps
pnpm dev

# Or start specific app
pnpm dev:blog-api
pnpm dev:blog-web
```

## What's Installed

The installer creates:

```
my-app/
├── package.json          # Single source of dependencies
├── node_modules/         # Hoisted dependencies
├── pnpm-workspace.yaml   # Workspace config
├── .npmrc                # Hoisting config
├── config/              # Framework config files
├── database/            # Models, migrations, seeders
├── framework/           # Framework source
├── apps/                # Your applications
│   └── blog/
│       ├── api/         # Backend API
│       └── web/         # Frontend
└── docs/                # Documentation
```

## Troubleshooting

### pnpm not found

The installer auto-installs pnpm. If it fails, install manually:

```bash
npm install -g pnpm@latest
```

### Permission Denied (Global Install)

Use sudo (Linux/Mac):

```bash
sudo npm install -g vasuzex@latest
```

Or configure npm prefix (recommended):

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Port Already in Use

Change ports in app's `.env`:

```env
PORT=3000  # Change to available port
```

## Next Steps

- [Quick Start](quick-start.md) - Build your first app
- [CLI Commands](../cli/commands.md) - All available commands
- [Project Structure](project-structure.md) - Understand the layout
- [Database Guide](../database/getting-started.md) - Models & migrations
