# Form Components

A suite of accessible, validated form components for building robust forms with ease.

## Components

- **FormField** - Complete form field with label, error, and help text
- **FormError** - Error message display with icon
- **FormGroup** - Wrapper for multiple related fields
- **FormSubmitButton** - Submit button with loading state

## Features

- ✅ Automatic validation error handling
- ✅ Label and help text support
- ✅ Error message display
- ✅ Required field indicators
- ✅ Loading states
- ✅ Fully accessible (WCAG 2.1 AA)
- ✅ Integration with useValidationErrors hook

## Installation

```bash
npm install @vasuzex/react
```

## FormField

Complete form field with label, input, error, and help text.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | **required** | Field name |
| `label` | `string` | - | Field label |
| `type` | `string` | `'text'` | Input type |
| `value` | `string` | `''` | Field value |
| `onChange` | `Function` | - | Change handler |
| `error` | `string` | - | Error message |
| `helpText` | `string` | - | Help text |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `placeholder` | `string` | - | Placeholder |
| `className` | `string` | `''` | CSS class |

### Basic Example

```jsx
import { FormField } from '@vasuzex/react/components/Forms';

function MyForm() {
  const [email, setEmail] = useState('');

  return (
    <FormField
      name="email"
      label="Email Address"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
      helpText="We'll never share your email"
    />
  );
}
```

### With Validation

```jsx
import { FormField } from '@vasuzex/react/components/Forms';
import { useValidationErrors } from '@vasuzex/react/hooks';

function ValidatedForm() {
  const [email, setEmail] = useState('');
  const { errors, setError, clearError } = useValidationErrors();

  const handleBlur = () => {
    if (!email.includes('@')) {
      setError('email', 'Please enter a valid email');
    } else {
      clearError('email');
    }
  };

  return (
    <FormField
      name="email"
      label="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onBlur={handleBlur}
      error={errors.email}
      required
    />
  );
}
```

### Different Input Types

```jsx
{/* Text input */}
<FormField
  name="username"
  label="Username"
  type="text"
  value={username}
  onChange={handleChange}
/>

{/* Password */}
<FormField
  name="password"
  label="Password"
  type="password"
  value={password}
  onChange={handleChange}
  required
/>

{/* Textarea */}
<FormField
  name="bio"
  label="Bio"
  type="textarea"
  value={bio}
  onChange={handleChange}
  rows={4}
/>

{/* Select */}
<FormField
  name="country"
  label="Country"
  type="select"
  value={country}
  onChange={handleChange}
>
  <option value="">Select...</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
</FormField>

{/* Number */}
<FormField
  name="age"
  label="Age"
  type="number"
  value={age}
  onChange={handleChange}
  min={0}
  max={120}
/>

{/* Date */}
<FormField
  name="birthday"
  label="Birthday"
  type="date"
  value={birthday}
  onChange={handleChange}
/>
```

## FormError

Standalone error message component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | Error message |
| `visible` | `boolean` | `true` | Show/hide error |
| `className` | `string` | `''` | CSS class |

### Example

```jsx
import { FormError } from '@vasuzex/react/components/Forms';

<FormError message="This field is required" />
<FormError message={errors.email} visible={!!errors.email} />
```

## FormGroup

Group related form fields together.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | - | Group legend |
| `children` | `ReactNode` | - | Form fields |
| `className` | `string` | `''` | CSS class |

### Example

```jsx
import { FormGroup, FormField } from '@vasuzex/react/components/Forms';

<FormGroup legend="Personal Information">
  <FormField
    name="firstName"
    label="First Name"
    value={firstName}
    onChange={handleChange}
  />
  <FormField
    name="lastName"
    label="Last Name"
    value={lastName}
    onChange={handleChange}
  />
</FormGroup>

<FormGroup legend="Contact Information">
  <FormField
    name="email"
    label="Email"
    type="email"
    value={email}
    onChange={handleChange}
  />
  <FormField
    name="phone"
    label="Phone"
    type="tel"
    value={phone}
    onChange={handleChange}
  />
</FormGroup>
```

