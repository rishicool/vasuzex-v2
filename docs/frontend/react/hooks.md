# React Hooks

A collection of custom React hooks for common patterns in @vasuzex/react.

## Available Hooks

### Core Hooks
- [useApiClient](#useapiclient) - Access the API client instance
- [useAppConfig](#useappconfig) - Access application configuration
- [useValidationErrors](#usevalidationerrors) - Manage form validation errors
- [useLocalStorage](#uselocalstorage) - Persist state in localStorage
- [useDebounce](#usedebounce) - Debounce values and callbacks

### Accessibility Hooks
- [useFocusTrap](#usefocustrap) - Trap focus within containers
- [useAnnouncer](#useannouncer) - Announce messages to screen readers
- [useKeyboardNavigation](#usekeyboardnavigation) - Handle keyboard navigation

## Installation

```bash
npm install @vasuzex/react
```

## Core Hooks

### useApiClient

Access the configured API client instance from @vasuzex/client.

```typescript
function useApiClient(): ApiClient
```

**Example:**
```jsx
import { useApiClient } from '@vasuzex/react/hooks';

function UserList() {
  const apiClient = useApiClient();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await apiClient.get('/api/users');
      setUsers(data);
    };
    fetchUsers();
  }, [apiClient]);

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Requirements:** Must be used within `ApiClientProvider`.

---

### useAppConfig

Access application configuration values.

```typescript
function useAppConfig(): {
  config: Object;
  get: (key: string, defaultValue?: any) => any;
  loading: boolean;
}
```

**Example:**
```jsx
import { useAppConfig } from '@vasuzex/react/hooks';

function AppSettings() {
  const { config, get, loading } = useAppConfig();

  if (loading) return <div>Loading config...</div>;

  return (
    <div>
      <p>App Name: {get('app.name', 'My App')}</p>
      <p>API URL: {get('api.url')}</p>
      <p>Debug: {get('app.debug') ? 'On' : 'Off'}</p>
    </div>
  );
}
```

**Requirements:** Must be used within `AppConfigProvider`.

---

### useValidationErrors

Manage form validation errors with built-in helpers.

```typescript
interface UseValidationErrors {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setError: (field: string, message: string) => void;
  clearErrors: () => void;
  clearError: (field: string) => void;
  getError: (field: string) => string | undefined;
  hasError: (field: string) => boolean;
  hasErrors: () => boolean;
  handleError: (error: Error) => void;
}

function useValidationErrors(): UseValidationErrors
```

**Example:**
```jsx
import { useValidationErrors } from '@vasuzex/react/hooks';

function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { errors, setError, clearError, hasErrors, handleError } = useValidationErrors();

  const validate = () => {
    if (!email.includes('@')) {
      setError('email', 'Invalid email address');
      return false;
    }
    if (password.length < 8) {
      setError('password', 'Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await apiClient.post('/api/register', { email, password });
    } catch (error) {
      handleError(error); // Automatically extracts validation errors
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          clearError('email');
        }}
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <span className="error">{errors.password}</span>}

      <button type="submit" disabled={hasErrors()}>Register</button>
    </form>
  );
}
```

---

### useLocalStorage

Persist state in browser localStorage with automatic serialization.

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void]
```

**Example:**
```jsx
import { useLocalStorage } from '@vasuzex/react/hooks';

function ThemeSelector() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={removeTheme}>Reset</button>
    </div>
  );
}
```

**Features:**
- Automatic JSON serialization/deserialization
- Handles storage events (syncs across tabs)
- Safe error handling
- Returns remove function to clear value

---

### useDebounce

Debounce values or callbacks to reduce updates.

```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Example:**
```jsx
import { useDebounce } from '@vasuzex/react/hooks';

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedTerm) {
      // API call only happens 500ms after user stops typing
      searchAPI(debouncedTerm);
    }
  }, [debouncedTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Use Cases:**
- Search input optimization
- Resize event handlers
- Scroll event handlers
- Auto-save functionality

---

## Accessibility Hooks

### useFocusTrap

Trap keyboard focus within a container (for modals, dialogs, dropdowns).

```typescript
function useFocusTrap(isActive?: boolean): RefObject<HTMLElement>
```

**Example:**
```jsx
import { useFocusTrap } from '@vasuzex/react/hooks';

function Modal({ isOpen, onClose, children }) {
  const trapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={trapRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}
```

**Features:**
- Traps Tab/Shift+Tab navigation
- Restores focus on unmount
- Works with dynamic content
- Handles disabled/hidden elements

---

### useAnnouncer

Announce messages to screen readers using ARIA live regions.

```typescript
interface UseAnnouncer {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

function useAnnouncer(): UseAnnouncer
```

**Example:**
```jsx
import { useAnnouncer } from '@vasuzex/react/hooks';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const { announce } = useAnnouncer();

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text }]);
    announce(`Added: ${text}`, 'polite');
  };

  const removeTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    setTodos(todos.filter(t => t.id !== id));
    announce(`Removed: ${todo.text}`, 'polite');
  };

  return (
    <div>
      <button onClick={() => addTodo('New task')}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Priority Levels:**
- `polite` (default) - Announces when screen reader is idle
- `assertive` - Interrupts current announcement

---

### useKeyboardNavigation

Handle keyboard navigation in lists, menus, and grids.

```typescript
interface UseKeyboardNavigation {
  activeIndex: number;
  handleKeyDown: (event: KeyboardEvent) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  navigateToFirst: () => void;
  navigateToLast: () => void;
  selectCurrent: () => void;
  reset: () => void;
}

function useKeyboardNavigation(
  itemCount: number,
  onSelect?: (index: number) => void,
  options?: { loop?: boolean }
): UseKeyboardNavigation
```

**Example:**
```jsx
import { useKeyboardNavigation } from '@vasuzex/react/hooks';

function NavigableList({ items, onSelect }) {
  const {
    activeIndex,
    handleKeyDown,
  } = useKeyboardNavigation(items.length, onSelect, { loop: true });

  return (
    <ul
      role="listbox"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === activeIndex}
          className={index === activeIndex ? 'active' : ''}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

**Keyboard Shortcuts:**
- `Arrow Down` - Next item
- `Arrow Up` - Previous item
- `Home` - First item
- `End` - Last item
- `Enter/Space` - Select current item

**Options:**
- `loop` (default: false) - Loop from last to first

---

## Hook Composition

Hooks can be composed together for powerful patterns:

### Form with Validation + Local Storage

```jsx
function PersistentForm() {
  const [formData, setFormData] = useLocalStorage('form-draft', {
    name: '',
    email: '',
  });
  const { errors, setError, clearErrors, hasErrors } = useValidationErrors();
  const apiClient = useApiClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    // Validate
    if (!formData.email.includes('@')) {
      setError('email', 'Invalid email');
      return;
    }

    // Submit
    try {
      await apiClient.post('/api/submit', formData);
      setFormData({ name: '', email: '' }); // Clear draft
    } catch (error) {
      handleError(error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Accessible Search with Debounce

```jsx
function AccessibleSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  const { announce } = useAnnouncer();
  const {
    activeIndex,
    handleKeyDown,
  } = useKeyboardNavigation(results.length, (index) => {
    selectResult(results[index]);
  });

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchAPI(debouncedQuery).then((data) => {
        setResults(data);
        announce(`${data.length} results found`);
      });
    }
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul role="listbox" onKeyDown={handleKeyDown}>
        {results.map((result, i) => (
          <li
            key={result.id}
            role="option"
            aria-selected={i === activeIndex}
          >
            {result.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## TypeScript Support

All hooks are fully typed:

```typescript
import type {
  UseValidationErrors,
  UseLocalStorage,
  UseDebounce,
  UseFocusTrap,
  UseAnnouncer,
  UseKeyboardNavigation,
} from '@vasuzex/react/hooks';
```

## Best Practices

1. **Hook Dependencies** - Always include hook values in dependency arrays
2. **Error Handling** - Wrap API calls in try/catch with validation error handling
3. **Accessibility** - Use `useAnnouncer` for dynamic content changes
4. **Performance** - Use `useDebounce` for expensive operations
5. **Persistence** - Use `useLocalStorage` for user preferences

## See Also

- [Components Documentation](../components)
- [Providers Documentation](../providers)
- [Accessibility Guide](../ACCESSIBILITY.md)
