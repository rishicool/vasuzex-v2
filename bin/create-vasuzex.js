#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import Handlebars from 'handlebars';
import { GENERATOR_CONFIG } from '../framework/Console/config/generator.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frameworkRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(__dirname, 'templates');

/**
 * ====================
 * HELPER FUNCTIONS
 * ====================
 */

/**
 * Render template file with Handlebars
 */
async function renderTemplate(templateName, data) {
  const templatePath = path.join(templatesDir, templateName);
  const templateContent = await fs.readFile(templatePath, 'utf8');
  const template = Handlebars.compile(templateContent);
  return template(data);
}

/**
 * ====================
 * MODULAR FUNCTIONS
 * ====================
 */

/**
 * Prompt user for project configuration
 */
async function promptUserInput(projectName) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Choose starter template:',
      choices: [
        { name: 'Minimal (Empty project - generate apps later)', value: 'minimal' },
        { name: 'API Only (Backend)', value: 'api-only' },
        { name: 'Web Only (Frontend)', value: 'web-only' },
        { name: 'Full Stack (API + Web)', value: 'fullstack' },
        { name: 'API + Media Server', value: 'api-media' }
      ],
      default: 'fullstack'
    },
    {
      type: 'input',
      name: 'appName',
      message: 'Enter app name (e.g., blog, shop, admin):',
      default: 'blog',
      when: (answers) => answers.template !== 'minimal',
      validate: (input) => {
        if (!input || input.trim().length === 0) return 'App name is required';
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'App name must start with a letter and contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'webFramework',
      message: 'Choose web framework:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue.js', value: 'vue' },
        { name: 'Svelte', value: 'svelte' },
        { name: 'Vanilla JS (No framework)', value: 'vanilla' }
      ],
      when: (answers) => answers.template === 'web-only' || answers.template === 'fullstack',
      default: 'react'
    },
    {
      type: 'list',
      name: 'database',
      message: 'Choose database:',
      choices: ['PostgreSQL', 'MySQL', 'SQLite'],
      default: 'PostgreSQL'
    },
    {
      type: 'confirm',
      name: 'configureDatabaseNow',
      message: 'Configure database connection now?',
      default: true
    }
  ]);

  // Database configuration
  if (answers.configureDatabaseNow && answers.database !== 'SQLite') {
    const dbConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Database host:',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'port',
        message: 'Database port:',
        default: answers.database === 'PostgreSQL' ? '5432' : '3306'
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: projectName.replace(/-/g, '_')
      },
      {
        type: 'input',
        name: 'username',
        message: 'Database username:',
        default: answers.database === 'PostgreSQL' ? 'postgres' : 'root'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
        mask: '*'
      }
    ]);
    
    answers.dbConfig = dbConfig;
  }

  return answers;
}

/**
 * Create base project directory structure
 */
async function createProjectStructure(targetDir, spinner) {
  spinner.text = 'Creating directory structure...';
  
  await fs.ensureDir(targetDir);
  await fs.ensureDir(path.join(targetDir, 'database'));
  await fs.ensureDir(path.join(targetDir, 'database/models'));
  await fs.ensureDir(path.join(targetDir, 'database/migrations'));
  await fs.ensureDir(path.join(targetDir, 'database/seeders'));
  await fs.ensureDir(path.join(targetDir, 'apps'));
}

/**
 * Copy config files from framework
 */
async function copyConfigFiles(targetDir, spinner) {
  spinner.text = 'Copying configuration files...';
  
  const configSource = path.join(frameworkRoot, 'config');
  const configTarget = path.join(targetDir, 'config');
  await fs.copy(configSource, configTarget);
}

/**
 * Copy database files from framework
 */
