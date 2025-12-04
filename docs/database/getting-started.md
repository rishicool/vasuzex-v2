# Database: Getting Started

Vasuzex includes a powerful database layer built on GuruORM, providing an Eloquent-style ORM and fluent query builder.

## Introduction

The database layer provides:
- **Query Builder**: Fluent interface for building SQL queries
- **Eloquent ORM**: Active Record pattern for working with models
- **Migrations**: Version control for your database schema
- **Seeders**: Populate your database with test data
- **Multiple Databases**: Support for PostgreSQL, MySQL, and SQLite

## Configuration

Database configuration is stored in `config/database.cjs`:

```javascript
module.exports = {
  // Default connection
  default: env('DB_CONNECTION', 'postgresql'),

  // Database connections
  connections: {
    postgresql: {
      driver: 'postgresql',
      host: env('POSTGRES_HOST', 'localhost'),
      port: parseInt(env('POSTGRES_PORT', '5432'), 10),
      database: env('POSTGRES_DB', 'vasuzex_dev'),
      user: env('POSTGRES_USER', 'postgres'),
      password: env('POSTGRES_PASSWORD', ''),
      charset: 'utf8',
      schema: 'public',
    },

    mysql: {
      driver: 'mysql',
      host: env('DB_HOST', 'localhost'),
      port: parseInt(env('DB_PORT', '3306'), 10),
      database: env('DB_DATABASE', 'vasuzex'),
      user: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
    },
  },

  // Migration table name
  migrations: 'migrations',
};
```

### Environment Variables

Add database credentials to `.env`:

```env
# PostgreSQL
DB_CONNECTION=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myapp_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret

# MySQL  
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=secret
```

## Running Queries

### Using the DB Facade

```javascript
import { DB } from 'vasuzex';

// Select
const users = await DB.table('users').get();

// Where clause
const activeUsers = await DB.table('users')
  .where('active', true)
  .get();

// First result
const user = await DB.table('users')
  .where('email', 'john@example.com')
  .first();

// Insert
await DB.table('users').insert({
  name: 'John Doe',
  email: 'john@example.com',
  created_at: new Date()
});

// Update
await DB.table('users')
  .where('id', 1)
  .update({ name: 'Jane Doe' });

// Delete
await DB.table('users')
  .where('id', 1)
  .delete();
```

### Raw Queries

```javascript
// Raw select
const users = await DB.raw('SELECT * FROM users WHERE age > ?', [18]);

// Raw insert
await DB.raw(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['John', 'john@example.com']
);

// Get raw connection
const result = await DB.connection().query('SELECT NOW()');
```

## Using Models (Eloquent ORM)

### Defining Models

```javascript
// database/models/User.js
import { Model } from 'vasuzex';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
  
  static casts = {
    email_verified_at: 'datetime',
    created_at: 'datetime',
    updated_at: 'datetime'
  };
}
```

### CRUD Operations

```javascript
import { User } from '#models';

// Create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret'
});

// Read
const user = await User.find(1);
const users = await User.all();
const activeUsers = await User.where('active', true).get();

// Update
user.name = 'Jane Doe';
await user.save();

// Or update directly
await user.update({ name: 'Jane Doe' });

// Delete
await user.delete();

// Or delete by ID
await User.destroy(1);
```

## Query Builder Methods

### Retrieving Results

```javascript
import { DB } from 'vasuzex';

// Get all rows
const users = await DB.table('users').get();

// Get first row
const user = await DB.table('users').first();

// Get single column value
const name = await DB.table('users')
  .where('id', 1)
  .value('name');

// Pluck column values
const names = await DB.table('users').pluck('name');

// Count
const count = await DB.table('users').count();

// Check existence
const exists = await DB.table('users')
  .where('email', 'john@example.com')
  .exists();
```

### Where Clauses

```javascript
// Basic where
DB.table('users').where('name', 'John');

// Operator
DB.table('users').where('age', '>', 18);

// Multiple conditions (AND)
DB.table('users')
  .where('name', 'John')
  .where('active', true);

// OR conditions
DB.table('users')
  .where('name', 'John')
  .orWhere('name', 'Jane');

// Where in
DB.table('users').whereIn('id', [1, 2, 3]);

// Where not in
DB.table('users').whereNotIn('status', ['banned', 'suspended']);

// Where null
DB.table('users').whereNull('deleted_at');

// Where not null
DB.table('users').whereNotNull('email_verified_at');

// Where between
DB.table('posts').whereBetween('views', [100, 1000]);
```

### Ordering & Limiting

