# Getting Started with Vasuzex

> **⚠️ WARNING: DEVELOPMENT VERSION**  
> This framework is currently under active development and is **NOT recommended for production use**.  
> Use at your own risk. APIs may change without notice. Expect bugs and breaking changes.

This guide takes you from zero to a working Vasuzex application in 10 minutes.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] pnpm installed (`pnpm --version` or install with `npm install -g pnpm`)
- [ ] Database installed (PostgreSQL, MySQL, or SQLite)
- [ ] Database server running (if using PostgreSQL/MySQL)
- [ ] Basic command line knowledge

## Step-by-Step Guide

### Step 1: Create Your First Project

Open your terminal and run:

```bash
npx create-vasuzex my-first-app
```

You'll see:

```
🚀 Creating Vasuzex project...
```

The interactive CLI will ask you questions. For this guide, choose:

**Question 1 - Template:**
```
? Choose starter template:
  ❯ With Blog API  ← Select this
    Minimal (Empty project - generate apps later)
    With Media Server  
    Full Stack (Blog + Media)
```

**Question 2 - Database:**
```
? Choose database:
  ❯ PostgreSQL  ← Select your preference
    MySQL
    SQLite
```

**Question 3 - Configure Now:**
```
? Configure database connection now?
  ❯ Yes  ← Select Yes
```

**Question 4-8 - Database Details:**
```
? Database host: localhost  ← Press Enter for default
? Database port: 5432  ← Press Enter for default
? Database name: my_first_app  ← Press Enter or type custom
? Database username: postgres  ← Your DB username
? Database password: ********  ← Your DB password
```

The CLI now runs automatically:

```
⠋ Creating project structure...
🔧 Development mode: Using vasuzex from node_modules
✔ Project structure created!
✔ Dependencies installed!
✔ Git repository initialized!
✅ Project created successfully!
```

---

### Step 2: Navigate to Your Project

```bash
cd my-first-app
```

Let's see what was created:

```bash
ls -la
```

You should see:

```
apps/              # Your applications
config/            # Configuration files
database/          # Models, migrations, seeders
node_modules/      # Dependencies (including vasuzex)
.env              # Your environment variables
.env.example      # Template
.gitignore        # Git ignore rules
package.json      # Project manifest
pnpm-lock.yaml    # Lock file
README.md         # Project documentation
```

---

### Step 3: Verify Installation

Check if vasuzex is installed:

```bash
pnpm list vasuzex
```

You should see:

```
my-first-app@1.0.0 /Users/you/my-first-app
└── vasuzex@1.0.1
```

Check available commands:

```bash
npx vasuzex --help
```

---

### Step 4: Create the Database

The CLI configured `.env` but didn't create the database. Create it now:

**For PostgreSQL:**
```bash
createdb my_first_app
```

**For MySQL:**
```bash
mysql -u root -p -e "CREATE DATABASE my_first_app;"
```

**For SQLite:**
```bash
# Nothing needed - file will be created automatically
```

---

### Step 5: Run Database Migrations

Run the migrations that came with the Blog API starter:

```bash
pnpm db:migrate
```

You should see:

```
Running migrations...
✓ 2025_12_03_202543_create_users_table.js
✓ 2025_12_03_204948_create_posts_table.js
✓ 2025_12_03_205127_create_comments_table.js

Migrations completed successfully!
```

Verify migrations ran:

```bash
pnpm db:migrate:status
```

---

### Step 6: Seed the Database (Optional)

Add sample data:

```bash
pnpm db:seed
```

This creates:
- Sample users
- Sample blog posts
- Sample comments

---

### Step 7: Explore the Blog API Structure

Navigate to the blog API app:

```bash
cd apps/blog-api/api
ls -la src/
```

You'll see the MVC structure:

