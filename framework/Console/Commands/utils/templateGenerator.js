/**
 * Template Generator Utilities
 * Generate code templates for different file types
 */

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate BaseApp class template
 */
export function generateAppTemplate(appName) {
  const className = capitalize(appName) + 'App';
  
  return `/**
 * ${capitalize(appName)} API Application
 * Extends BaseApp from framework for clean architecture
 */

import { BaseApp } from 'vasuzex';
import { env } from './helpers/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getAllRoutes } from './routes/index.js';

/**
 * ${className} - Extends BaseApp
 * Organized and maintainable Express app configuration
 */
class ${className} extends BaseApp {
  constructor() {
    super({
      serviceName: process.env.APP_NAME || '${appName}-api',
      corsOrigin: env('CORS_ORIGIN', 'http://localhost:3001')
    });
  }

  /**
   * Override security middleware setup to bypass config service
   */
  setupSecurityMiddleware() {
    // Skip security middleware for pilot test
    // In production, load actual security config
  }

  /**
   * Setup custom middleware (after body parsers, before routes)
   */
  setupCustomMiddleware() {
    // Add your custom middleware here
    // Example: app.use(requestLogger());
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    const routes = getAllRoutes();
    routes.forEach(({ path, router, handler }) => {
      if (handler) {
        this.express.get(path, handler);
      } else if (router) {
        this.registerRoute(path, router);
      }
    });
  }

  /**
   * Get error handlers
   */
  getErrorHandlers() {
    return { errorHandler, notFoundHandler };
  }
}

/**
 * Create and configure the Express app
 */
export function createApp() {
  const app = new ${className}();
  return app.build();
}
`;
}

/**
 * Generate BaseServer class template
 */
export function generateServerTemplate(appName) {
  const className = capitalize(appName) + 'Server';
  
  return `/**
 * ${capitalize(appName)} Server
 * Extends BaseServer from framework with database support
 */

import { BaseServer, Facade } from 'vasuzex';
import guruorm from 'guruorm';
const { Capsule } = guruorm;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ${className} - Extends BaseServer
 */
class ${className} extends BaseServer {
  constructor() {
    // Get project root (2 levels up from apps/{name}/{type})
    const projectRoot = path.resolve(process.cwd(), '../..');
    
    super({
      appName: process.env.APP_NAME || '${appName}-api',
      projectRoot: projectRoot
    });
    
    this.db = null;
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    // Add your custom config validations here
    super.validateConfig();
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    try {
      // Use root config (centralized)
      const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/${appName}_db';
      
      // Create capsule instance (GuruORM)
      const capsule = new Capsule();
      
      // Add PostgreSQL connection
      capsule.addConnection({
        driver: 'pgsql',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        database: process.env.POSTGRES_DB || '${appName}_db',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        charset: 'utf8',
        prefix: '',
        schema: 'public',
      });
      
      // Make capsule globally available
      capsule.setAsGlobal();
      capsule.bootEloquent();
      
      // Get DB connection for Facade
      this.db = capsule.connection();
      
      // Register DB in a simple container object for Facade
      const container = {
        make: (name) => {
          if (name === 'db') return this.db;
          throw new Error(\`Service \${name} not found\`);
        },
        has: (name) => name === 'db'
      };
      
      // Set facade application
      Facade.setFacadeApplication(container);
      
      console.log('[${capitalize(appName)}API] 🗄️  Database connected');
    } catch (error) {
      console.error('[${capitalize(appName)}API] ❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Initialize ${appName}-specific services
   */
  async initializeServices() {
    // Initialize database first
    await this.initializeDatabase();
    
    // Initialize your other services here
    // Example: await initializeStorageService();
    console.log('[${capitalize(appName)}API] 📦 Services initialized');
  }

  /**
   * Create Express app
   */
  async createApp() {
    const { createApp } = await import('./app.js');
    return createApp();
  }
}

// Start the server
const server = new ${className}();
server.start();
`;
}

/**
 * Generate .env template
 */
export function generateEnvTemplate(appName, appType) {
  const port = appType === 'api' ? '3000' : '3001';
  
  return `# ${appName.toUpperCase()} ${appType.toUpperCase()} Application
APP_NAME=${appName}-${appType}
APP_PORT=${port}
APP_ENV=development

# ⚠️  IMPORTANT: Change APP_PORT if running multiple apps
# Each app needs a unique port number
# Example: 3000, 3001, 3002, etc.
`;
}

/**
 * Generate .gitignore template
 */
export function generateGitignoreTemplate() {
  return `node_modules
.env
dist
.turbo
*.log
`;
}

