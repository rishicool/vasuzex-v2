# StringHelper Quick Reference

Quick reference guide for all StringHelper functions available in vasuzex-v2.

## Import

```javascript
import { 
  generateSlug,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  capitalize,
  toTitleCase,
  contains,
  startsWith,
  endsWith,
  randomString,
  pad,
  removeWhitespace,
  normalizeWhitespace,
  getInitials
} from 'vasuzex';
```

## Functions

### generateSlug(str, options?)

Generate URL-friendly slug from string.

```javascript
generateSlug('Hello World')  // 'hello-world'
generateSlug('Café & Restaurant')  // 'cafe-restaurant'
generateSlug('Title', { maxLength: 20, strict: true })
```

**Options**:
- `separator: string` - Default: `'-'`
- `lowercase: boolean` - Default: `true`
- `strict: boolean` - Default: `false`
- `maxLength: number` - Default: `null`
- `trim: boolean` - Default: `true`
- `replacement: string` - Default: `''`
- `remove: RegExp` - Default: `null`
- `locale: string` - Default: `'en'`

---

### toCamelCase(str)

Convert string to camelCase.

```javascript
toCamelCase('hello-world')  // 'helloWorld'
toCamelCase('hello_world')  // 'helloWorld'
toCamelCase('Hello World')  // 'helloWorld'
```

---

### toPascalCase(str)

Convert string to PascalCase.

```javascript
toPascalCase('hello-world')  // 'HelloWorld'
toPascalCase('hello_world')  // 'HelloWorld'
```

---

### toSnakeCase(str)

Convert string to snake_case.

```javascript
toSnakeCase('helloWorld')   // 'hello_world'
toSnakeCase('HelloWorld')   // 'hello_world'
```

---

### toKebabCase(str)

Convert string to kebab-case.

```javascript
toKebabCase('helloWorld')   // 'hello-world'
toKebabCase('HelloWorld')   // 'hello-world'
```

---

### truncate(str, length, ending?)

Truncate string to specified length.

```javascript
truncate('Hello World', 8)              // 'Hello...'
truncate('Hello World', 8, '…')         // 'Hello W…'
truncate('Hello World', 8, ' [more]')   // 'H [more]'
```

**Default ending**: `'...'`

---

### capitalize(str)

Capitalize first letter of string.

```javascript
capitalize('hello')        // 'Hello'
capitalize('hello world')  // 'Hello world'
```

---

### toTitleCase(str)

Capitalize first letter of each word.

```javascript
toTitleCase('hello world')  // 'Hello World'
toTitleCase('the quick brown fox')  // 'The Quick Brown Fox'
```

---

### contains(str, needle)

Check if string contains substring (case-insensitive).

```javascript
contains('Hello World', 'world')  // true
contains('Hello World', 'WORLD')  // true
contains('Hello World', 'foo')    // false
```

---

### startsWith(str, needle)

Check if string starts with substring (case-insensitive).

```javascript
startsWith('Hello World', 'hello')  // true
startsWith('Hello World', 'HELLO')  // true
startsWith('Hello World', 'world')  // false
```

---

### endsWith(str, needle)

Check if string ends with substring (case-insensitive).

```javascript
endsWith('Hello World', 'world')  // true
endsWith('Hello World', 'WORLD')  // true
endsWith('Hello World', 'hello')  // false
```

---

### randomString(length?, chars?)

Generate random string.

```javascript
randomString()                       // 32-char alphanumeric (default)
randomString(10)                     // 10-char alphanumeric
randomString(6, '0123456789')        // 6-digit number
randomString(8, 'ABCDEF0123456789')  // 8-char hex
```

**Defaults**:
- `length`: `32`
- `chars`: `'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'`

---

### pad(str, length, padChar?, direction?)

Pad string to specified length.

```javascript
pad('42', 5, '0', 'left')    // '00042'
pad('test', 10, '-', 'right')  // 'test------'
pad('hi', 6, '*', 'both')    // '**hi**'
```

**Defaults**:
- `padChar`: `' '` (space)
- `direction`: `'right'`

**Directions**: `'left'`, `'right'`, `'both'`

---

### removeWhitespace(str)

Remove all whitespace from string.

```javascript
removeWhitespace('Hello World')        // 'HelloWorld'
removeWhitespace('  Hello   World  ')  // 'HelloWorld'
removeWhitespace('Hello\tWorld\n')     // 'HelloWorld'
```

---

### normalizeWhitespace(str)

Replace multiple spaces with single space and trim.

```javascript
normalizeWhitespace('Hello   World')       // 'Hello World'
normalizeWhitespace('  Hello   World  ')   // 'Hello World'
normalizeWhitespace('Hello\t\tWorld')      // 'Hello World'
```

---

### getInitials(name, maxInitials?)

Extract initials from name.

```javascript
getInitials('John Doe')              // 'JD'
getInitials('John Michael Doe', 3)   // 'JMD'
getInitials('alice bob')             // 'AB' (auto-uppercase)
getInitials('John')                  // 'J'
```

**Default maxInitials**: `2`

---

## OOP Style

All functions also available via `StringHelper` class:

```javascript
import { StringHelper } from 'vasuzex';

StringHelper.generateSlug('Hello World')  // 'hello-world'
StringHelper.toCamelCase('hello-world')   // 'helloWorld'
StringHelper.truncate('Hello', 3)         // 'Hel...'
```

---

## Common Use Cases

### Store/Product Slugs

```javascript
const slug = generateSlug(name, { 
  maxLength: 60, 
  strict: true 
});
```

### Database Field Conversion

```javascript
const jsField = toCamelCase('user_first_name');  // 'userFirstName'
const dbField = toSnakeCase('shippingAddress');  // 'shipping_address'
```

### Display Names

```javascript
const shortName = truncate(name, 20);
const initials = getInitials(name);
const formatted = toTitleCase(name);
```

### API Tokens

```javascript
const apiKey = randomString(32);
const pin = randomString(6, '0123456789');
```

### File Names

```javascript
const filename = `${generateSlug(title)}-${Date.now()}.pdf`;
```

---

## Testing

All functions are thoroughly tested:

```bash
npm test tests/unit/Support/Helpers/StringHelper.test.js
```

64 tests covering all functions and edge cases.

---

## Full Documentation

For detailed documentation with examples: [docs/helpers/string-helper.md](../docs/helpers/string-helper.md)