```
src/
├── controllers/        # HTTP controllers
│   ├── AuthController.js
│   └── BaseController.js
├── middleware/        # Custom middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/           # Eloquent models
│   └── User.js
├── routes/           # Route definitions
│   ├── auth.routes.js
│   └── index.js
├── services/         # Business logic
│   └── AuthService.js
├── requests/         # Form validation
│   └── AuthRequests.js
├── index.js         # Framework bootstrap
└── server.js        # Express server
```

---

### Step 8: Start the Development Server

From the blog-api directory:

```bash
pnpm dev
```

Or from the root:

```bash
cd ../../..  # Back to root
pnpm dev:blog-api-api
```

You should see:

```
🚀 Blog API starting...

📦 Vasuzex Framework v1.0.1
🔧 Environment: development
💾 Database: PostgreSQL
📡 Server: http://localhost:3001

✅ Blog API is ready!
```

---

### Step 9: Test the API

Open a new terminal window (keep the server running) and test the endpoints:

**Health Check:**
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T09:30:00.000Z"
}
```

**Register a User:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-12-04T09:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secret123"
  }'
```

**Get Posts:**
```bash
curl http://localhost:3001/api/posts
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Welcome to Vasuzex",
      "content": "This is your first post...",
      "author": {
        "id": 1,
        "name": "John Doe"
      },
      "created_at": "2025-12-04T09:30:00.000Z"
    }
  ]
}
```

---

### Step 10: Explore the Code

Let's understand what makes the API work.

**Open the User Model:**

```bash
cat database/models/User.js
```

```javascript
import { Model } from 'vasuzex';
import { Hash } from 'vasuzex';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
  
  // Relationships
  posts() {
    return this.hasMany('Post');
  }
  
  comments() {
    return this.hasMany('Comment');
  }
  
  // Mutator: Hash password before saving
  setPasswordAttribute(value) {
    return Hash.make(value);
  }
}
```

**Key Features:**
- `fillable`: Mass-assignable fields
- `hidden`: Fields excluded from JSON responses
- `posts()`: Relationship to Post model
- `setPasswordAttribute()`: Auto-hash passwords

---

**Open the Auth Controller:**

```bash
cat apps/blog-api/api/src/controllers/AuthController.js
```

```javascript
import { Controller } from 'vasuzex';
import { Auth, Hash } from 'vasuzex';
import { User } from '#models';
import { RegisterRequest, LoginRequest } from '../requests/AuthRequests.js';

export class AuthController extends Controller {
  async register(req, res) {
    // Validate request
    const validation = await this.validate(req, new RegisterRequest());
    
    if (validation.fails()) {
      return res.status(422).json({
        success: false,
        errors: validation.errors()
      });
    }
    
    // Create user
    const user = await User.create(validation.validated());
    
    // Generate token
    const token = await Auth.generateToken(user);
    
    return res.status(201).json({
      success: true,
      data: { user, token }
    });
  }
  
  async login(req, res) {
    const validation = await this.validate(req, new LoginRequest());
    
    if (validation.fails()) {
      return res.status(422).json({
        success: false,
        errors: validation.errors()
      });
    }
    
    // Attempt authentication
    const success = await Auth.attempt({
      email: req.body.email,
      password: req.body.password
    });
    
    if (!success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = Auth.user();
    const token = await Auth.generateToken(user);
    
    return res.json({
      success: true,
      data: { user, token }
    });
  }
}
```

**Key Features:**
- `validate()`: Built-in validation
- `Auth.attempt()`: Authenticate users
- `Auth.generateToken()`: JWT tokens
- Clean error handling

---

**Open the Routes:**

```bash
cat apps/blog-api/api/src/routes/auth.routes.js
```

```javascript
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Protected routes (require authentication)
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

export default router;
```

**Key Features:**
- RESTful routing
- Controller methods
- Middleware protection
- Clean separation

---

## Next Steps: Build Your Own Feature

Let's add a "like" feature to blog posts.

### 1. Create Migration

```bash
npx vasuzex make:migration create_post_likes_table
```

Edit `database/migrations/YYYY_MM_DD_HHMMSS_create_post_likes_table.js`:

```javascript
export async function up(db) {
  await db.schema.createTable('post_likes', (table) => {
    table.increments('id');
    table.integer('user_id').unsigned();
    table.integer('post_id').unsigned();
    table.timestamps();
    
    // Prevent duplicate likes
    table.unique(['user_id', 'post_id']);
    
    // Foreign keys
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('post_id').references('posts.id').onDelete('CASCADE');
  });
}

export async function down(db) {
  await db.schema.dropTable('post_likes');
}
```

Run migration:

```bash
pnpm db:migrate
```

---

### 2. Create PostLike Model

```bash
npx vasuzex make:model PostLike
```

Edit `database/models/PostLike.js`:

```javascript
import { Model } from 'vasuzex';

export class PostLike extends Model {
  static table = 'post_likes';
  
  static fillable = ['user_id', 'post_id'];
  
  // Relationships
  user() {
    return this.belongsTo('User');
  }
  
  post() {
    return this.belongsTo('Post');
  }
}
```

Export from `database/models/index.js`:

```javascript
export { User } from './User.js';
export { Post } from './Post.js';
export { Comment } from './Comment.js';
export { PostLike } from './PostLike.js';  // Add this
```

---

### 3. Update Post Model

Edit `database/models/Post.js`, add relationship:

```javascript
likes() {
  return this.hasMany('PostLike');
}

// Computed attribute
getLikesCountAttribute() {
  return this.likes ? this.likes.length : 0;
}
```

---

### 4. Create Controller Method

Edit `apps/blog-api/api/src/controllers/PostController.js`:

```javascript
import { PostLike } from '#models';

// Add to existing PostController
async like(req, res) {
  const postId = req.params.id;
  const userId = Auth.user().id;
  
  // Check if already liked
  const existing = await PostLike.query()
    .where('user_id', userId)
    .where('post_id', postId)
    .first();
  
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Already liked this post'
    });
  }
  
  // Create like
  await PostLike.create({
    user_id: userId,
    post_id: postId
  });
  
  // Get updated post with like count
  const post = await Post.find(postId);
  await post.load('likes');
  
  return res.json({
    success: true,
    data: {
      post_id: postId,
      likes_count: post.likes_count
    }
  });
}

async unlike(req, res) {
  const postId = req.params.id;
  const userId = Auth.user().id;
  
  const like = await PostLike.query()
    .where('user_id', userId)
    .where('post_id', postId)
    .first();
  
  if (!like) {
    return res.status(404).json({
      success: false,
      message: 'Like not found'
    });
  }
  
  await like.delete();
  
  return res.json({
    success: true,
    message: 'Post unliked'
  });
}
```

---

### 5. Add Routes

Edit `apps/blog-api/api/src/routes/index.js`:

```javascript
import authMiddleware from '../middleware/authMiddleware.js';

// Add to existing routes
router.post('/posts/:id/like', authMiddleware, (req, res) => 
  postController.like(req, res)
);

router.delete('/posts/:id/like', authMiddleware, (req, res) => 
  postController.unlike(req, res)
);
```

---

### 6. Test Your New Feature

**Like a Post:**
```bash
# Get token from login response
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3001/api/posts/1/like \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "post_id": 1,
    "likes_count": 1
  }
}
```

**Unlike a Post:**
```bash
curl -X DELETE http://localhost:3001/api/posts/1/like \
  -H "Authorization: Bearer $TOKEN"
```

---

## Understanding the Framework Flow

Let's trace what happens when a request comes in:

```
HTTP Request
    ↓
Express Server (server.js)
    ↓
Route Handler (routes/index.js)
    ↓
Middleware (authMiddleware.js) ← Validates JWT token
    ↓
Controller (AuthController.js) ← Business logic
    ↓
Model (User.js) ← Database operations
    ↓
Response sent back to client
```

---

## Common Tasks

### Add a New API Endpoint

1. **Create route** in `src/routes/`
2. **Create controller method** in `src/controllers/`
3. **Add validation** in `src/requests/` (optional)
4. **Test** with curl or Postman