/**
 * Generate README template
 */
export function generateReadmeTemplate(appName, appType) {
  return `# ${capitalize(appName)} ${appType.toUpperCase()}

${capitalize(appName)} application with authentication and framework integration.

## Structure

\`\`\`
apps/${appName}/${appType}/
├── src/
│   ├── controllers/        # Controllers (extend BaseController)
│   │   ├── BaseController.js
│   │   └── AuthController.js
│   ├── models/            # Data models
│   │   └── User.js
│   ├── services/          # Business logic
│   │   └── AuthService.js
│   ├── middleware/        # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/            # API routes
│   │   └── auth.routes.js
│   ├── requests/          # Request validators
│   │   └── AuthRequests.js
│   ├── app.js             # Express app setup
│   └── index.js           # Framework bootstrap
├── package.json
├── .env
└── README.md
\`\`\`

## Centralized Config & Database

This app uses:
- **Config**: \`/config/\` from project root (NO app-level config)
- **Database**: \`/database/\` from project root (centralized models & migrations)

## Installation

Dependencies are installed from project root:

\`\`\`bash
cd /path/to/project-root
pnpm install
\`\`\`

## Development

From project root:

\`\`\`bash
pnpm dev:${appName}-${appType}
\`\`\`

Or from app directory:

\`\`\`bash
cd apps/${appName}/${appType}
pnpm dev
\`\`\`

## API Endpoints

### Health Check
\`\`\`
GET /health
\`\`\`

### Authentication
\`\`\`
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user (protected)
POST /api/auth/logout    - Logout (protected)
\`\`\`

## Authentication Flow

1. **Register:**
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@example.com","password":"123456"}'
\`\`\`

2. **Login:**
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"123456"}'
\`\`\`

3. **Access Protected Route:**
\`\`\`bash
curl -X GET http://localhost:3000/api/auth/me \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

## Environment Variables

\`\`\`env
APP_NAME=${appName}-${appType}
APP_PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
\`\`\`
`;
}

/**
 * Generate web app placeholder HTML
 */
export function generateWebIndexHTML(appName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${capitalize(appName)} Web</title>
</head>
<body>
  <h1>${capitalize(appName)} Web Application</h1>
  <p>Frontend placeholder - integrate your React/Vue/Svelte app here</p>
</body>
</html>
`;
}

/**
 * Generate web README
 */
export function generateWebReadme(appName, framework = 'plain') {
  if (framework === 'react') {
    return `# ${capitalize(appName)} Web (React)

React application with Redux Toolkit and authentication scaffolded with Vasuzex.

## Features

✅ Redux Toolkit for state management
✅ Redux Persist for auth persistence
✅ React Router for navigation
✅ Protected routes
✅ JWT-based authentication
✅ Login, Register, Dashboard pages
✅ API integration with @vasuzex/client

## Quick Start

1. Configure environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Update \`.env\` with your API URL:
   \`\`\`
   VITE_API_URL=http://localhost:3000/api
   \`\`\`

3. Start development server:
   \`\`\`bash
   pnpm dev:${appName}-web
   \`\`\`

4. Open [http://localhost:3001](http://localhost:3001)

## Project Structure

\`\`\`
src/
├── store/
│   ├── index.js         # Redux store configuration
│   └── authSlice.js     # Auth state management
├── pages/
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   └── Dashboard.jsx    # Protected dashboard
├── components/
│   └── ProtectedRoute.jsx  # Route guard
├── App.jsx              # Main app component
└── index.jsx            # Entry point
\`\`\`

## Authentication Flow

1. User registers/logs in via \`/login\` or \`/register\`
2. API returns JWT token
3. Redux stores token and user data
4. Redux Persist saves to localStorage
5. Protected routes check \`isAuthenticated\` state
6. Token sent with API requests via @vasuzex/client

## Available Scripts

- \`pnpm dev:${appName}-web\` - Start dev server
- \`pnpm build\` - Build for production
- \`pnpm preview\` - Preview production build

## Dependencies

- React 18
- Redux Toolkit - State management
- Redux Persist - Persist Redux state
- React Router - Routing
- @vasuzex/client - API integration
- Vite - Dev server & bundler
`;
  }
  
  if (framework === 'vue') {
    return `# ${capitalize(appName)} Web (Vue)

Vue 3 application scaffolded with Vasuzex.

## Development

\`\`\`bash
pnpm dev:${appName}-web
\`\`\`

## Build

\`\`\`bash
pnpm build
\`\`\`

## Dependencies

- Vue 3
- Vite (dev server & bundler)
`;
  }
  
  if (framework === 'svelte') {
    return `# ${capitalize(appName)} Web (Svelte)

Svelte application scaffolded with Vasuzex.

## Development

\`\`\`bash
pnpm dev:${appName}-web
\`\`\`

## Build

\`\`\`bash
pnpm build
\`\`\`

## Dependencies

- Svelte
- Vite (dev server & bundler)
`;
  }
  
  return `# ${appName} Web

Frontend placeholder. You can integrate:
- React
- Vue  
- Svelte
- Next.js
- Or any other frontend framework

\`\`\`bash
# Install your frontend framework
pnpm add react react-dom
# or
pnpm add vue
\`\`\`
`;
}