async function copyDatabaseFiles(targetDir, spinner, projectName) {
  spinner.text = 'Setting up database structure...';
  
  const dbModelsSource = path.join(frameworkRoot, 'database/models');
  const dbModelsTarget = path.join(targetDir, 'database/models');
  if (await fs.pathExists(dbModelsSource)) {
    await fs.copy(dbModelsSource, dbModelsTarget);
  }
  
  const dbMigrationsSource = path.join(frameworkRoot, 'database/migrations');
  const dbMigrationsTarget = path.join(targetDir, 'database/migrations');
  if (await fs.pathExists(dbMigrationsSource)) {
    await fs.copy(dbMigrationsSource, dbMigrationsTarget);
  }
  
  // Create database/index.js for exports
  const dbIndexContent = await renderTemplate('database-index.js.hbs', {});
  await fs.writeFile(path.join(targetDir, 'database/index.js'), dbIndexContent);
  
  // Create database/package.json for workspace package
  const dbPackageJson = {
    name: `@${projectName}/database`,
    version: '1.0.0',
    type: 'module',
    main: './index.js',
    exports: {
      '.': './index.js',
      './models/*': './models/*.js'
    }
  };
  await fs.writeFile(
    path.join(targetDir, 'database/package.json'),
    JSON.stringify(dbPackageJson, null, 2) + '\n'
  );
}

/**
 * Create package.json with V2 hybrid dependency management
 * All dependencies in root - apps use hoisted deps
 */
async function createPackageJson(projectName, targetDir, spinner) {
  spinner.text = 'Creating package.json with V2 dependencies...';
  
  // Detect if running from local development (any vasuzex folder)
  const isLocalDev = frameworkRoot.includes('/work/vasuzex') || frameworkRoot.includes('\\work\\vasuzex');
  
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    private: true,
    packageManager: 'pnpm@10.0.0',
    scripts: {
      dev: 'turbo run dev',
      build: 'turbo run build',
      start: 'turbo run start',
      test: 'NODE_OPTIONS=--experimental-vm-modules jest',
      'test:watch': 'NODE_OPTIONS=--experimental-vm-modules jest --watch',
      'test:coverage': 'NODE_OPTIONS=--experimental-vm-modules jest --coverage',
      'db:migrate': 'npx vasuzex migrate',
      'db:migrate:status': 'npx vasuzex migrate:status',
      'db:rollback': 'npx vasuzex migrate:rollback',
      'db:seed': 'npx vasuzex db:seed',
      'db:reset': 'npx vasuzex migrate:fresh --seed',
      'make:model': 'npx vasuzex make:model',
      'make:migration': 'npx vasuzex make:migration',
      'make:seeder': 'npx vasuzex make:seeder',
      'generate:app': 'npx vasuzex generate:app',
      'generate:media-server': 'npx vasuzex generate:media-server'
    },
    keywords: ['vasuzex', 'nodejs', 'framework', 'v2'],
    dependencies: {
      vasuzex: isLocalDev ? `file:${frameworkRoot}` : '^2.0.6',
      axios: '^1.13.2',
      bcrypt: '^6.0.0',
      bcryptjs: '^2.4.3',
      chalk: '^5.6.2',
      commander: '^12.1.0',
      cors: '^2.8.5',
      dotenv: '^16.6.1',
      express: '^5.2.1',
      'fs-extra': '^11.3.2',
      guruorm: '^2.0.0',
      helmet: '^8.1.0',
      inquirer: '^9.3.8',
      joi: '^17.13.3',
      jsonwebtoken: '^9.0.2',
      maxmind: '^5.0.1',
      multer: '^2.0.2',
      ora: '^8.2.0',
      pg: '^8.16.3',
      sharp: '^0.33.5',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-redux': '^9.1.0',
      'react-router-dom': '^6.28.0',
      '@reduxjs/toolkit': '^2.0.1',
      'redux-persist': '^6.0.0',
      vue: '^3.4.0',
      svelte: '^4.2.0',
      yup: '^1.0.0',
      sweetalert2: '^11.0.0'
    },
    devDependencies: {
      '@jest/globals': '^29.7.0',
      '@vitejs/plugin-react': '^4.2.1',
      '@vitejs/plugin-vue': '^5.0.0',
      '@sveltejs/vite-plugin-svelte': '^3.0.0',
      'dotenv-cli': '^11.0.0',
      eslint: '^9.17.0',
      'eslint-config-prettier': '^10.0.1',
      jest: '^29.7.0',
      nodemon: '^3.1.11',
      prettier: '^3.0.0',
      turbo: '^2.6.1',
      vite: '^5.0.0'
    },
    pnpm: {
      overrides: {
        express: '^5.2.1',
        react: '^18.2.0',
        vue: '^3.4.0'
      }
    },
    imports: {
      '#database': './database/index.js',
      '#database/*': './database/*',
      '#models': './database/models/index.js',
      '#models/*': './database/models/*',
      '#config': './config/index.cjs',
      '#config/*': './config/*'
    }
  };
  
  // Already set vasuzex dependency above, just log if local dev
  if (isLocalDev) {
    console.log(chalk.cyan(`\n🔧 Development mode: Using local vasuzex from ${frameworkRoot}\n`));
  }
  
  await fs.writeJSON(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
  
  console.log(chalk.green('\n✅ V2 Package.json created with hybrid dependency management'));
  console.log(chalk.cyan('   All dependencies in root - apps use hoisted packages\n'));
}

