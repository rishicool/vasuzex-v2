/**
 * Generate App Command (Refactored)
 * Creates Laravel-style monorepo app with centralized config/database
 * Structure: apps/{name}/{type}/ - e.g., apps/blog/api, apps/blog/web
 */

import { join } from 'path';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { GENERATOR_CONFIG } from '../config/generator.config.js';
import {
  // File Operations
  getAppPath,
  pathExists,
  writeFileContent,
  readProjectName,
  
  // Package Manager
  createAppPackageJson,
  addRootScripts,
  
  // Template Generator (for common files only)
  generateEnvTemplate,
  generateGitignoreTemplate,
  generateReadmeTemplate,
  
  // Web Structure (will be migrated to Plop later)
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
 * Get next available port for app type by checking existing apps
 * API apps: start from 3000 and increment (3000, 3001, 3002...)
 * Web apps: start from 4000 and increment (4000, 4001, 4002...)
 */
function getNextAvailablePort(type) {
  const projectRoot = process.cwd();
  const appsDir = join(projectRoot, 'apps');
  
  // Starting ports based on type
  const startPort = type === 'api' ? GENERATOR_CONFIG.ports.apiStart : GENERATOR_CONFIG.ports.webStart;
  
  // If apps directory doesn't exist, return start port
  if (!existsSync(appsDir)) {
    return startPort;
  }
  
  // Get all existing apps and their ports
  const usedPorts = new Set();
  
  try {
    const appFolders = readdirSync(appsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Check each app folder for app type subdirectories
    for (const appFolder of appFolders) {
      const appTypePath = join(appsDir, appFolder, type);
      const envPath = join(appTypePath, '.env');
      
      if (existsSync(envPath)) {
        try {
          const envContent = readFileSync(envPath, 'utf8');
          const portMatch = envContent.match(/APP_PORT=(\d+)/);
          if (portMatch) {
            usedPorts.add(parseInt(portMatch[1]));
          }
        } catch (err) {
          // Skip if can't read file
        }
      }
    }
  } catch (err) {
    // If can't read apps directory, return start port
    return startPort;
  }
  
  // Find next available port starting from startPort
  let nextPort = startPort;
  while (usedPorts.has(nextPort)) {
    nextPort++;
  }
  
  return nextPort;
}

/**
 * Main generate app function
 */
export async function generateApp(name, options) {
  const type = options.type;
  let framework = options.framework;
  
  // If no type specified, generate both API and Web
  if (!type) {
    console.log(`🚀 Generating Full Stack: ${name.toUpperCase()} (API + Web)\n`);
    
    // Generate API
    await generateSingleApp(name, 'api', null);
    
    console.log('\n'); // Spacing between apps
    
    // Prompt for framework if not specified
    if (!framework) {
      const inquirer = (await import('inquirer')).default;
      const answers = await inquirer.prompt([{
        type: 'list',
        name: 'framework',
        message: 'Select web framework:',
        choices: [
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
          { name: 'Svelte', value: 'svelte' },
          { name: 'Plain HTML/JS', value: 'plain' },
        ],
      }]);
      framework = answers.framework;
    }
    
    // Generate Web
    await generateSingleApp(name, 'web', framework);
    
    return;
  }
  
  // Validate input
  validateAppType(type);
  
  // Generate single app
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
  // Use app name for @{appName}/database imports (not root project name)
  const { generateAPIApp: plopGenerateAPI } = await import('./utils/plopGenerator.js');
  
  console.log('📝 Generating API files from templates...');
  
  // Get actual project name from root package.json
  const projectName = await readProjectName();
  
  // Pass project name and app name separately for template interpolation
  const result = await plopGenerateAPI(targetDir, projectName, name);
  
  if (!result.success) {
    throw new Error(`Template generation failed: ${result.error}`);
  }
  
  console.log(`✓ Generated ${result.filesCreated.length} files`);
}

/**
 * Generate Web application
 */
async function generateWebApp(name, targetDir, framework) {
  // Create complete web structure
  await generateCompleteWebStructure(targetDir, name, framework);
}

/**
 * Generate common files (package.json, README, .gitignore, .env)
 * App-specific .env with APP_PORT/APP_URL based on app type
 */
async function generateCommonFiles(name, type, targetDir, framework) {
  // package.json
  await createAppPackageJson(name, type, targetDir, framework);
  
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
  
  // App-specific .env file with correct port from GENERATOR_CONFIG
  await generateAppEnvFile(name, type, targetDir);
}

/**
 * Generate app-specific .env file with APP_PORT and APP_URL
 * Automatically finds next available port for the app type
 */
async function generateAppEnvFile(name, type, targetDir) {
  // Get next available port based on app type (auto-increment)
  const port = getNextAvailablePort(type);
  
  console.log(`📌 Assigning port ${port} to ${name} ${type}`);
  
  let envContent = `# ${name.toUpperCase()} ${type.toUpperCase()} Configuration
APP_PORT=${port}
APP_URL=http://localhost:${port}
`;
  
  // For API apps, add CORS_ORIGIN pointing to corresponding web app port
  if (type === 'api') {
    const webPort = getNextAvailablePort('web');
    envContent += `
# CORS Configuration
CORS_ORIGIN=http://localhost:${webPort}
`;
  }
  
  await writeFileContent(
    join(targetDir, '.env'),
    envContent
  );
  
  await writeFileContent(
    join(targetDir, '.env.example'),
    envContent
  );
}