/**
 * Generate React templates
 */
export function generateReactTemplate(appName) {
  return {
    indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${capitalize(appName)} - React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.jsx"></script>
</body>
</html>`,
    
    indexJs: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);`,
    
    appJs: `import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;`,
    
    indexCss: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.auth-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.alert-error {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
  margin-bottom: 1rem;
}

button {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.text-center {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.link {
  color: #3b82f6;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}`
  };
}

// Generate Redux store files
export function generateReduxStoreFiles(appName) {
  return {
    storeIndex: `import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';

const persistConfig = {
  key: 'auth',
  version: 1,
  storage,
  whitelist: ['user', 'token', 'isAuthenticated']
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);`,

    authSlice: `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createApiClient } from '@vasuzex/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = createApiClient({
  baseURL: API_URL,
  tokenKey: 'auth_token',
  userKey: 'auth_user',
  onUnauthorized: () => {
    window.location.href = '/login';
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      // Backend returns: { success: true, data: { user, token }, message }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      // Backend returns: { success: true, data: { user, token }, message }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.token) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;`
  };
}

// Generate React auth pages
export function generateReactAuthPages(appName) {
  return {
    login: `import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    dispatch(clearError());
    await dispatch(login(formData));
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {formErrors.email && <div className="error-message">{formErrors.email}</div>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {formErrors.password && <div className="error-message">{formErrors.password}</div>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center">
        Don't have an account? <Link to="/register" className="link">Register here</Link>
      </p>
    </div>
  );
}`,

    register: `import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    dispatch(clearError());
    const { name, email, password } = formData;
    await dispatch(register({ name, email, password }));
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          {formErrors.name && <div className="error-message">{formErrors.name}</div>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          {formErrors.email && <div className="error-message">{formErrors.email}</div>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
          />
          {formErrors.password && <div className="error-message">{formErrors.password}</div>}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
          {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center">
        Already have an account? <Link to="/login" className="link">Sign in here</Link>
      </p>
    </div>
  );
}`,

    dashboard: `import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
          Logout
        </button>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          <strong>Email:</strong> {user?.email}
        </p>
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          <strong>Account created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>

      <div style={{ marginTop: '2rem', background: '#e7f3ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
        <h3 style={{ marginTop: 0, color: '#004085' }}>🎉 Success!</h3>
        <p style={{ margin: 0, color: '#004085' }}>
          You are authenticated and can access protected content.
        </p>
      </div>
    </div>
  );
}`,

    protectedRoute: `import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}`
  };
}

/**
 * Generate Vue templates
 */
export function generateVueTemplate(appName) {
  return {
    indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${capitalize(appName)} - Vue App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`,
    
    mainJs: `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');`,
    
    appVue: `<template>
  <div class="app">
    <header>
      <h1>${capitalize(appName)} - Vue App</h1>
      <p>Scaffolded with Vasuzex Framework</p>
    </header>
    
    <main>
      <div class="card">
        <button @click="count++">
          Count: {{ count }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.card {
  background: #1e293b;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #2563eb;
}
</style>`
  };
}

/**
 * Generate Svelte templates
 */
export function generateSvelteTemplate(appName) {
  return {
    indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${capitalize(appName)} - Svelte App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`,
    
    mainJs: `import App from './App.svelte';

const app = new App({
  target: document.getElementById('app')
});

export default app;`,
    
    appSvelte: `<script>
  let count = 0;
</script>

<div class="app">
  <header>
    <h1>${capitalize(appName)} - Svelte App</h1>
    <p>Scaffolded with Vasuzex Framework</p>
  </header>
  
  <main>
    <div class="card">
      <button on:click={() => count++}>
        Count: {count}
      </button>
    </div>
  </main>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
  }

  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .card {
    background: #1e293b;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }

  button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #2563eb;
  }
</style>`
  };
}