/**
 * Create pnpm-workspace.yaml
 */
async function createPnpmWorkspace(targetDir) {
  const workspaceContent = await renderTemplate('pnpm-workspace.yaml.hbs', {});
  await fs.writeFile(path.join(targetDir, 'pnpm-workspace.yaml'), workspaceContent, 'utf8');
}

/**
 * Create .npmrc with V2 hoisting configuration
 * Forces all dependencies to root node_modules
 */
async function createNpmrc(targetDir) {
  const npmrcContent = await renderTemplate('.npmrc.hbs', {});
  await fs.writeFile(path.join(targetDir, '.npmrc'), npmrcContent, 'utf8');
}

/**
 * Create turbo.json configuration
 */
async function createTurboConfig(targetDir) {
  const turboConfig = {
    "$schema": "https://turbo.build/schema.json",
    "globalDependencies": ["**/.env"],
    "globalEnv": ["NODE_ENV", "CI", "APP_ENV"],
    "tasks": {
      "dev": {
        "cache": false,
        "persistent": true,
        "env": ["APP_ENV", "NODE_ENV", "DATABASE_URL"]
      },
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**", "build/**"],
        "env": ["NODE_ENV"]
      },
      "start": {
        "cache": false,
        "persistent": true,
        "dependsOn": ["build"]
      }
    }
  };
  
  await fs.writeJSON(path.join(targetDir, 'turbo.json'), turboConfig, { spaces: 2 });
}

/**
 * Generate environment file
 */
async function generateEnvFile(projectName, answers, targetDir, spinner) {
  spinner.text = 'Creating environment file...';
  
  let envContent = `# Application
APP_NAME=${projectName}
APP_ENV=development

# Database
DB_CONNECTION=${answers.database.toLowerCase() === 'postgresql' ? 'postgresql' : answers.database.toLowerCase()}
`;

  const dbConfig = answers.dbConfig;
  
  if (answers.database === 'PostgreSQL') {
    envContent += `
POSTGRES_HOST=${dbConfig?.host || 'localhost'}
POSTGRES_PORT=${dbConfig?.port || '5432'}
POSTGRES_DB=${dbConfig?.database || projectName.replace(/-/g, '_')}
POSTGRES_USER=${dbConfig?.username || 'postgres'}
POSTGRES_PASSWORD=${dbConfig?.password || ''}
`;
  } else if (answers.database === 'MySQL') {
    envContent += `
DB_HOST=${dbConfig?.host || 'localhost'}
DB_PORT=${dbConfig?.port || '3306'}
DB_DATABASE=${dbConfig?.database || projectName.replace(/-/g, '_')}
DB_USERNAME=${dbConfig?.username || 'root'}
DB_PASSWORD=${dbConfig?.password || ''}
`;
  } else if (answers.database === 'SQLite') {
    envContent += `
DB_DATABASE=./database/${projectName}.sqlite
`;
  }

  envContent += `
# Cache
CACHE_DRIVER=memory

# Session
SESSION_DRIVER=memory

# Logging
LOG_LEVEL=debug
LOG_FILE=storage/logs/app.log
`;

  await fs.writeFile(path.join(targetDir, '.env'), envContent);
  await fs.writeFile(path.join(targetDir, '.env.example'), envContent);
}

/**
 * Create gitignore
 */
async function createGitignore(targetDir) {
  const gitignoreContent = await renderTemplate('.gitignore.hbs', {});
  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignoreContent);
}

/**
 * Create README
 */
async function createReadme(projectName, targetDir) {
  const readmeContent = await renderTemplate('README.md.hbs', {
    projectName,
    dbName: projectName.replace(/-/g, '_'),
    documentationUrl: GENERATOR_CONFIG.package.documentationUrl
  });
  await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent);
}

/**
 * Install dependencies
 */
async function installDependencies(targetDir) {
  console.log(chalk.cyan('\n📦 Installing dependencies...\n'));
  
  try {
    execSync('pnpm install', {
      cwd: targetDir,
      stdio: 'inherit'
    });
    console.log(chalk.green('\n✅ Dependencies installed!\n'));
    return true;
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Failed to install dependencies automatically'));
    console.log(chalk.yellow('Please run "pnpm install" manually\n'));
    return false;
  }
}

/**
 * Generate apps based on template
 */
async function generateApps(answers, targetDir) {
  const appName = answers.appName || 'blog';
  let appTypes = [];
  
  // Determine which apps to generate based on template
  switch (answers.template) {
    case 'api-only':
      appTypes = ['api'];
      break;
    case 'web-only':
      appTypes = ['web'];
      break;
    case 'fullstack':
      appTypes = ['api', 'web'];
      break;
    case 'api-media':
      appTypes = ['api'];
      break;
    default:
      return; // minimal - no apps
  }
  
  // Generate selected app types
  for (const type of appTypes) {
    console.log(chalk.cyan(`🚀 Generating ${appName} ${type.toUpperCase()}...\n`));
    
    try {
      const webFramework = answers.webFramework || 'react';
      const extraArgs = type === 'web' ? `--framework ${webFramework}` : '';
      
      // Use node_modules/.bin/vasuzex for cross-package-manager compatibility
      const vasuzexCmd = path.join(targetDir, 'node_modules', '.bin', 'vasuzex');
      
      execSync(`"${vasuzexCmd}" generate:app ${appName} --type ${type} ${extraArgs}`, {
        cwd: targetDir,
        stdio: 'inherit',
        env: { ...process.env, SKIP_INSTALL: 'true' }
      });
      console.log(chalk.green(`\n✅ ${appName} ${type} generated!\n`));
    } catch (error) {
      console.log(chalk.yellow(`\n⚠️  Could not generate ${appName} ${type} automatically`));
      console.log(chalk.yellow(`You can run: vasuzex generate:app ${appName} --type ${type}\n`));
    }
  }
  
  // Generate media server if template is api-media or fullstack
  if (answers.template === 'api-media' || answers.template === 'fullstack') {
    console.log(chalk.cyan('🖼️  Generating Media Server...\n'));
    
    try {
      // Use node_modules/.bin/vasuzex for cross-package-manager compatibility
      const vasuzexCmd = path.join(targetDir, 'node_modules', '.bin', 'vasuzex');
      
      execSync(`"${vasuzexCmd}" generate:media-server`, {
        cwd: targetDir,
        stdio: 'inherit',
        env: { ...process.env, SKIP_INSTALL: 'true' }
      });
      console.log(chalk.green('\n✅ Media server generated!\n'));
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Could not generate media server automatically'));
      console.log(chalk.yellow('You can run: vasuzex generate:media-server\n'));
    }
  }
}

/**
 * Initialize git repository
 */
async function initializeGit(targetDir) {
  const spinner = ora('Initializing git repository...').start();
  
  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from Vasuzex"', { cwd: targetDir, stdio: 'pipe' });
    spinner.succeed('Git repository initialized!');
  } catch (error) {
    spinner.info('Skipped git initialization');
  }
}