### Work with Database

```javascript
import { DB } from 'vasuzex';

// Raw query
const users = await DB.raw('SELECT * FROM users WHERE active = ?', [true]);

// Query builder
const posts = await DB.table('posts')
  .where('status', 'published')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();

// Transactions
await DB.transaction(async () => {
  await User.create({ name: 'John' });
  await Post.create({ title: 'Hello' });
});
```

### Use Caching

```javascript
import { Cache } from 'vasuzex';

// Store
await Cache.put('posts', posts, 3600); // 1 hour

// Retrieve
const cached = await Cache.get('posts');

// Remember (get or set)
const posts = await Cache.remember('posts', 3600, async () => {
  return await Post.all();
});
```

### Add Middleware

Create `src/middleware/adminMiddleware.js`:

```javascript
export default async function adminMiddleware(req, res, next) {
  const user = Auth.user();
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
}
```

Use in routes:

```javascript
import adminMiddleware from '../middleware/adminMiddleware.js';

router.delete('/posts/:id', [authMiddleware, adminMiddleware], (req, res) => 
  postController.destroy(req, res)
);
```

---

## Exploring More Features

### Generate a New App

```bash
cd ../../..  # Back to root
npx vasuzex generate:app todo-api --type api
```

This creates:
- Full MVC structure
- Example controller
- Auth routes
- Middleware
- Ready to run

Start it:

```bash
pnpm dev:todo-api
```

---

### Media Server

If you chose "Full Stack" template, you also have a media server:

```bash
cd apps/media-server
pnpm dev
```

Upload an image:

```bash
curl -X POST http://localhost:4000/api/upload \
  -F "image=@/path/to/image.jpg"
```

Get resized version:

```bash
curl "http://localhost:4000/api/media/image.jpg?width=300&height=200"
```

---

## What You've Learned

Congratulations! You now know how to:

- ✅ Install and set up Vasuzex
- ✅ Create a new project
- ✅ Run database migrations
- ✅ Work with models (Eloquent ORM)
- ✅ Create controllers and routes
- ✅ Use authentication
- ✅ Add new features
- ✅ Test APIs

---

## Next Topics to Explore

### Database & ORM
- [Eloquent Relationships](../database/relationships.md)
- [Query Builder](../database/query-builder.md)
- [Migrations](../database/migrations.md)
- [Seeders](../database/seeding.md)

### HTTP & API
- [Controllers](../http/controllers.md)
- [Validation](../../framework/Services/Validation/README.md)
- [Middleware](../http/middleware.md)
- [Resources](../http/resources.md)

### Services
- [Cache](../../framework/Services/Cache/README.md)
- [File Upload](../../framework/Services/Upload/README.md)
- [Mail](../../framework/Services/Mail/README.md)
- [SMS](../../framework/Services/SMS/README.md)

### Advanced
- [Service Container](../core/service-container.md)
- [Service Providers](../core/service-providers.md)
- [Facades](../core/facades.md)
- [Broadcasting](../advanced/broadcasting.md)

---

## Getting Help

**Documentation**: [https://github.com/rishicool/vasuzex/tree/main/docs](https://github.com/rishicool/vasuzex/tree/main/docs)

**Issues**: [https://github.com/rishicool/vasuzex/issues](https://github.com/rishicool/vasuzex/issues)

---

## Quick Reference Commands

```bash
# Project Creation
npx create-vasuzex my-app

# Database
pnpm db:migrate              # Run migrations
pnpm db:migrate:status       # Check status
pnpm db:rollback             # Rollback last
pnpm db:seed                 # Seed data
pnpm db:reset                # Fresh + seed

# Generation
pnpm generate:app <name>     # New app
pnpm make:model <name>       # New model
pnpm make:migration <name>   # New migration
pnpm make:seeder <name>      # New seeder

# Development
pnpm dev                     # Start all apps
pnpm dev:<app-name>          # Start specific app
```

---

**Happy coding with Vasuzex! 🎉**
