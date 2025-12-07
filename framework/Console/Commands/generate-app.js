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
