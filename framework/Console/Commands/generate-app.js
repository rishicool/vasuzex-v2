/**
 * Generate App Command (Refactored)
 * Creates Laravel-style monorepo app with centralized config/database
 * Structure: apps/{name}/{type}/ - e.g., apps/blog/api, apps/blog/web
 */

import { join } from 'path';
import {
  // File Operations
  getAppPath,
  pathExists,
  writeFileContent,
  
  // Package Manager
  createAppPackageJson,
  addRootScripts,
  
  // Template Generator
  generateAppTemplate,
  generateServerTemplate,
  generateEnvTemplate,
  generateGitignoreTemplate,
  generateReadmeTemplate,
  
  // API Structure
  generateCompleteAPIStructure,
  
  // Web Structure
  generateCompleteWebStructure,
  
  // Validation
  validateAppType,
  checkAppExists,
  
  // Installer
  installDependencies,
  
  // Console Display
  displayAPIStructure,
  displayWebStructure,
  displayAPINextSteps,
  displayWebNextSteps,
} from './utils/index.js';

/**
 * Main generate app function
 */
export async function generateApp(name, options) {
  const type = options.type;
  const framework = options.framework;
  
  // Validate input
  validateAppType(type);
  
  // Generate app
  await generateSingleApp(name, type, framework);
}

/**
 * Generate single app (api or web)
 */
async function generateSingleApp(name, type, framework) {
  const targetDir = getAppPath(name, type);

  console.log(`🚀 Generating ${name.toUpperCase()} ${type.toUpperCase()} Application\n`);

  // Check if already exists
  checkAppExists(targetDir, name, type);

  try {
    // Create directory structure based on type
    if (type === 'api') {
      await generateAPIApp(name, targetDir);
    } else if (type === 'web') {
      await generateWebApp(name, targetDir, framework);
    }

    // Generate common files
    await generateCommonFiles(name, type, targetDir, framework);

    // Add scripts to root package.json
    await addRootScripts(name, type);

    // Display structure info
    if (type === 'api') {
      displayAPIStructure(name, type);
    } else {
      displayWebStructure(name, type, framework);
    }

    // Install dependencies
    await installDependencies();

    // Display next steps
    if (type === 'api') {
      displayAPINextSteps(name, type);
    } else {
      displayWebNextSteps(name, type, framework);
    }

  } catch (error) {
    console.error('❌ Error generating app:', error.message);
    process.exit(1);
  }
}

/**
 * Generate API application
 */
async function generateAPIApp(name, targetDir) {
  // Create complete API structure (controllers, models, services, etc.)
  await generateCompleteAPIStructure(targetDir);
  
  // Generate app.js (BaseApp inheritance)
  await writeFileContent(
    join(targetDir, 'src/app.js'),
    generateAppTemplate(name)
  );
  
  // Generate index.js (BaseServer inheritance)
  await writeFileContent(
    join(targetDir, 'src/index.js'),
    generateServerTemplate(name)
  );
}

/**
 * Generate Web application
 */
async function generateWebApp(name, targetDir, framework) {
  // Create complete web structure
  await generateCompleteWebStructure(targetDir, name, framework);
}

/**
 * Generate common files (package.json, .env, README, .gitignore)
 */
async function generateCommonFiles(name, type, targetDir, framework) {
  // package.json
  await createAppPackageJson(name, type, targetDir, framework);
  
  // .env and .env.example
  const envContent = generateEnvTemplate(name, type);
  await writeFileContent(join(targetDir, '.env.example'), envContent);
  await writeFileContent(join(targetDir, '.env'), envContent);
  
  // README.md (skip for web with framework as it's generated separately)
  if (type !== 'web' || !framework) {
    await writeFileContent(
      join(targetDir, 'README.md'),
      generateReadmeTemplate(name, type)
    );
  }
  
  // .gitignore
  await writeFileContent(
    join(targetDir, '.gitignore'),
    generateGitignoreTemplate()
  );
}
