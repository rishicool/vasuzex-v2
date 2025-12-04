# Validation Service

Laravel-style validation with Indian validators (Phone, PAN, IFSC, Aadhaar, GSTIN, etc.).

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Available Rules](#available-rules)
- [Indian Validators](#indian-validators)
- [Custom Validation](#custom-validation)
- [Error Messages](#error-messages)
- [API Reference](#api-reference)

## Installation

The Validation service is automatically available through dependency injection.

## Basic Usage

### Using the Validator Facade

```javascript
import { Validator } from 'vasuzex';

const data = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
};

const rules = {
  name: 'required|string|min:3|max:50',
  email: 'required|email',
  age: 'required|integer|min:18',
};

try {
  const validated = await Validator.make(data, rules).validate();
  console.log('Validated data:', validated);
} catch (error) {
  console.log('Validation errors:', error.errors);
}
```

### Using Validation Factory

```javascript
const validator = app.make('validator');

const data = { email: 'invalid-email' };
const rules = { email: 'required|email' };

const v = validator.make(data, rules);

if (await v.fails()) {
  console.log('Errors:', v.errors());
}
```

### Checking Validation Result

```javascript
const validator = Validator.make(data, rules);

// Check if passes
if (await validator.passes()) {
  console.log('Validation passed!');
}

// Check if fails
if (await validator.fails()) {
  console.log('Validation failed!');
  console.log(validator.errors());
}

// Get validated data
try {
  const validated = await validator.validate();
  // Use validated data
} catch (error) {
  // Handle validation errors
}
```

## Available Rules

### Basic Rules

| Rule | Description | Example |
|------|-------------|---------|
| `required` | Field must be present | `'required'` |
| `optional` | Field is optional | `'optional'` |
| `nullable` | Field can be null/empty | `'nullable'` |

### Type Rules

| Rule | Description | Example |
|------|-------------|---------|
| `string` | Must be string | `'string'` |
| `number` | Must be number | `'number'` |
| `numeric` | Must be numeric | `'numeric'` |
| `integer` | Must be integer | `'integer'` |
| `boolean` | Must be boolean | `'boolean'` |
| `array` | Must be array | `'array'` |
| `object` | Must be object | `'object'` |
| `date` | Must be valid date | `'date'` |

### String Rules

| Rule | Description | Example |
|------|-------------|---------|
| `email` | Valid email | `'email'` |
| `url` | Valid URL | `'url'` |
| `uuid` | Valid UUID | `'uuid'` |
| `ip` | Valid IP address | `'ip'` |
| `alpha` | Only letters | `'alpha'` |
| `alpha_num` | Letters and numbers | `'alpha_num'` |
| `alpha_dash` | Letters, numbers, dash, underscore | `'alpha_dash'` |
| `json` | Valid JSON string | `'json'` |

### Size Rules

| Rule | Description | Example |
|------|-------------|---------|
| `min:value` | Minimum length/value | `'min:3'` |
| `max:value` | Maximum length/value | `'max:50'` |
| `between:min,max` | Between min and max | `'between:3,10'` |

### Value Rules

| Rule | Description | Example |
|------|-------------|---------|
| `in:val1,val2` | Must be one of values | `'in:admin,user,guest'` |
| `not_in:val1,val2` | Must not be one of values | `'not_in:banned,restricted'` |
| `regex:pattern` | Match regex pattern | `'regex:^[A-Z]'` |

## Indian Validators

### Phone Number (`phone`, `indian_phone`)

Validates 10-digit Indian mobile number (starts with 6-9):

```javascript
const rules = {
  mobile: 'required|phone',
};

// Valid: 9876543210, 8123456789, 7000000000
// Invalid: 5876543210 (starts with 5), 98765432 (too short)
```

### PIN Code (`pincode`)

Validates 6-digit Indian PIN code (cannot start with 0):

```javascript
const rules = {
  pincode: 'required|pincode',
};

// Valid: 110001, 400001, 560001
// Invalid: 011001 (starts with 0), 1100 (too short)
```

### IFSC Code (`ifsc`)

Validates Indian bank IFSC code (11 characters: 4 letters + 0 + 6 alphanumeric):

```javascript
const rules = {
  bankIfsc: 'required|ifsc',
};

// Valid: SBIN0001234, HDFC0000123, ICIC0001234
// Invalid: SBIN1001234 (5th char must be 0)
```

### PAN Card (`pan`)

Validates PAN card number (10 characters: 5 letters + 4 digits + 1 letter):

```javascript
const rules = {
  panNumber: 'required|pan',
};

// Valid: ABCDE1234F, AAAPL1234C
// Invalid: ABC1234567 (wrong format), abcde1234f (lowercase)
```

### Aadhaar (`aadhaar`)

Validates Aadhaar number (12 digits, cannot start with 0 or 1, includes Verhoeff checksum):

```javascript
const rules = {
  aadhaarNumber: 'required|aadhaar',
};

// Valid: 234567890123 (12 digits, starts with 2-9)
// Invalid: 123456789012 (starts with 1), 23456789012 (too short)
```

### GSTIN (`gstin`)

Validates GST Identification Number (15 characters):

```javascript
const rules = {
  gstNumber: 'required|gstin',
};

// Valid: 29ABCDE1234F1Z5, 07AAAPL1234C1ZF
// Invalid: 29ABCDE1234F1Z (too short)
```

### Vehicle Number (`vehicle_number`)

Validates Indian vehicle registration number:

```javascript
const rules = {
  vehicleReg: 'required|vehicle_number',
};

// Valid: DL01AB1234, MH12DE5678, DL-01-AB-1234
// Invalid: DL01A12345 (wrong format)
```

### UPI ID (`upi`)

Validates UPI ID (username@bank):

```javascript
const rules = {
  upiId: 'required|upi',
};

// Valid: user@paytm, john.doe@ybl, user_123@phonepe
// Invalid: user@ (no bank), @bank (no username)
```

### Passport (`passport`)

Validates Indian passport number (1 letter + 7 digits):

```javascript
const rules = {
  passportNumber: 'required|passport',
};

// Valid: A1234567, Z9876543
// Invalid: a1234567 (lowercase), A123456 (too short)
```

### Voter ID (`voter_id`)

Validates voter ID card number (3 letters + 7 digits):

```javascript
const rules = {
  voterIdNumber: 'required|voter_id',
};

// Valid: ABC1234567, XYZ9876543
// Invalid: AB1234567 (2 letters), ABCD1234567 (4 letters)
```

## Custom Validation

### Register Custom Rule

```javascript
const validator = app.make('validator');

// Register custom rule
validator.extend('is_even', (value) => {
  return parseInt(value) % 2 === 0;
}, 'The {field} must be an even number');

// Use custom rule
const rules = {
  number: 'required|is_even',
};
```

### Using Custom Rule in Validation

```javascript
validator.extend('contains_word', (value, word) => {
  return value.includes(word);
}, 'The {field} must contain the word {params}');

const rules = {
  description: 'required|contains_word:important',
};
```

## Error Messages

### Default Error Messages

Validation errors are automatically formatted:

```javascript
{
  email: ['Email must be a valid email address'],
  age: ['Age must be greater than or equal to 18'],
  phone: ['Phone number must be 10 digits starting with 6-9']
}
```

### Custom Error Messages

```javascript
const messages = {
  'email.required': 'Email is required',
  'email.email': 'Please provide a valid email address',
  'age.min': 'You must be at least 18 years old',
  'phone.phone': 'Please enter a valid Indian mobile number',
};

const validator = Validator.make(data, rules, messages);
```

### Field-Specific Messages

```javascript
const messages = {
  'user_email.required': 'User email cannot be empty',
  'user_email.email': 'Invalid user email format',
};
```

### Custom Attributes

```javascript
const customAttributes = {
  user_email: 'email address',
  contact_number: 'phone number',
};

const validator = Validator.make(data, rules, {}, customAttributes);
```

## Real-World Examples

### User Registration

```javascript
const data = {
  name: 'Ravi Kumar',
  email: 'ravi@example.com',
  phone: '9876543210',
  password: 'secret123',
  age: 25,
};

const rules = {
  name: 'required|string|min:3|max:50',
  email: 'required|email',
  phone: 'required|phone',
  password: 'required|string|min:8',
  age: 'required|integer|min:18',
};

try {
  const validated = await Validator.make(data, rules).validate();
  // Create user with validated data
} catch (error) {
  // Show validation errors
}
```

### KYC Verification

```javascript
const kycData = {
  fullName: 'Ravi Kumar',
  phone: '9876543210',
  aadhaar: '234567890123',
  pan: 'ABCDE1234F',
  address: '123 Main Street',
  pincode: '110001',
  bankIfsc: 'SBIN0001234',
  accountNumber: '12345678901234',
};

const kycRules = {
  fullName: 'required|string|min:3',
  phone: 'required|phone',
  aadhaar: 'required|aadhaar',
  pan: 'required|pan',
  address: 'required|string|min:10',
  pincode: 'required|pincode',
  bankIfsc: 'required|ifsc',
  accountNumber: 'required|string|min:9|max:18',
};

const validator = Validator.make(kycData, kycRules);

if (await validator.passes()) {
  // KYC data is valid
  console.log('KYC verified!');
} else {
  // Show errors
  console.log(validator.errors());
}
```

### Payment Form

```javascript
const paymentData = {
  amount: 5000,
  upiId: 'user@paytm',
  gstin: '29ABCDE1234F1Z5',
};

const paymentRules = {
  amount: 'required|number|min:1',
  upiId: 'required|upi',
  gstin: 'optional|gstin',
};

try {
  const validated = await Validator.make(paymentData, paymentRules).validate();
  // Process payment
} catch (error) {
  // Handle validation errors
}
```

## API Reference

### ValidationFactory Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `make()` | `data`, `rules`, `messages`, `attributes` | Validator | Create validator |
| `extend()` | `name`, `callback`, `message` | this | Register custom rule |
| `setMessages()` | `messages` | this | Set global messages |

### Validator Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | Promise<object> | Validate and return data |
| `passes()` | Promise<boolean> | Check if passes |
| `fails()` | Promise<boolean> | Check if fails |
| `errors()` | object | Get validation errors |
| `validated()` | object | Get validated data |

### IndianValidators Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `phone()` | `value` | `{isValid, message}` | Validate phone |
| `pincode()` | `value` | `{isValid, message}` | Validate PIN code |
| `ifsc()` | `value` | `{isValid, message}` | Validate IFSC |
| `pan()` | `value` | `{isValid, message}` | Validate PAN |
| `aadhaar()` | `value` | `{isValid, message}` | Validate Aadhaar |
| `gstin()` | `value` | `{isValid, message}` | Validate GSTIN |
| `vehicleNumber()` | `value` | `{isValid, message}` | Validate vehicle |
| `upi()` | `value` | `{isValid, message}` | Validate UPI ID |
| `passport()` | `value` | `{isValid, message}` | Validate passport |
| `voterId()` | `value` | `{isValid, message}` | Validate voter ID |

## Examples

See `examples/indian-validators-example.js` for complete working examples.

## Notes

- All Indian validators handle formatting (removes spaces, dashes, etc.)
- PAN, IFSC, GSTIN are case-insensitive (converted to uppercase)
- Aadhaar includes Verhoeff checksum validation
- Phone numbers must start with 6, 7, 8, or 9
- All validators return `{isValid: boolean, message?: string}`
- Validators can be used standalone or integrated with ValidationFactory