/**
 * Display success message
 */
function displaySuccessMessage(projectName, answers) {
  console.log(chalk.green('\n✅ Vasuzex V2 Project created successfully!\n'));
  console.log(chalk.cyan('🎉 Using hybrid dependency management - all deps in root node_modules\n'));
  
  // Project structure info
  console.log(chalk.bold.white('📁 Project Structure:'));
  console.log(chalk.white(`  ${projectName}/`));
  console.log(chalk.white(`    ├── config/          ${chalk.gray('All framework configurations')}`));
  console.log(chalk.white(`    ├── database/        ${chalk.gray('Models, migrations, seeders')}`));
  console.log(chalk.white(`    ├── apps/            ${chalk.gray('Your applications')}`));
  if (answers.template === 'fullstack') {
    console.log(chalk.white(`    │   └── ${answers.appName || 'blog'}/`));
    console.log(chalk.white(`    │       ├── api/     ${chalk.gray('Backend API server')}`));
    console.log(chalk.white(`    │       └── web/     ${chalk.gray(`Frontend ${answers.webFramework || 'React'} app`)}`));
  } else if (answers.template === 'api-only') {
    console.log(chalk.white(`    │   └── ${answers.appName || 'blog'}/api/  ${chalk.gray('Backend API server')}`));
  } else if (answers.template === 'web-only') {
    console.log(chalk.white(`    │   └── ${answers.appName || 'blog'}/web/  ${chalk.gray(`Frontend ${answers.webFramework || 'React'} app`)}`));
  }
  console.log(chalk.white(`    ├── node_modules/    ${chalk.gray('Centralized dependencies')}`));
  console.log(chalk.white(`    └── .env             ${chalk.gray('Environment configuration')}\n`));
  
  console.log(chalk.cyan.bold('🚀 Next steps:\n'));
  console.log(chalk.white(`  ${chalk.cyan('cd')} ${projectName}`));
  console.log(chalk.white(`  ${chalk.cyan('pnpm install')}  ${chalk.gray('(if not done automatically)')}\n`));
  
  // Database setup
  if (answers.configureDatabaseNow) {
    console.log(chalk.white(`  ${chalk.gray('# Database is configured, run migrations:')}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm db:migrate')}\n`));
  } else {
    console.log(chalk.white(`  ${chalk.gray('# Edit .env with your database credentials, then:')}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm db:migrate')}\n`));
  }
  
  // Template-specific instructions
  if (answers.template === 'fullstack') {
    const appName = answers.appName || 'blog';
    console.log(chalk.white(`  ${chalk.gray('# Start backend API (Terminal 1):')}`));
    console.log(chalk.white(`  ${chalk.cyan(`cd apps/${appName}/api`)}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm dev')}\n`));
    
    console.log(chalk.white(`  ${chalk.gray('# Start frontend web (Terminal 2):')}`));
    console.log(chalk.white(`  ${chalk.cyan(`cd apps/${appName}/web`)}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm dev')}\n`));
    
    console.log(chalk.green(`  ✨ API: http://localhost:3000`));
    console.log(chalk.green(`  ✨ Web: http://localhost:3001\n`));
  } else if (answers.template === 'api-only') {
    console.log(chalk.white(`  ${chalk.gray('# Start API server:')}`));
    console.log(chalk.white(`  ${chalk.cyan(`cd apps/${answers.appName || 'blog'}/api`)}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm dev')}\n`));
    console.log(chalk.green(`  ✨ API: http://localhost:3000\n`));
  } else if (answers.template === 'web-only') {
    console.log(chalk.white(`  ${chalk.gray('# Start web app:')}`));
    console.log(chalk.white(`  ${chalk.cyan(`cd apps/${answers.appName || 'blog'}/web`)}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm dev')}\n`));
    console.log(chalk.green(`  ✨ Web: http://localhost:3001\n`));
  } else if (answers.template === 'minimal') {
    console.log(chalk.white(`  ${chalk.gray('# Generate your first app:')}`));
    console.log(chalk.white(`  ${chalk.cyan('pnpm generate:app myapp --type api')}\n`));
  }
  
  // Available commands
  console.log(chalk.gray.bold('📦 Available Commands:'));
  console.log(chalk.white('  pnpm dev                     - Run all apps in dev mode'));
  console.log(chalk.white('  pnpm generate:app <name>     - Generate new app (API/Web)'));
  console.log(chalk.white('  pnpm make:model <name>       - Create model'));
  console.log(chalk.white('  pnpm make:migration <name>   - Create migration'));
  console.log(chalk.white('  pnpm make:seeder <name>      - Create seeder'));
  console.log(chalk.white('  pnpm db:migrate              - Run migrations'));
  console.log(chalk.white('  pnpm db:seed                 - Run seeders'));
  console.log(chalk.white('  pnpm db:reset                - Fresh migrate + seed\n'));
  
  console.log(chalk.cyan(`📖 Documentation: ${GENERATOR_CONFIG.package.documentationUrl}`));
  console.log(chalk.cyan('🔧 Config files: All in ./config/ directory'));
  console.log(chalk.cyan(`${GENERATOR_CONFIG.messages.happyCoding}\n`));
}

