# Installation

> **⚠️ WARNING: DEVELOPMENT VERSION**  
> This framework is currently under active development and is **NOT recommended for production use**.  
> Use at your own risk. APIs may change without notice. Expect bugs and breaking changes.

## System Requirements

Before installing Vasuzex, ensure your system meets these requirements:

- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 9.0.0 (comes with Node.js)
- **pnpm**: >= 8.0.0 (recommended package manager)
- **Database**: PostgreSQL 12+, MySQL 5.7+, or SQLite 3+
- **Git**: For version control (optional but recommended)

### Verify Your Installation

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check npm version
npm --version   # Should be >= 9.0.0

# Install pnpm globally (recommended)
npm install -g pnpm

# Verify pnpm
pnpm --version  # Should be >= 8.0.0
```

## Installation Methods

There are three ways to use Vasuzex, depending on your needs:

### Method 1: NPX (Recommended for Quick Start)

**Best for**: Creating new projects quickly without installing anything globally.

```bash
# Create a new project (no installation needed)
npx create-vasuzex my-app

# Follow the interactive prompts
cd my-app
pnpm install
pnpm db:migrate
pnpm dev
```

**Pros**:
- No global installation needed
- Always uses the latest version
- Clean and simple

**Cons**:
- Downloads package each time you create a project
- Slower on first run

---

### Method 2: Global Installation (Recommended for Developers)

**Best for**: Developers who create multiple Vasuzex projects or need CLI commands available globally.

```bash
# Install Vasuzex globally
npm install -g vasuzex

# Verify installation
vasuzex --version
create-vasuzex --version

# Now you can use commands anywhere
create-vasuzex my-app
cd my-app
vasuzex generate:app my-api
vasuzex make:model User
vasuzex db:migrate
```

**Pros**:
- CLI commands available everywhere
- Faster project creation
- Better for active development

**Cons**:
- Takes disk space globally
- Need to update manually (`npm update -g vasuzex`)

---

### Method 3: Local Dependency (For Existing Projects)

**Best for**: Adding Vasuzex to an existing Node.js project.

```bash
# Navigate to your project
cd my-existing-project

# Install Vasuzex as a dependency
npm install vasuzex
# or
pnpm add vasuzex

# Use via npx or package.json scripts
npx vasuzex generate:app my-api
```

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "vasuzex": "vasuzex",
    "db:migrate": "vasuzex migrate",
    "generate:app": "vasuzex generate:app"
  }
}
```

Then run:

```bash
npm run vasuzex -- generate:app my-api
npm run db:migrate
```

**Pros**:
- Project-specific version
- Tracked in package.json
- Works in CI/CD

**Cons**:
- Must use npx or npm scripts
- Commands not globally available

---

## Creating Your First Project

Let's create a new Vasuzex project step by step:

### Step 1: Run the Creator

```bash
npx create-vasuzex my-first-app
```

Or if installed globally:

```bash
create-vasuzex my-first-app
```

### Step 2: Answer Interactive Prompts

The CLI will ask you several questions:

**1. Choose starter template:**
```
? Choose starter template:
  ❯ Minimal (Empty project - generate apps later)
    With Blog API
    With Media Server  
    Full Stack (Blog + Media)
```

- **Minimal**: Empty project, you generate apps as needed
- **With Blog API**: Includes a complete blog REST API
- **With Media Server**: Includes image upload/processing server
- **Full Stack**: Includes both Blog API and Media Server

**2. Choose database:**
```
? Choose database:
  ❯ PostgreSQL
    MySQL
    SQLite
```

**3. Configure database now:**
```
? Configure database connection now? (Y/n)
```

If you choose **Yes**, you'll be prompted for:

**For PostgreSQL/MySQL:**
```
? Database host: localhost
? Database port: 5432 (or 3306 for MySQL)
? Database name: my_first_app
? Database username: postgres (or root for MySQL)
? Database password: ********
```

**For SQLite:**
No additional configuration needed.

### Step 3: Wait for Setup

The CLI automatically:

1. ✅ Creates project directory
2. ✅ Copies framework files
3. ✅ Generates `package.json` with correct name
4. ✅ Creates `.env` file with your database config
5. ✅ Installs all dependencies via pnpm
6. ✅ Sets up import aliases
7. ✅ Copies starter apps (if selected)
8. ✅ Initializes Git repository
9. ✅ Creates initial commit

### Step 4: Navigate and Run

```bash
cd my-first-app
pnpm install  # If not done automatically
pnpm db:migrate  # Run database migrations
pnpm dev  # Start development server
```

Your app is now running at `http://localhost:3000`! 🎉

---

## What Gets Installed

### Project Structure

After installation, your project will look like this:

```
my-first-app/
├── apps/                    # Your applications
│   ├── blog-api/           # (if selected)
│   └── media-server/       # (if selected)
├── config/                 # Configuration files
│   ├── app.cjs
│   ├── database.cjs
│   ├── auth.cjs
│   └── ...
├── database/               # Database layer
│   ├── models/            # Eloquent-style models
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── node_modules/          # Dependencies (including vasuzex)
│   └── vasuzex/           # Framework core
├── .env                   # Environment variables
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Project configuration
├── pnpm-lock.yaml        # Lock file
└── README.md             # Project documentation
```

