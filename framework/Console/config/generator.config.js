/**
 * Generator Configuration
 * Centralized configuration for all generators and CLI tools
 * NO HARDCODING - all configurable values in one place
 */

export const GENERATOR_CONFIG = {
  // Package Information
  package: {
    name: 'vasuzex',
    displayName: 'Vasuzex',
    author: 'Vasuzex Team',
    repository: 'rishicool/vasuzex',
    repositoryUrl: 'https://github.com/rishicool/vasuzex',
    documentationUrl: 'https://github.com/rishicool/vasuzex/tree/main/docs',
    issuesUrl: 'https://github.com/rishicool/vasuzex/issues',
    license: 'MIT',
  },

  // Default Ports
  ports: {
    apiStart: 3000,      // API apps start from 3000 and auto-increment
    webStart: 4000,      // Web apps start from 4000 and auto-increment  
    mediaServer: 5000,   // Media server is static service (hard-coded)
  },

  // Database Defaults
  database: {
    postgresql: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
    },
    mysql: {
      host: 'localhost',
      port: 3306,
      user: 'root',
    },
    sqlite: {
      defaultPath: './database',
    },
  },

  // Framework Defaults
  defaults: {
    appName: 'blog',
    template: 'fullstack',
    webFramework: 'react',
    database: 'PostgreSQL',
    sessionCookie: 'vasuzex_session',
  },

  // Dependencies
  dependencies: {
    // Core dependencies always installed
    core: [
      'axios',
      'bcrypt',
      'bcryptjs',
      'chalk',
      'commander',
      'cors',
      'dotenv',
      'express',
      'fs-extra',
      'guruorm',
      'helmet',
      'inquirer',
      'joi',
      'jsonwebtoken',
      'maxmind',
      'multer',
      'ora',
      'pg',
      'sharp',
    ],

    // Web framework specific
    web: {
      react: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
      vue: ['vue'],
      svelte: ['svelte'],
    },

    // Web app always includes
    webCommon: [
      'yup', // Required for validation (login/registration)
    ],

    // Optional dependencies
    optional: {
      sweetalert2: '^11.0.0', // Conditional usage
    },

    // Dev dependencies
    dev: [
      '@jest/globals',
      '@vitejs/plugin-react',
      '@vitejs/plugin-vue',
      '@sveltejs/vite-plugin-svelte',
      'dotenv-cli',
      'eslint',
      'eslint-config-prettier',
      'jest',
      'nodemon',
      'prettier',
      'turbo',
      'vite',
    ],
  },

  // Template Messages
  messages: {
    creating: '🚀 Creating Vasuzex project...',
    success: '✅ Vasuzex V2 Project created successfully!',
    hybrid: '🎉 Using hybrid dependency management - all deps in root node_modules',
    happyCoding: 'Happy coding! 🎉',
  },

  // File Patterns
  files: {
    ignore: [
      'node_modules/',
      '.env',
      '.DS_Store',
      '*.log',
      'coverage/',
      'dist/',
      'build/',
      '.vscode/',
      '.idea/',
      '*.sqlite',
      'storage/logs/*',
      '!storage/logs/.gitkeep',
      'pnpm-lock.yaml',
      'package-lock.yaml',
      'yarn.lock',
    ],
  },
};

export default GENERATOR_CONFIG;