/**
 * ====================
 * MAIN FUNCTION
 * ====================
 */
async function createProject(projectName) {
  console.log(chalk.cyan('\n🚀 Creating Vasuzex project...\n'));

  // 1. Prompt for configuration
  const answers = await promptUserInput(projectName);
  
  const targetDir = path.join(process.cwd(), projectName);

  // 2. Check if directory exists
  if (await fs.pathExists(targetDir)) {
    console.error(chalk.red(`\n❌ Directory "${projectName}" already exists!\n`));
    process.exit(1);
  }

  const spinner = ora('Creating project structure...').start();

  try {
    // 3. Create project structure
    await createProjectStructure(targetDir, spinner);
    
    // 4. Copy config files
    await copyConfigFiles(targetDir, spinner);
    
    // 5. Copy database files
    await copyDatabaseFiles(targetDir, spinner, projectName);
    
    // 6. Create package.json
    await createPackageJson(projectName, targetDir, spinner);
    
    // 7. Create pnpm-workspace.yaml
    await createPnpmWorkspace(targetDir);
    
    // 8. Create .npmrc (V2 hoisting configuration)
    await createNpmrc(targetDir);
    
    // 9. Create turbo.json
    await createTurboConfig(targetDir);
    
    // 10. Generate .env file
    await generateEnvFile(projectName, answers, targetDir, spinner);
    
    // 11. Create .gitignore
    await createGitignore(targetDir);
    
    // 12. Create README
    await createReadme(projectName, targetDir);
    
    spinner.succeed('Project structure created!');
    
    // 13. Install dependencies
    await installDependencies(targetDir);
    
    // 14. Generate apps
    await generateApps(answers, targetDir);
    
    // 15. Initialize git
    await initializeGit(targetDir);
    
    // 16. Success message
    displaySuccessMessage(projectName, answers);

  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red('\n' + error.message + '\n'));
    console.error(error.stack);
    
    // Cleanup on failure
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }
    
    process.exit(1);
  }
}

/**
 * ====================
 * CLI PROGRAM
 * ====================
 */
program
  .name('create-vasuzex')
  .description('Create a new Vasuzex project')
  .version('1.0.0')
  .argument('<project-name>', 'Name of the project to create')
  .action(async (projectName) => {
    // Validate project name
    if (!/^[a-z0-9-_]+$/i.test(projectName)) {
      console.error(chalk.red('\n❌ Project name can only contain letters, numbers, hyphens, and underscores\n'));
      process.exit(1);
    }

    await createProject(projectName);
  });

program.parse();
