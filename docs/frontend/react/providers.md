# Providers

React Context providers for @vasuzex/react that manage global state and configuration.

## Available Providers

- [VasuzexProvider](#vasuzexprovider) - Root provider combining all features
- [ApiClientProvider](#apiclientprovider) - API client configuration
- [AppConfigProvider](#appconfigprovider) - Application configuration

## Installation

```bash
npm install @vasuzex/react
```

## VasuzexProvider

Root provider that combines `ApiClientProvider` and `AppConfigProvider`. Use this at the root of your application for maximum convenience.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiClient` | `ApiClient` | Yes* | API client instance |
| `config` | `Object` | No | Static config object |
| `configUrl` | `string` | No | URL to fetch config from |
| `children` | `ReactNode` | Yes | Application content |

*One of `apiClient` or `apiUrl` must be provided

### Basic Example

```jsx
import { VasuzexProvider } from '@vasuzex/react/providers';
import { ApiClient } from '@vasuzex/client';

const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function App() {
  return (
    <VasuzexProvider
      apiClient={apiClient}
      config={{
        app: { name: 'My App', version: '1.0.0' },
        features: { darkMode: true },
      }}
    >
      <YourApp />
    </VasuzexProvider>
  );
}
```

### With Remote Config

```jsx
<VasuzexProvider
  apiClient={apiClient}
  configUrl="/api/config"
>
  <YourApp />
</VasuzexProvider>
```

### Environment-Based Setup

```jsx
import { VasuzexProvider } from '@vasuzex/react/providers';
import { ApiClient } from '@vasuzex/client';

const isDev = import.meta.env.DEV;

const apiClient = new ApiClient({
  baseURL: isDev 
    ? 'http://localhost:3000/api'
    : 'https://api.example.com',
  timeout: 10000,
});

const config = {
  app: {
    name: 'My App',
    env: import.meta.env.MODE,
    debug: isDev,
  },
  api: {
    timeout: 10000,
    retries: 3,
  },
};

function App() {
  return (
    <VasuzexProvider apiClient={apiClient} config={config}>
      <YourApp />
    </VasuzexProvider>
  );
}
```

---

## ApiClientProvider

Provides API client instance to all child components via `useApiClient` hook.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `client` | `ApiClient` | Yes | API client instance from @vasuzex/client |
| `children` | `ReactNode` | Yes | Application content |

### Example

```jsx
import { ApiClientProvider } from '@vasuzex/react/providers';
import { ApiClient } from '@vasuzex/client';

const apiClient = new ApiClient({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
  },
  interceptors: {
    request: (config) => {
      // Add auth token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    response: (response) => {
      return response;
    },
    error: (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized
        window.location.href = '/login';
      }
      throw error;
    },
  },
});

function App() {
  return (
    <ApiClientProvider client={apiClient}>
      <YourApp />
    </ApiClientProvider>
  );
}
```

### Usage with Hook

```jsx
import { useApiClient } from '@vasuzex/react/hooks';

function UserList() {
  const apiClient = useApiClient();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.get('/users');
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiClient]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

## AppConfigProvider

Provides application configuration to all child components via `useAppConfig` hook. Supports both static config and remote config fetching.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Object` | No* | Static configuration object |
| `configUrl` | `string` | No* | URL to fetch config from |
| `children` | `ReactNode` | Yes | Application content |

*One of `config` or `configUrl` must be provided

### Static Config Example

```jsx
import { AppConfigProvider } from '@vasuzex/react/providers';

const config = {
  app: {
    name: 'My Application',
    version: '2.0.0',
    environment: 'production',
  },
  features: {
    darkMode: true,
    notifications: true,
    analytics: false,
  },
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 10000,
  },
  ui: {
    theme: 'light',
    language: 'en',
  },
};

function App() {
  return (
    <AppConfigProvider config={config}>
      <YourApp />
    </AppConfigProvider>
  );
}
```

### Remote Config Example

```jsx
// Fetches config from /api/config on mount
<AppConfigProvider configUrl="/api/config">
  <YourApp />
</AppConfigProvider>
```

Expected response format:
```json
{
  "app": {
    "name": "My App",
    "version": "1.0.0"
  },
  "features": {
    "darkMode": true
  }
}
```

### Usage with Hook

```jsx
import { useAppConfig } from '@vasuzex/react/hooks';

function SettingsPage() {
  const { config, get, loading } = useAppConfig();

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div>
      <h1>{get('app.name', 'Default App Name')}</h1>
      <p>Version: {get('app.version')}</p>
      <p>Environment: {get('app.environment', 'development')}</p>
      
      {get('features.darkMode') && (
        <button>Toggle Dark Mode</button>
      )}
      
      {get('features.notifications') && (
        <button>Enable Notifications</button>
      )}
    </div>
  );
}
```

### Nested Config Access

The `get()` function supports dot notation for nested values:

```jsx
const { get } = useAppConfig();

