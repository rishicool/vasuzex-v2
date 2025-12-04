/**
 * Web Structure Generator
 * Handles creation of web-specific directory structure and files
 */

import { join } from 'path';
import {
  createDirectories,
  writeFileContent,
} from './fileOperations.js';
import {
  generateWebIndexHTML,
  generateWebReadme,
  generateReactTemplate,
  generateVueTemplate,
  generateSvelteTemplate,
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
 * Generate React app structure
 */
export async function generateReactApp(targetDir, appName) {
  const { indexHtml, appJs, indexJs, indexCss } = generateReactTemplate(appName);
  
  // Vite expects index.html at root, not in public/
  await writeFileContent(join(targetDir, 'index.html'), indexHtml);
  await writeFileContent(join(targetDir, 'src/App.jsx'), appJs);
  await writeFileContent(join(targetDir, 'src/index.jsx'), indexJs);
  await writeFileContent(join(targetDir, 'src/index.css'), indexCss);
  await writeFileContent(join(targetDir, 'vite.config.js'), generateViteConfig('react'));
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
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
});`;
  }
  
  if (framework === 'vue') {
    return `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
  },
});`;
  }
  
  if (framework === 'svelte') {
    return `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 3001,
  },
});`;
  }
  
  return '';
}
