# StringHelper - String Manipulation Utilities

Comprehensive string manipulation utilities for the Vasuzex framework, including slug generation, case conversion, truncation, and more.

## Features

- 🔗 **Slug Generation** - Create URL-friendly slugs with extensive options
- 📝 **Case Conversion** - Convert between camelCase, PascalCase, snake_case, kebab-case
- ✂️ **Truncation** - Safely truncate strings with custom endings
- 🔤 **Text Formatting** - Capitalize, title case, padding, whitespace normalization
- 🔍 **String Checking** - Check for substrings, prefixes, suffixes (case-insensitive)
- 🎲 **Random Strings** - Generate random strings with custom character sets
- 👤 **Initials** - Extract initials from names

## Installation

Already included in Vasuzex framework!

```javascript
import { generateSlug, StringHelper } from 'vasuzex';

// Or import specific functions
import { generateSlug, toCamelCase, truncate } from 'vasuzex';
```

## Usage

### Slug Generation

The most powerful feature - generate URL-friendly slugs with extensive customization:

```javascript
import { generateSlug } from 'vasuzex';

// Basic usage
generateSlug('Hello World');  // 'hello-world'
generateSlug('Store Name 123');  // 'store-name-123'

// Handle special characters and unicode
generateSlug('Café & Restaurant');  // 'cafe-restaurant'
generateSlug('São Paulo');  // 'sao-paulo'

// Custom separator
generateSlug('Hello World', { separator: '_' });  // 'hello_world'

// Strict mode (only alphanumeric + separator)
generateSlug('Hello@World#123', { strict: true });  // 'helloworld123'

// Max length
generateSlug('Very Long Title That Should Be Truncated', { 
  maxLength: 20 
});  // 'very-long-title-that'

// Custom remove pattern
generateSlug('Hello [World]', { 
  remove: /[\[\]]/g 
});  // 'hello-world'

// All options
generateSlug('Complex Title!', {
  separator: '-',      // Separator character (default: '-')
  lowercase: true,     // Convert to lowercase (default: true)
  trim: true,          // Trim whitespace (default: true)
  replacement: '',     // Replace invalid chars with (default: '')
  remove: null,        // RegExp pattern to remove (default: null)
  strict: false,       // Remove all non-alphanumeric (default: false)
  locale: 'en',        // Locale for case conversion (default: 'en')
  maxLength: null      // Max slug length (default: null)
});
```

### Case Conversion

```javascript
import { toCamelCase, toPascalCase, toSnakeCase, toKebabCase } from 'vasuzex';

// camelCase
toCamelCase('hello-world');  // 'helloWorld'
toCamelCase('hello_world');  // 'helloWorld'
toCamelCase('Hello World');  // 'helloWorld'

// PascalCase
toPascalCase('hello-world');  // 'HelloWorld'
toPascalCase('hello_world');  // 'HelloWorld'

// snake_case
toSnakeCase('helloWorld');   // 'hello_world'
toSnakeCase('HelloWorld');   // 'hello_world'

// kebab-case
toKebabCase('helloWorld');   // 'hello-world'
toKebabCase('HelloWorld');   // 'hello-world'
```

### String Truncation

```javascript
import { truncate } from 'vasuzex';

truncate('Hello World', 8);              // 'Hello...'
truncate('Hello World', 8, '…');         // 'Hello W…'
truncate('Hello World', 8, ' [more]');   // 'H [more]'
```

### Text Formatting

```javascript
import { 
  capitalize, 
  toTitleCase, 
  pad, 
  normalizeWhitespace 
} from 'vasuzex';

// Capitalize first letter
capitalize('hello');  // 'Hello'

// Title case (capitalize each word)
toTitleCase('hello world');  // 'Hello World'

// Padding
pad('42', 5, '0', 'left');   // '00042'
pad('test', 10, '-', 'right');  // 'test------'
pad('hi', 6, '*', 'both');   // '**hi**'

// Normalize whitespace
normalizeWhitespace('Hello   World');  // 'Hello World'
```

### String Checking

```javascript
import { contains, startsWith, endsWith } from 'vasuzex';

// Case-insensitive checks
contains('Hello World', 'world');     // true
startsWith('Hello World', 'hello');   // true
endsWith('Hello World', 'WORLD');     // true
```

### Random Strings

```javascript
import { randomString } from 'vasuzex';

randomString(10);                      // 'Kx8fJ2mN4p'
randomString(6, '0123456789');         // '482719'
randomString(8, 'ABCDEF0123456789');   // 'A3F9C2E1'
```

### Extract Initials

```javascript
import { getInitials } from 'vasuzex';

getInitials('John Doe');              // 'JD'
getInitials('John Michael Doe', 3);   // 'JMD'
getInitials('alice bob');             // 'AB' (auto-uppercase)
```

## OOP Approach

You can also use the class-based API:

```javascript
import { StringHelper } from 'vasuzex';

StringHelper.generateSlug('Hello World');  // 'hello-world'
StringHelper.toCamelCase('hello-world');   // 'helloWorld'
StringHelper.truncate('Hello', 3);         // 'Hel...'
```

## Real-World Examples

### E-commerce Store Slugs

```javascript
import { generateSlug } from 'vasuzex';

// Product slug
const product = {
  name: 'iPhone 15 Pro Max - 256GB',
  slug: generateSlug(product.name)  // 'iphone-15-pro-max-256gb'
};

// Store slug with strict mode
const store = {
  name: 'Café & Co. - Premium Coffee',
  slug: generateSlug(store.name, { 
    strict: true,
    maxLength: 30 
  })  // 'cafe-co-premium-coffee'
};

// Category slug with custom separator
const category = {
  name: 'Electronics & Gadgets',
  slug: generateSlug(category.name, { 
    separator: '_' 
  })  // 'electronics_gadgets'
};
```