// Access nested values
const appName = get('app.name');
const apiTimeout = get('api.timeout', 5000);
const themeColor = get('ui.theme.primaryColor', '#007bff');

// Access arrays
const languages = get('i18n.supportedLanguages', ['en']);
const firstLanguage = get('i18n.supportedLanguages.0', 'en');
```

---

## Provider Composition

### Manual Composition

```jsx
import { ApiClientProvider, AppConfigProvider } from '@vasuzex/react/providers';

function App() {
  return (
    <ApiClientProvider client={apiClient}>
      <AppConfigProvider config={config}>
        <YourApp />
      </AppConfigProvider>
    </ApiClientProvider>
  );
}
```

### Using VasuzexProvider (Recommended)

```jsx
import { VasuzexProvider } from '@vasuzex/react/providers';

function App() {
  return (
    <VasuzexProvider apiClient={apiClient} config={config}>
      <YourApp />
    </VasuzexProvider>
  );
}
```

Both approaches are equivalent, but `VasuzexProvider` is more concise.

---

## Advanced Patterns

### Dynamic Config Loading

```jsx
import { useState, useEffect } from 'react';
import { AppConfigProvider } from '@vasuzex/react/providers';

function AppWithDynamicConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Load config based on user settings
    const loadConfig = async () => {
      const userPrefs = JSON.parse(localStorage.getItem('preferences'));
      const response = await fetch(`/api/config?theme=${userPrefs?.theme}`);
      const data = await response.json();
      setConfig(data);
    };

    loadConfig();
  }, []);

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <AppConfigProvider config={config}>
      <YourApp />
    </AppConfigProvider>
  );
}
```

### Config with Environment Variables

```jsx
const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME,
    version: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.MODE,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WS_URL,
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.DEV,
  },
};

<VasuzexProvider apiClient={apiClient} config={config}>
  <App />
</VasuzexProvider>
```

### Multiple API Clients

```jsx
import { createContext, useContext } from 'react';
import { ApiClient } from '@vasuzex/client';

const apiClient = new ApiClient({ baseURL: '/api' });
const authClient = new ApiClient({ baseURL: '/auth' });

const ApiContext = createContext({ api: apiClient, auth: authClient });

function MultiClientProvider({ children }) {
  return (
    <ApiContext.Provider value={{ api: apiClient, auth: authClient }}>
      {children}
    </ApiContext.Provider>
  );
}

function useApi() {
  return useContext(ApiContext);
}

// Usage
function MyComponent() {
  const { api, auth } = useApi();
  
  const login = async (credentials) => {
    const token = await auth.post('/login', credentials);
    // Store token...
  };
  
  const fetchData = async () => {
    const data = await api.get('/data');
    // Use data...
  };
}
```

---

## TypeScript

All providers are fully typed:

```typescript
import type {
  VasuzexProviderProps,
  ApiClientProviderProps,
  AppConfigProviderProps,
} from '@vasuzex/react/providers';

interface AppConfig {
  app: {
    name: string;
    version: string;
  };
  features: {
    darkMode: boolean;
  };
}

const config: AppConfig = {
  app: {
    name: 'My App',
    version: '1.0.0',
  },
  features: {
    darkMode: true,
  },
};

<VasuzexProvider<AppConfig>
  apiClient={apiClient}
  config={config}
>
  <App />
</VasuzexProvider>
```

---

## Best Practices

1. **Use VasuzexProvider** - Unless you need fine-grained control, use `VasuzexProvider` at the root
2. **Config Structure** - Organize config into logical sections (app, features, api, ui)
3. **Environment Variables** - Use environment variables for sensitive/environment-specific values
4. **Default Values** - Always provide defaults when using `get()` for optional config
5. **Loading States** - Handle loading states when using remote config
6. **Error Handling** - Wrap config fetching in try/catch blocks
7. **Type Safety** - Use TypeScript interfaces for your config structure

---

## Error Handling

```jsx
import { VasuzexProvider } from '@vasuzex/react/providers';

function App() {
  const [error, setError] = useState(null);

  const apiClient = new ApiClient({
    baseURL: '/api',
    interceptors: {
      error: (err) => {
        setError(err.message);
        throw err;
      },
    },
  });

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <VasuzexProvider apiClient={apiClient}>
      <YourApp />
    </VasuzexProvider>
  );
}
```

---

## See Also

- [Hooks Documentation](../hooks)
- [Components Documentation](../components)
- [API Client (@vasuzex/client)](../../client)