## FormSubmitButton

Submit button with loading state and disabled handling.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Loading state |
| `disabled` | `boolean` | `false` | Disabled state |
| `children` | `ReactNode` | `'Submit'` | Button text |
| `loadingText` | `string` | `'Submitting...'` | Loading text |
| `className` | `string` | `''` | CSS class |

### Example

```jsx
import { FormSubmitButton } from '@vasuzex/react/components/Forms';

function MyForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <FormSubmitButton loading={loading}>
        Create Account
      </FormSubmitButton>
    </form>
  );
}
```

## Complete Form Example

```jsx
import {
  FormField,
  FormGroup,
  FormSubmitButton,
} from '@vasuzex/react/components/Forms';
import { useValidationErrors } from '@vasuzex/react/hooks';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const { errors, setErrors, clearErrors, hasErrors } = useValidationErrors();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      alert('Registration successful!');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup legend="Personal Information">
        <FormField
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />
        <FormField
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
        />
      </FormGroup>

      <FormGroup legend="Account Details">
        <FormField
          name="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <FormField
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          helpText="At least 8 characters"
          required
        />
        <FormField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />
      </FormGroup>

      <FormGroup legend="Location">
        <FormField
          name="country"
          label="Country"
          type="select"
          value={formData.country}
          onChange={handleChange}
        >
          <option value="">Select...</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
        </FormField>
      </FormGroup>

      <div>
        <label>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
          />
          I accept the terms and conditions
        </label>
        {errors.terms && <FormError message={errors.terms} />}
      </div>

      {errors.submit && <FormError message={errors.submit} />}

      <FormSubmitButton loading={loading} disabled={hasErrors()}>
        Create Account
      </FormSubmitButton>
    </form>
  );
}
```

## Accessibility

All form components are fully accessible:

- Proper `label` association with inputs
- `aria-required` for required fields
- `aria-invalid` and `aria-describedby` for errors
- `aria-describedby` for help text
- Semantic HTML (`fieldset`, `legend`)
- Focus management
- Keyboard navigation

## Styling

### CSS Classes

```css
/* FormField */
.vasuzex-form-field { }
.vasuzex-form-label { }
.vasuzex-form-label.required::after { content: "*"; }
.vasuzex-form-input { }
.vasuzex-form-input:focus { }
.vasuzex-form-input[aria-invalid="true"] { }
.vasuzex-form-help { }

/* FormError */
.vasuzex-form-error { }
.vasuzex-form-error-icon { }

/* FormGroup */
.vasuzex-form-group { }
.vasuzex-form-legend { }

/* FormSubmitButton */
.vasuzex-form-submit { }
.vasuzex-form-submit:disabled { }
.vasuzex-form-submit-loading { }
```

## Validation Patterns

### Client-side Validation

```jsx
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password);
};
```

### Server-side Validation

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    if (!res.ok) {
      const data = await res.json();
      // Server returns { errors: { email: 'Email already exists' } }
      setErrors(data.errors);
      return;
    }
    
    // Success
  } catch (error) {
    setErrors({ submit: 'Network error' });
  }
};
```

## TypeScript

```typescript
import {
  FormField,
  FormGroup,
  FormSubmitButton,
  FormFieldProps,
} from '@vasuzex/react/components/Forms';

interface FormData {
  email: string;
  password: string;
}

const MyForm: React.FC = () => {
  const [data, setData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <form>
      <FormField
        name="email"
        label="Email"
        type="email"
        value={data.email}
        onChange={handleChange}
      />
    </form>
  );
};
```

## See Also

- [useValidationErrors Hook](../../hooks/useValidationErrors)
- [Autocomplete Component](../Autocomplete)
- [DataTable Component](../DataTable)
