# DebugHelper - Laravel-style Debugging

Laravel-inspired debugging functions for Vasuzex framework. Pretty-print values with colors, file locations, and labels.

## Features

- 🎨 **Colored Output** - Beautiful syntax highlighting
- 📍 **File Location** - Shows where debug was called (file:line)
- 🏷️ **Labels** - Add descriptive labels to your dumps
- 🔄 **Chainable** - `inspect()` returns the value
- 💀 **Dump and Die** - `dd()` stops execution like Laravel
- 🎯 **Deep Inspection** - Handles circular references, nested objects, etc.

## Installation

Already included in Vasuzex framework!

```javascript
import { inspect, dd } from '@vasuzex/framework/Support/Helpers/DebugHelper';
```

## Usage

### `inspect(value, label?)` - Inspect and Continue

Prints the value with colors and continues execution. Perfect for debugging without stopping your app.

```javascript
import { inspect } from '@vasuzex/framework/Support/Helpers/DebugHelper';

// Simple inspection
const user = { name: 'John', age: 30 };
inspect(user);

// With label
inspect(user, 'User Object');

// Chain multiple inspects
inspect(user, 'User')
inspect(user.orders, 'Orders')
inspect(user.profile, 'Profile')

// In middleware
app.use((req, res, next) => {
  inspect(req.body, 'Request Body');
  inspect(req.headers, 'Headers');
  next(); // Continues execution
});

// In route handler
router.get('/users/:id', async (req, res) => {
  const user = await User.find(req.params.id);
  inspect(user, 'Found User'); // Debug without stopping
  
  const orders = await user.orders();
  inspect(orders, 'User Orders'); // Continue debugging
  
  res.json(user);
});
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
🔍 INSPECT @ UserController.js:24
📋 Found User
────────────────────────────────────────────────────────────────────────────────
{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
}
════════════════════════════════════════════════════════════════════════════════
```

### `dd(value, label?, exitCode?)` - Dump and Die

Prints the value and **exits the process**. Use when you want to stop execution immediately for debugging.

```javascript
import { dd } from '@vasuzex/framework/Support/Helpers/DebugHelper';

// Stop execution and dump
const user = { name: 'John', age: 30 };
dd(user); // Process exits here

// With label
dd(response, 'API Response');

// Custom exit code
dd(error, 'Fatal Error', 1);

// In route handler
router.post('/orders', async (req, res) => {
  const order = await Order.create(req.body);
  dd(order); // Stop here to inspect order
  // Code below won't execute
  res.json(order);
});
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
💀 DUMP AND DIE @ OrderController.js:42
📋 API Response
────────────────────────────────────────────────────────────────────────────────
{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
}
════════════════════════════════════════════════════════════════════════════════

⚠️  Process terminated by dd()
```

## Real-World Examples

### 1. Debug API Response

```javascript
router.get('/api/users/:id', async (req, res) => {
  const user = await User.find(req.params.id);
  inspect(user, 'Database User');
  
  const transformed = new UserResource(user);
  inspect(transformed, 'Transformed Response');
  
  res.json(transformed);
});
```

### 2. Debug Validation Errors

```javascript
try {
  await schema.validate(data);
} catch (error) {
  inspect(error, 'Validation Error');
  inspect(error.details, 'Error Details');
  throw error;
}
```

### 3. Debug Database Queries

```javascript
const query = User.where('status', 'active')
  .with('orders')
  .orderBy('created_at', 'desc');

inspect(query.toSql(), 'SQL Query');

const users = await query.get();
inspect(users, 'Query Results');
```

### 4. Debug Middleware

```javascript
export const debugMiddleware = (req, res, next) => {
  inspect({
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
    user: req.user
  }, 'Request Debug');
  
  next();
};
```

### 5. Debug Payment Processing

```javascript
const payment = await PaymentGateway.createPayment({
  amount: 1000,
  currency: 'INR'
});

inspect(payment, 'Payment Created');

const verified = await PaymentGateway.verifyPayment(payment.id);
inspect(verified, 'Payment Verified');

if (!verified.success) {
  dd(verified, 'Payment Verification Failed'); // Stop here!
}
```

### 6. Debug Complex Nested Objects

```javascript
const response = {
  user: { id: 1, name: 'John' },
  orders: [
    { id: 1, items: [...], total: 100 },
    { id: 2, items: [...], total: 200 }
  ],
  metadata: { timestamp: new Date() }
};

inspect(response, 'Complex Response');
// Fully expanded, colored output with proper indentation
```

## Supported Data Types

Works with **all JavaScript types**:

- ✅ Objects (plain, nested, circular references)
- ✅ Arrays (including large arrays)
- ✅ Strings, Numbers, Booleans
- ✅ null, undefined
- ✅ Dates
- ✅ Errors
- ✅ Promises
- ✅ Functions
- ✅ Symbols
- ✅ Map, Set, WeakMap, WeakSet
- ✅ Buffer
- ✅ Regular Expressions

## OOP Approach

```javascript
import { DebugHelper } from '@vasuzex/framework/Support/Helpers/DebugHelper';

// Use as static methods
DebugHelper.inspect(value, 'Label');
DebugHelper.dd(value);
```

## Tips

### When to use `inspect()`
- ✅ Debugging during development
- ✅ Logging without stopping execution
- ✅ Checking intermediate values in a pipeline
- ✅ Debugging middleware
- ✅ Quick data inspection

### When to use `dd()`
- ✅ Fatal debugging - need to stop immediately
- ✅ Investigating a specific point in code
- ✅ When you want to prevent further execution
- ✅ Debugging production issues (temporarily)

### Best Practices

1. **Remove before production**: Both functions are for development
2. **Use labels**: Makes output easier to understand
3. **Chain inspects**: Use multiple `inspect()` calls to trace data flow
4. **dd() strategically**: Use only when you need to stop execution

## Comparison with console.log

| Feature | console.log | inspect() | dd() |
|---------|-------------|-----------|------|
| Colors | ❌ | ✅ | ✅ |
| Pretty Print | ❌ | ✅ | ✅ |
| File Location | ❌ | ✅ | ✅ |
| Labels | ❌ | ✅ | ✅ |
| Stops Execution | ❌ | ❌ | ✅ |
| Deep Objects | Partial | ✅ | ✅ |
| Circular Refs | ❌ | ✅ | ✅ |

## Example Output

**Before (console.log):**
```
{ id: 1, name: 'John', email: 'john@example.com', orders: [Object] }
```

**After (inspect/dd):**
```
════════════════════════════════════════════════════════════════════════════════
🔍 INSPECT @ UserService.js:42
📋 User with Orders
────────────────────────────────────────────────────────────────────────────────
{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  orders: [
    {
      id: 1,
      total: 100,
      items: [
        { name: 'Product 1', price: 50 },
        { name: 'Product 2', price: 50 }
      ]
    },
    {
      id: 2,
      total: 200,
      items: [
        { name: 'Product 3', price: 200 }
      ]
    }
  ]
}
════════════════════════════════════════════════════════════════════════════════
```

## Run Examples

```bash
# Run the example file
node examples/debug-example.js

# See all supported data types
# See chained inspects
# See dd() behavior (commented out)
```

## Testing

```bash
pnpm test tests/unit/Support/Helpers/DebugHelper.test.js
```

**23 tests, all passing! ✅**

## License

MIT