```javascript
// Order by
DB.table('users').orderBy('created_at', 'desc');

// Multiple orders
DB.table('users')
  .orderBy('role', 'asc')
  .orderBy('created_at', 'desc');

// Latest/Oldest (requires timestamps)
DB.table('posts').latest(); // Order by created_at desc
DB.table('posts').oldest(); // Order by created_at asc

// Limit
DB.table('users').limit(10);

// Offset
DB.table('users').offset(20).limit(10);

// Skip/Take (alias)
DB.table('users').skip(20).take(10);
```

### Aggregates

```javascript
// Count
const count = await DB.table('users').count();

// Max
const maxAge = await DB.table('users').max('age');

// Min
const minAge = await DB.table('users').min('age');

// Average
const avgAge = await DB.table('users').avg('age');

// Sum
const totalOrders = await DB.table('orders').sum('total');
```

### Joins

```javascript
// Inner join
const results = await DB.table('users')
  .join('posts', 'users.id', '=', 'posts.user_id')
  .select('users.*', 'posts.title')
  .get();

// Left join
const results = await DB.table('users')
  .leftJoin('posts', 'users.id', '=', 'posts.user_id')
  .get();

// Multiple joins
const results = await DB.table('posts')
  .join('users', 'posts.user_id', '=', 'users.id')
  .join('categories', 'posts.category_id', '=', 'categories.id')
  .select('posts.*', 'users.name', 'categories.title')
  .get();
```

### Grouping

```javascript
// Group by
const userCounts = await DB.table('posts')
  .select('user_id')
  .count('* as total')
  .groupBy('user_id')
  .get();

// Having
const popularUsers = await DB.table('posts')
  .select('user_id')
  .count('* as post_count')
  .groupBy('user_id')
  .having('post_count', '>', 10)
  .get();
```

## Transactions

```javascript
import { DB } from 'vasuzex';

// Basic transaction
await DB.transaction(async () => {
  await DB.table('accounts')
    .where('id', 1)
    .decrement('balance', 100);
    
  await DB.table('accounts')
    .where('id', 2)
    .increment('balance', 100);
});

// Manual transaction control
const trx = await DB.beginTransaction();

try {
  await DB.table('users')
    .transacting(trx)
    .insert({ name: 'John' });
    
  await DB.table('profiles')
    .transacting(trx)
    .insert({ user_id: 1, bio: 'Hello' });
    
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

## Multiple Database Connections

```javascript
// Use specific connection
const users = await DB.connection('mysql')
  .table('users')
  .get();

// In models
export class User extends Model {
  static connection = 'mysql';
  static table = 'users';
}
```

## Database Events

```javascript
import { DB } from 'vasuzex';

// Query executed event
DB.listen('query', (query) => {
  console.log('SQL:', query.sql);
  console.log('Bindings:', query.bindings);
  console.log('Time:', query.time + 'ms');
});
```

## Debugging

### Enable Query Logging

```javascript
// Log all queries
DB.enableQueryLog();

// Execute queries
await DB.table('users').get();

// Get query log
const queries = DB.getQueryLog();
console.log(queries);

// Disable logging
DB.disableQueryLog();
```

### Get SQL

```javascript
// Get SQL string
const sql = DB.table('users')
  .where('active', true)
  .toSql();

console.log(sql);
// SELECT * FROM users WHERE active = ?
```

## Best Practices

### 1. Use Parameter Binding

```javascript
// Good: Prevents SQL injection
DB.table('users')
  .where('email', userInput)
  .first();

// Bad: SQL injection risk
DB.raw(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### 2. Use Transactions for Related Operations

```javascript
// Good: Atomic operation
await DB.transaction(async () => {
  const order = await DB.table('orders').insert(orderData);
  await DB.table('order_items').insert(itemsData);
});

// Bad: Not atomic
const order = await DB.table('orders').insert(orderData);
await DB.table('order_items').insert(itemsData); // Might fail
```

### 3. Use Models for Complex Logic

```javascript
// Good: Encapsulated logic
const user = await User.find(1);
await user.sendWelcomeEmail();

// Bad: Business logic in controller
const user = await DB.table('users').where('id', 1).first();
// Send email logic here...
```

### 4. Index Your Queries

```javascript
// In migrations
table.index('email'); // Single column
table.index(['user_id', 'post_id']); // Composite
table.unique('email'); // Unique constraint
```

### 5. Use Eager Loading

```javascript
// Good: 1 query for posts + 1 for comments
const posts = await Post.with('comments').get();

// Bad: N+1 queries (1 for posts + N for each post's comments)
const posts = await Post.all();
for (const post of posts) {
  const comments = await post.comments().get();
}
```

## Next Steps

- [Query Builder](query-builder.md) - Complete query builder reference
- [Eloquent ORM](eloquent.md) - Models, relationships, and advanced features
- [Migrations](migrations.md) - Database schema management
- [Seeding](seeding.md) - Populate your database with data
- [Relationships](relationships.md) - Model relationships
