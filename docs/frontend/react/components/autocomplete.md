# Autocomplete Component

An accessible autocomplete/typeahead component with async search support, keyboard navigation, and customizable rendering.

## Features

- ✅ Static or async options
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ Debounced search
- ✅ Custom option rendering
- ✅ Loading states
- ✅ Clearable selection
- ✅ Fully accessible (WCAG 2.1 AA)
- ✅ Screen reader support

## Installation

```bash
npm install @vasuzex/react
```

## Basic Usage

### Static Options

```jsx
import { Autocomplete } from '@vasuzex/react/components/Autocomplete';

const options = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

function MyComponent() {
  const [selected, setSelected] = useState('');

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Select a fruit..."
    />
  );
}
```

### Async Options

```jsx
const fetchOptions = async (query) => {
  const res = await fetch(`/api/search?q=${query}`);
  return res.json();
};

<Autocomplete
  fetchOptions={fetchOptions}
  value={selected}
  onChange={setSelected}
  placeholder="Search..."
  minChars={2}
  debounceMs={300}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array` | `[]` | Static options array |
| `fetchOptions` | `Function` | - | Async function to fetch options |
| `value` | `string\|Object` | `''` | Selected value |
| `onChange` | `Function` | - | Selection callback |
| `placeholder` | `string` | `'Search...'` | Input placeholder |
| `renderOption` | `Function` | - | Custom option renderer |
| `getOptionLabel` | `Function` | - | Get option label |
| `getOptionValue` | `Function` | - | Get option value |
| `debounceMs` | `number` | `300` | Debounce delay (ms) |
| `minChars` | `number` | `2` | Min chars to search |
| `loading` | `boolean` | `false` | External loading state |
| `disabled` | `boolean` | `false` | Disable input |
| `clearable` | `boolean` | `false` | Show clear button |
| `name` | `string` | - | Input name |
| `id` | `string` | - | Input ID |
| `className` | `string` | `''` | CSS class |

## Examples

### Object Options

```jsx
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

<Autocomplete
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getOptionLabel={(user) => user.name}
  getOptionValue={(user) => user.id}
  placeholder="Select a user..."
/>
```

### Custom Rendering

```jsx
<Autocomplete
  options={users}
  value={selected}
  onChange={setSelected}
  renderOption={(user) => (
    <div className="user-option">
      <img src={user.avatar} alt="" />
      <div>
        <div className="name">{user.name}</div>
        <div className="email">{user.email}</div>
      </div>
    </div>
  )}
  getOptionLabel={(user) => user.name}
/>
```

### With Loading State

```jsx
function SearchComponent() {
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (query) => {
    setLoading(true);
    const res = await fetch(`/api/users?q=${query}`);
    const data = await res.json();
    setLoading(false);
    return data;
  };

  return (
    <Autocomplete
      fetchOptions={fetchUsers}
      loading={loading}
      value={selected}
      onChange={setSelected}
      placeholder="Search users..."
    />
  );
}
```

### Clearable Selection

```jsx
<Autocomplete
  options={options}
  value={selected}
  onChange={setSelected}
  clearable
  placeholder="Type to search..."
/>
```

### Controlled Component

```jsx
function ControlledAutocomplete() {
  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      options={options}
      value={value}
      inputValue={inputValue}
      onChange={(newValue) => {
        setValue(newValue);
        console.log('Selected:', newValue);
      }}
      onInputChange={(newInput) => {
        setInputValue(newInput);
      }}
    />
  );
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Arrow Down` | Highlight next option |
| `Arrow Up` | Highlight previous option |
| `Enter` | Select highlighted option |
| `Escape` | Close dropdown |
| `Home` | Jump to first option |
| `End` | Jump to last option |
| `Tab` | Move focus (close dropdown) |

## Event Handlers

| Event | Parameters | Description |
|-------|-----------|-------------|
| `onChange` | `(value: any)` | Selection changed |
| `onInputChange` | `(input: string)` | Input text changed |
| `onFocus` | `(event: Event)` | Input focused |
| `onBlur` | `(event: Event)` | Input blurred |
| `onClear` | `()` | Clear button clicked |

## Async Search

The `fetchOptions` function receives the search query and should return a Promise:

```jsx
const fetchOptions = async (query) => {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

<Autocomplete
  fetchOptions={fetchOptions}
  value={selected}
  onChange={setSelected}
  debounceMs={500}
  minChars={3}
/>
```

## Accessibility

- `role="combobox"` with `aria-expanded`
- `role="listbox"` for dropdown
- `role="option"` for each option
- `aria-activedescendant` for highlighted option
- `aria-autocomplete="list"`
- Screen reader announcements for results
- Full keyboard navigation

## Styling

### CSS Classes

```css
.vasuzex-autocomplete { }
.vasuzex-autocomplete-input { }
.vasuzex-autocomplete-dropdown { }
.vasuzex-autocomplete-option { }
.vasuzex-autocomplete-option.highlighted { }
.vasuzex-autocomplete-option.selected { }
.vasuzex-autocomplete-loading { }
.vasuzex-autocomplete-empty { }
.vasuzex-autocomplete-clear-button { }
```

### Custom Styles

```jsx
<Autocomplete
  className="custom-autocomplete"
  style={{
    '--input-border': '#ccc',
    '--dropdown-shadow': '0 2px 8px rgba(0,0,0,0.1)',
    '--option-hover': '#f0f0f0',
  }}
  options={options}
/>
```

## Performance

### Debouncing

Adjust `debounceMs` to reduce API calls:

```jsx
<Autocomplete
  fetchOptions={search}
  debounceMs={500} // Wait 500ms after typing
  minChars={3}     // Require 3 chars minimum
/>
```

### Memoization

Use React.memo for custom renderers:

```jsx
const OptionRenderer = memo(({ option }) => (
  <div className="option">
    <strong>{option.name}</strong>
    <small>{option.description}</small>
  </div>
));

<Autocomplete
  options={options}
  renderOption={(option) => <OptionRenderer option={option} />}
/>
```

## TypeScript

```typescript
import { Autocomplete } from '@vasuzex/react/components/Autocomplete';

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [...];

<Autocomplete<User>
  options={users}
  value={selectedUser}
  onChange={(user: User | null) => setSelectedUser(user)}
  getOptionLabel={(user) => user.name}
  getOptionValue={(user) => user.id}
/>
```

## Advanced Examples

### Multi-select (Coming Soon)

```jsx
// Future feature
<Autocomplete
  multiple
  options={options}
  value={selected}
  onChange={setSelected}
  maxSelections={5}
/>
```

### Grouped Options

```jsx
const groupedOptions = [
  { group: 'Fruits', items: ['Apple', 'Banana'] },
  { group: 'Vegetables', items: ['Carrot', 'Broccoli'] },
];

<Autocomplete
  options={groupedOptions}
  renderOption={(option) => (
    <div>
      {option.group && <div className="group-header">{option.group}</div>}
      {option.items?.map(item => <div key={item}>{item}</div>)}
    </div>
  )}
/>
```

## See Also

- [FormField Component](../Forms)
- [useDebounce Hook](../../hooks/useDebounce)
- [useKeyboardNavigation Hook](../../hooks/useKeyboardNavigation)