### Form Field Naming

```javascript
import { toCamelCase, toSnakeCase } from 'vasuzex';

// Convert database column to JS property
const dbColumn = 'user_first_name';
const jsProperty = toCamelCase(dbColumn);  // 'userFirstName'

// Convert JS property to database column
const jsField = 'shippingAddress';
const dbField = toSnakeCase(jsField);  // 'shipping_address'
```

### User Display Names

```javascript
import { getInitials, truncate } from 'vasuzex';

const user = {
  name: 'John Michael Doe',
  initials: getInitials(user.name),  // 'JD'
  shortName: truncate(user.name, 15)  // 'John Micha...'
};

// Avatar with initials
function Avatar({ user }) {
  return <div className="avatar">{getInitials(user.name)}</div>;
}
```

### API Token Generation

```javascript
import { randomString } from 'vasuzex';

// Generate API key
const apiKey = randomString(32);  // Random 32-char alphanumeric

// Generate numeric PIN
const pin = randomString(6, '0123456789');  // 6-digit PIN

// Generate hex token
const hexToken = randomString(16, '0123456789ABCDEF');
```

### Data Formatting

```javascript
import { pad, capitalize, toTitleCase } from 'vasuzex';

// Invoice number with padding
const invoiceId = 42;
const invoiceNumber = `INV-${pad(String(invoiceId), 6, '0', 'left')}`;
// 'INV-000042'

// Format user input
const rawInput = 'john doe';
const formattedName = toTitleCase(rawInput);  // 'John Doe'

// Format status
const status = 'pending';
const displayStatus = capitalize(status);  // 'Pending'
```

## Function Reference

| Function | Description | Example |
|----------|-------------|---------|
| `generateSlug(str, options)` | Generate URL-friendly slug | `generateSlug('Hello World')` → `'hello-world'` |
| `toCamelCase(str)` | Convert to camelCase | `toCamelCase('hello-world')` → `'helloWorld'` |
| `toPascalCase(str)` | Convert to PascalCase | `toPascalCase('hello-world')` → `'HelloWorld'` |
| `toSnakeCase(str)` | Convert to snake_case | `toSnakeCase('helloWorld')` → `'hello_world'` |
| `toKebabCase(str)` | Convert to kebab-case | `toKebabCase('helloWorld')` → `'hello-world'` |
| `truncate(str, length, ending)` | Truncate string | `truncate('Hello World', 8)` → `'Hello...'` |
| `capitalize(str)` | Capitalize first letter | `capitalize('hello')` → `'Hello'` |
| `toTitleCase(str)` | Title case all words | `toTitleCase('hello world')` → `'Hello World'` |
| `contains(str, needle)` | Check substring (case-insensitive) | `contains('Hello', 'hello')` → `true` |
| `startsWith(str, needle)` | Check prefix (case-insensitive) | `startsWith('Hello', 'he')` → `true` |
| `endsWith(str, needle)` | Check suffix (case-insensitive) | `endsWith('Hello', 'LO')` → `true` |
| `randomString(length, chars)` | Generate random string | `randomString(10)` → `'Kx8fJ2mN4p'` |
| `pad(str, length, char, dir)` | Pad string | `pad('42', 5, '0', 'left')` → `'00042'` |
| `removeWhitespace(str)` | Remove all whitespace | `removeWhitespace('Hello World')` → `'HelloWorld'` |
| `normalizeWhitespace(str)` | Normalize whitespace | `normalizeWhitespace('A  B')` → `'A B'` |
| `getInitials(name, max)` | Extract initials | `getInitials('John Doe')` → `'JD'` |

## Options for generateSlug()

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `separator` | string | `'-'` | Character to separate words |
| `lowercase` | boolean | `true` | Convert to lowercase |
| `trim` | boolean | `true` | Trim whitespace |
| `replacement` | string | `''` | Character to replace invalid chars |
| `remove` | RegExp | `null` | Pattern to remove from string |
| `strict` | boolean | `false` | Remove all non-alphanumeric |
| `locale` | string | `'en'` | Locale for case conversion |
| `maxLength` | number | `null` | Maximum slug length |

## Testing

```bash
npm test tests/unit/Support/Helpers/StringHelper.test.js
```

All functions have comprehensive test coverage (64 tests).

## Migration from SanitizationHelper

If you were using the old `slugify()` from SanitizationHelper:

```javascript
// Old (still works)
import { slugify } from 'vasuzex';
slugify('Hello World');  // 'hello-world'

// New (recommended - more features)
import { generateSlug } from 'vasuzex';
generateSlug('Hello World');  // 'hello-world'
generateSlug('Hello World', { maxLength: 20, strict: true });
```

The old `slugify()` is simpler, the new `generateSlug()` is more powerful.

## Tips

1. **Use strict mode for user-generated slugs**: Prevents special characters from breaking URLs
   ```javascript
   generateSlug(userInput, { strict: true, maxLength: 50 });
   ```

2. **Preserve database consistency**: Use the same options every time
   ```javascript
   const SLUG_OPTIONS = { separator: '-', strict: true, maxLength: 100 };
   generateSlug(title, SLUG_OPTIONS);
   ```

3. **Combine with uniqueness check**:
   ```javascript
   let slug = generateSlug(store.name);
   let counter = 1;
   while (await Store.where('slug', slug).first()) {
     slug = `${generateSlug(store.name)}-${counter++}`;
   }
   ```

4. **Use for filename generation**:
   ```javascript
   const filename = `${generateSlug(title)}-${Date.now()}.pdf`;
   ```

## License

MIT - Part of Vasuzex Framework
