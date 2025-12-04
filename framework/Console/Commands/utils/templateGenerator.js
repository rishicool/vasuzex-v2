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
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getAllRoutes } from './routes/index.js';

/**
 * ${className} - Extends BaseApp
 * Organized and maintainable Express app configuration
 */
class ${className} extends BaseApp {
  constructor() {
    super({
      serviceName: process.env.APP_NAME || '${appName}-api'
    });
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
 * Extends BaseServer from framework
 */

import { BaseServer } from 'vasuzex';
import path from 'path';

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
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    // Add your custom config validations here
    super.validateConfig();
  }

  /**
   * Initialize ${appName}-specific services
   */
  async initializeServices() {
    // Initialize your services here
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

React application scaffolded with Vasuzex.

## Development

\`\`\`bash
pnpm dev:${appName}-web
\`\`\`

## Build

\`\`\`bash
pnpm build
\`\`\`

## Dependencies

- React 18
- Vite (dev server & bundler)
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
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    
    appJs: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>${capitalize(appName)} - React App</h1>
        <p>Scaffolded with Vasuzex Framework</p>
      </header>
      
      <main>
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        </div>
      </main>
    </div>
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
