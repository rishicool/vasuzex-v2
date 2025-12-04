# Formatter Service

Laravel-style formatting utilities for dates, currency, numbers, and text.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Basic Usage](#basic-usage)
- [Date & Time Formatting](#date--time-formatting)
- [Currency & Number Formatting](#currency--number-formatting)
- [Text Formatting](#text-formatting)
- [Indian Number System](#indian-number-system)
- [API Reference](#api-reference)

## Installation

The Formatter service is automatically registered via `FormatterServiceProvider`.

## Configuration

Configure in `config/formatter.cjs`:

```javascript
module.exports = {
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  phoneFormat: 'spaced',
  // ... more options
};
```

Environment variables:
```env
APP_LOCALE=en-IN
APP_TIMEZONE=Asia/Kolkata
APP_CURRENCY=INR
```

## Basic Usage

### Using the Facade

```javascript
import { Format } from 'vasuzex';

// Date formatting
Format.date(new Date()); // "12/03/2025"
Format.datetime(new Date()); // "12/03/2025 10:30 AM"
Format.relativeTime(pastDate); // "2 hours ago"

// Currency
Format.currency(1000); // "₹1,000"
Format.currency(1000.50, 'USD', 2); // "$1,000.50"

// Numbers
Format.number(123456); // "1,23,456" (Indian system)
Format.phone('9876543210'); // "98765 43210"
Format.fileSize(1024); // "1 KB"

// Text
Format.truncate('Long text...', 10); // "Long te..."
Format.capitalize('hello'); // "Hello"
Format.title('hello world'); // "Hello World"
```

### Using the Service Instance

```javascript
const formatter = app.make('formatter');

formatter.date(new Date());
formatter.currency(1000);
```

## Date & Time Formatting

### date(date, format = 'short')

Format date:

```javascript
Format.date(new Date()); // "12/03/2025"
Format.date(new Date(), 'long'); // "March 12, 2025"
Format.date('2025-03-12'); // "12/03/2025"
Format.date(null); // "-"
```

**Formats:**
- `short`: "12/03/2025"
- `long`: "March 12, 2025"

### time(date, use24Hour = false)

Format time:

```javascript
Format.time(new Date()); // "10:30 AM"
Format.time(new Date(), true); // "10:30"
```

### datetime(date, format = 'short')

Format date and time:

```javascript
Format.datetime(new Date()); // "12/03/2025 10:30 AM"
Format.datetime(new Date(), 'long'); // "March 12, 2025 10:30 AM"
```

### relativeTime(date)

Human-readable relative time:

```javascript
const now = new Date();
const past = new Date(now.getTime() - 3600000);

Format.relativeTime(past); // "1 hour ago"
```

**Output examples:**
- "just now" (< 10 seconds)
- "30 seconds ago"
- "5 minutes ago"
- "2 hours ago"
- "yesterday"
- "3 days ago"
- "2 weeks ago"
- "3 months ago"
- "1 year ago"

### duration(seconds)

Format duration:

```javascript
Format.duration(90); // "1m 30s"
Format.duration(3665); // "1h 1m 5s"
Format.duration(45); // "45s"
```

## Currency & Number Formatting

### currency(amount, currency = 'INR', decimals = null)

Format currency:

```javascript
// Indian Rupees (default, no decimals)
Format.currency(1000); // "₹1,000"
Format.currency(1500.75); // "₹1,501"

// USD with decimals
Format.currency(1000.50, 'USD', 2); // "$1,000.50"

// Custom decimals
Format.currency(1000, 'INR', 2); // "₹1,000.00"
```

### number(num, decimals = 0)

Format number with Indian number system:

```javascript
Format.number(123456); // "1,23,456"
Format.number(1234567); // "12,34,567"
Format.number(12.345, 2); // "12.35"
```

### percentage(value, decimals = 0)

Format percentage:

```javascript
Format.percentage(75); // "75%"
Format.percentage(66.666, 2); // "66.67%"
```

### fileSize(bytes, decimals = 2)

Format file size:

```javascript
Format.fileSize(1024); // "1 KB"
Format.fileSize(1536, 2); // "1.50 KB"
Format.fileSize(1048576); // "1 MB"
Format.fileSize(0); // "0 Bytes"
```

### phone(phone, format = 'spaced')

Format phone number:

```javascript
Format.phone('9876543210'); // "98765 43210"
Format.phone('9876543210', 'dashed'); // "98765-43210"
Format.phone('9876543210', 'grouped'); // "987 654 3210"
```

**Formats:**
- `spaced`: "98765 43210"
- `dashed`: "98765-43210"
- `grouped`: "987 654 3210"

## Text Formatting

### truncate(text, maxLength, suffix = '...')

Truncate text:

```javascript
Format.truncate('This is a long text', 10); // "This is..."
Format.truncate('Short', 10); // "Short"
Format.truncate('Long text', 10, ' [more]'); // "Long [more]"
```

### capitalize(text)

Capitalize first letter:

```javascript
Format.capitalize('hello'); // "Hello"
Format.capitalize('HELLO'); // "Hello"
```

### title(text)

Title case (capitalize each word):

```javascript
Format.title('hello world'); // "Hello World"
Format.title('the quick brown fox'); // "The Quick Brown Fox"
```

### Case Conversion

```javascript
// Snake case
Format.snake('HelloWorld'); // "hello_world"
Format.snake('helloWorld'); // "hello_world"

// Kebab case
Format.kebab('HelloWorld'); // "hello-world"
Format.kebab('helloWorld'); // "hello-world"

// Camel case
Format.camel('hello_world'); // "helloWorld"
Format.camel('hello-world'); // "helloWorld"

// Studly case (PascalCase)
Format.studly('hello_world'); // "HelloWorld"
Format.studly('hello-world'); // "HelloWorld"
```

### plural(count, singular, plural = null)

Pluralize words:

```javascript
Format.plural(1, 'item'); // "item"
Format.plural(5, 'item'); // "items"
Format.plural(1, 'person', 'people'); // "person"
Format.plural(5, 'person', 'people'); // "people"
```

### boolean(value, trueText = 'Yes', falseText = 'No')

Format boolean:

```javascript
Format.boolean(true); // "Yes"
Format.boolean(false); // "No"
Format.boolean(true, 'Active', 'Inactive'); // "Active"
```

### list(array, separator = ', ', lastSeparator = ' and ')

Format array as list:

```javascript
Format.list(['apple', 'banana', 'cherry']);
// "apple, banana and cherry"

Format.list(['item1', 'item2']);
// "item1 and item2"

Format.list(['one']);
// "one"
```

### ordinal(num)

Format ordinal number:

```javascript
Format.ordinal(1); // "1st"
Format.ordinal(2); // "2nd"
Format.ordinal(3); // "3rd"
Format.ordinal(4); // "4th"
Format.ordinal(21); // "21st"
```

## Indian Number System

### indianNumber(num)

Format with Indian units (L for Lakh, Cr for Crore):

```javascript
Format.indianNumber(1000); // "1.00K"
Format.indianNumber(100000); // "1.00L"
Format.indianNumber(10000000); // "1.00Cr"
```

### rupeeWords(amount)

Convert amount to words:

```javascript
Format.rupeeWords(100); // "One Hundred Rupees"
Format.rupeeWords(1000); // "One Thousand Rupees"
Format.rupeeWords(100000); // "One Lakh Rupees"
Format.rupeeWords(10000000); // "One Crore Rupees"
Format.rupeeWords(12345); // "Twelve Thousand Three Hundred Forty Five Rupees"
```

## API Reference

### Date & Time Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `date()` | `date`, `format='short'` | string | Format date |
| `time()` | `date`, `use24Hour=false` | string | Format time |
| `datetime()` | `date`, `format='short'` | string | Format datetime |
| `relativeTime()` | `date` | string | Relative time ("2 hours ago") |
| `duration()` | `seconds` | string | Format duration ("1h 30m") |

### Currency & Number Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `currency()` | `amount`, `currency='INR'`, `decimals=null` | string | Format currency |
| `number()` | `num`, `decimals=0` | string | Format number |
| `percentage()` | `value`, `decimals=0` | string | Format percentage |
| `fileSize()` | `bytes`, `decimals=2` | string | Format file size |
| `phone()` | `phone`, `format='spaced'` | string | Format phone |
| `indianNumber()` | `num` | string | Format with L/Cr |
| `rupeeWords()` | `amount` | string | Amount in words |

### Text Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `truncate()` | `text`, `maxLength`, `suffix='...'` | string | Truncate text |
| `capitalize()` | `text` | string | Capitalize first letter |
| `title()` | `text` | string | Title case |
| `snake()` | `text` | string | Snake case |
| `kebab()` | `text` | string | Kebab case |
| `camel()` | `text` | string | Camel case |
| `studly()` | `text` | string | Studly case |
| `plural()` | `count`, `singular`, `plural=null` | string | Pluralize |
| `boolean()` | `value`, `trueText='Yes'`, `falseText='No'` | string | Format boolean |
| `list()` | `array`, `separator=', '`, `lastSeparator=' and '` | string | Format list |
| `ordinal()` | `num` | string | Ordinal number |

## Examples

See `examples/formatter-example.js` for complete working examples.

## Notes

- All methods handle null/undefined gracefully, returning "-" or empty string
- Date parsing is lenient - accepts Date objects, ISO strings, timestamps
- Currency formatting uses Intl.NumberFormat for accuracy
- Phone formatting assumes 10-digit Indian numbers
- Indian number system: 1,000 (thousand), 1,00,000 (lakh), 1,00,00,000 (crore)
