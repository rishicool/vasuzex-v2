/**
 * Web Structure Generator
 * Handles creation of web-specific directory structure and files
 */

import { join } from 'path';
import {
  createDirectories,
  createDirectory,
  writeFileContent,
} from './fileOperations.js';
import {
  generateWebIndexHTML,
  generateWebReadme,
  generateReactTemplate,
  generateVueTemplate,
  generateSvelteTemplate,
  generateReduxStoreFiles,
  generateReactAuthPages
} from './templateGenerator.js';

/**
 * Create web directory structure
 */
export async function createWebDirectoryStructure(targetDir) {
  const directories = [
    'src',
    'public',
  ];
  
  await createDirectories(targetDir, directories);
}

/**
 * Generate web files
 */
export async function generateWebFiles(targetDir, appName) {
  // index.html
  await writeFileContent(
    join(targetDir, 'public/index.html'),
    generateWebIndexHTML(appName)
  );
  
  // README
  await writeFileContent(
    join(targetDir, 'README.md'),
    generateWebReadme(appName)
  );
}

/**
 * Generate complete web structure
 */
export async function generateCompleteWebStructure(targetDir, appName, framework = 'plain') {
  await createWebDirectoryStructure(targetDir);
  
  if (framework === 'react') {
    await generateReactApp(targetDir, appName);
  } else if (framework === 'vue') {
    await generateVueApp(targetDir, appName);
  } else if (framework === 'svelte') {
    await generateSvelteApp(targetDir, appName);
  } else {
    await generateWebFiles(targetDir, appName);
  }
}

/**
 * Generate React app structure with Redux and Auth
 */
export async function generateReactApp(targetDir, appName) {
  const { indexHtml, appJs, indexJs, indexCss } = generateReactTemplate(appName);
  const storeFiles = generateReduxStoreFiles(appName);
  const authPages = generateReactAuthPages(appName);
  
  // Create directory structure
  await createDirectory(join(targetDir, 'src/store'));
  await createDirectory(join(targetDir, 'src/pages'));
  await createDirectory(join(targetDir, 'src/components'));
  
  // Root files
  await writeFileContent(join(targetDir, 'index.html'), indexHtml);
  await writeFileContent(join(targetDir, 'src/App.jsx'), appJs);
  await writeFileContent(join(targetDir, 'src/index.jsx'), indexJs);
  await writeFileContent(join(targetDir, 'src/index.css'), indexCss);
  
  // Redux store
  await writeFileContent(join(targetDir, 'src/store/index.js'), storeFiles.storeIndex);
  await writeFileContent(join(targetDir, 'src/store/authSlice.js'), storeFiles.authSlice);
  
  // Auth pages
  await writeFileContent(join(targetDir, 'src/pages/Login.jsx'), authPages.login);
  await writeFileContent(join(targetDir, 'src/pages/Register.jsx'), authPages.register);
  await writeFileContent(join(targetDir, 'src/pages/Dashboard.jsx'), authPages.dashboard);
  
  // Components
  await writeFileContent(join(targetDir, 'src/components/ProtectedRoute.jsx'), authPages.protectedRoute);
  
  // Config files
  await writeFileContent(join(targetDir, 'vite.config.js'), generateViteConfig('react'));
  await writeFileContent(join(targetDir, '.env.example'), generateReactEnvExample());
  await writeFileContent(join(targetDir, 'README.md'), generateWebReadme(appName, 'react'));
}

/**
 * Generate Vue app structure
 */
export async function generateVueApp(targetDir, appName) {
  const { indexHtml, appVue, mainJs } = generateVueTemplate(appName);
  
  // Vite expects index.html at root
  await writeFileContent(join(targetDir, 'index.html'), indexHtml);
  await writeFileContent(join(targetDir, 'src/App.vue'), appVue);
  await writeFileContent(join(targetDir, 'src/main.js'), mainJs);
  await writeFileContent(join(targetDir, 'vite.config.js'), generateViteConfig('vue'));
  await writeFileContent(join(targetDir, 'README.md'), generateWebReadme(appName, 'vue'));
}

/**
 * Generate Svelte app structure
 */
export async function generateSvelteApp(targetDir, appName) {
  const { indexHtml, appSvelte, mainJs } = generateSvelteTemplate(appName);
  
  // Vite expects index.html at root
  await writeFileContent(join(targetDir, 'index.html'), indexHtml);
  await writeFileContent(join(targetDir, 'src/App.svelte'), appSvelte);
  await writeFileContent(join(targetDir, 'src/main.js'), mainJs);
  await writeFileContent(join(targetDir, 'vite.config.js'), generateViteConfig('svelte'));
  await writeFileContent(join(targetDir, 'README.md'), generateWebReadme(appName, 'svelte'));
}

/**
 * Generate Vite config
 */
function generateViteConfig(framework) {
  if (framework === 'react') {
    return `import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    cacheDir: path.resolve(__dirname, '../../../node_modules/.vite'),
    server: {
      port: parseInt(env.APP_PORT) || 4000,
    },
  };
});`;
  }
  
  if (framework === 'vue') {
    return `import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [vue()],
    cacheDir: path.resolve(__dirname, '../../../node_modules/.vite'),
    server: {
      port: parseInt(env.APP_PORT) || 4000,
    },
  };
});`;
  }
  
  if (framework === 'svelte') {
    return `import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [svelte()],
    cacheDir: path.resolve(__dirname, '../../../node_modules/.vite'),
    server: {
      port: parseInt(env.APP_PORT) || 4000,
    },
  };
});`;
  }
  
  return '';
}

/**
 * Generate React .env.example file
 */
function generateReactEnvExample() {
  return `# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=My App
VITE_APP_ENV=development`;
}