### Installed Dependencies

The framework includes these key dependencies:

**Core Framework:**
- `vasuzex` - The framework itself
- `guruorm` - Eloquent-style ORM
- `express` - HTTP server

**Database Drivers:**
- `pg` - PostgreSQL client (if selected)
- `mysql2` - MySQL client (if selected)
- `sqlite3` - SQLite client (if selected)

**Utilities:**
- `bcrypt` - Password hashing
- `dotenv` - Environment variables
- `sharp` - Image processing
- `helmet` - Security headers
- `cors` - CORS middleware

All dependencies are automatically installed during project creation.

---

## Available Commands After Installation

Once your project is created, these commands are available:

### Development Commands

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm dev:blog-api
pnpm dev:media-server
```

### Database Commands

```bash
# Run migrations
pnpm db:migrate

# Check migration status
pnpm db:migrate:status

# Rollback last migration
pnpm db:rollback

# Seed database
pnpm db:seed

# Fresh migration + seed
pnpm db:reset
```

### Code Generation Commands

```bash
# Generate new app
pnpm generate:app <name>
pnpm generate:app my-api --type api
pnpm generate:app my-web --type web

# Generate media server
pnpm generate:media-server
pnpm generate:media-server --port 4003

# Create model
pnpm make:model User
pnpm make:model Post --migration

# Create migration
pnpm make:migration create_posts_table

# Create seeder
pnpm make:seeder UserSeeder
```

### Framework CLI Commands

```bash
# Via npx
npx vasuzex <command>

# Via pnpm script
pnpm vasuzex <command>

# If installed globally
vasuzex <command>
```

See [CLI Commands Reference](../cli/commands.md) for complete list.

---

## Troubleshooting Installation

### Issue: Command Not Found

**Problem:**
```bash
create-vasuzex: command not found
```

**Solution:**
```bash
# Use npx instead
npx create-vasuzex my-app

# Or install globally
npm install -g vasuzex
```

---

### Issue: Permission Denied (macOS/Linux)

**Problem:**
```bash
EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.zshrc or ~/.bashrc
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Then install
npm install -g vasuzex
```

**OR use sudo (not recommended):**
```bash
sudo npm install -g vasuzex
```

---

### Issue: pnpm Not Found

**Problem:**
```bash
pnpm: command not found
```

**Solution:**
```bash
# Install pnpm globally
npm install -g pnpm

# Verify
pnpm --version

# Alternative: Use corepack (Node 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

---

### Issue: Database Connection Failed

**Problem:**
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

1. **Check if database is running:**
```bash
# PostgreSQL
psql -U postgres  # Should connect

# MySQL
mysql -u root -p  # Should connect
```

2. **Verify .env configuration:**
```bash
cat .env
```

Make sure these match your database:
```env
DB_CONNECTION=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=my_first_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

3. **Create database if it doesn't exist:**
```bash
# PostgreSQL
createdb my_first_app

# MySQL
mysql -u root -p -e "CREATE DATABASE my_first_app;"
```

4. **Test connection:**
```bash
pnpm db:migrate
```

---

### Issue: Port Already in Use

**Problem:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

1. **Find what's using the port:**
```bash
# macOS/Linux
lsof -i :3000

# Kill the process
kill -9 <PID>
```

2. **Or change the port:**
```bash
# Edit .env
PORT=3001

# Restart
pnpm dev
```

---

### Issue: Module Not Found

**Problem:**
```bash
Error: Cannot find module 'vasuzex'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verify vasuzex is installed
ls node_modules/vasuzex
```

---

## Updating Vasuzex

### Update Global Installation

```bash
# Check current version
vasuzex --version

# Update to latest
npm update -g vasuzex

# Verify update
vasuzex --version
```

### Update Project Dependency

```bash
# Check current version
pnpm list vasuzex

# Update to latest
pnpm update vasuzex

# Verify update
pnpm list vasuzex
```

---

## Uninstalling Vasuzex

### Uninstall Global Installation

```bash
npm uninstall -g vasuzex
```

### Remove from Project

```bash
# Remove dependency
pnpm remove vasuzex

# Or delete entire project
cd ..
rm -rf my-first-app
```

---

## Next Steps

Now that you have Vasuzex installed, proceed to:

1. **[Quick Start Guide](quickstart.md)** - Build your first app
2. **[Configuration](configuration.md)** - Configure your project
3. **[Directory Structure](structure.md)** - Understand the layout
4. **[Database Setup](../database/getting-started.md)** - Work with databases

---

## Getting Help

If you encounter issues not covered here:

1. **Check Documentation**: [https://github.com/rishicool/vasuzex/tree/main/docs](https://github.com/rishicool/vasuzex/tree/main/docs)
2. **GitHub Issues**: [https://github.com/rishicool/vasuzex/issues](https://github.com/rishicool/vasuzex/issues)
3. **Community**: Coming soon

---

**Happy coding with Vasuzex! 🎉**
