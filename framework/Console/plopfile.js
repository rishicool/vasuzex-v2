/**
 * Plop.js Configuration for Vasuzex Template Generation
 * 
 * This file defines generators for creating API, Web, and Media Server apps
 * Used internally by vasuzex generate:app command
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (plop) {
  // Helpers for template transformations
  plop.setHelper('capitalize', (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  });
  
  plop.setHelper('pascalCase', (text) => {
    return text
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  });
  
  plop.setHelper('camelCase', (text) => {
    const pascal = text
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  });
  
  plop.setHelper('kebabCase', (text) => {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  });

  // Set base path for templates
  plop.setGenerator('api-app', {
    description: 'Generate complete API application',
    prompts: [],
    actions: function(data) {
      const actions = [];
      const basePath = data.destPath || '.';
      
      // Controllers
      actions.push({
        type: 'add',
        path: `${basePath}/src/controllers/BaseController.js`,
        templateFile: 'templates/api/controllers/BaseController.js.hbs',
        skipIfExists: true
      });
      
      actions.push({
        type: 'add',
        path: `${basePath}/src/controllers/AuthController.js`,
        templateFile: 'templates/api/controllers/AuthController.js.hbs',
        skipIfExists: true
      });
      
      // Services
      actions.push({
        type: 'add',
        path: `${basePath}/src/services/AuthService.js`,
        templateFile: 'templates/api/services/AuthService.js.hbs',
        skipIfExists: true
      });
      
      // Middleware
      actions.push({
        type: 'add',
        path: `${basePath}/src/middleware/authMiddleware.js`,
        templateFile: 'templates/api/middleware/authMiddleware.js.hbs',
        skipIfExists: true
      });
      
      actions.push({
        type: 'add',
        path: `${basePath}/src/middleware/errorHandler.js`,
        templateFile: 'templates/api/middleware/errorHandler.js.hbs',
        skipIfExists: true
      });
      
      // Routes
      actions.push({
        type: 'add',
        path: `${basePath}/src/routes/auth.js`,
        templateFile: 'templates/api/routes/auth.js.hbs',
        skipIfExists: true
      });
      
      actions.push({
        type: 'add',
        path: `${basePath}/src/routes/index.js`,
        templateFile: 'templates/api/routes/index.js.hbs',
        skipIfExists: true
      });
      
      // Requests
      actions.push({
        type: 'add',
        path: `${basePath}/src/requests/AuthRequests.js`,
        templateFile: 'templates/api/requests/AuthRequests.js.hbs',
        skipIfExists: true
      });
      
      // Helpers
      actions.push({
        type: 'add',
        path: `${basePath}/src/helpers/env.js`,
        templateFile: 'templates/api/helpers/env.js.hbs',
        skipIfExists: true
      });
      
      // Main app files
      actions.push({
        type: 'add',
        path: `${basePath}/src/app.js`,
        templateFile: 'templates/api/app.js.hbs',
        skipIfExists: true
      });
      
      actions.push({
        type: 'add',
        path: `${basePath}/src/index.js`,
        templateFile: 'templates/api/server.js.hbs',
        skipIfExists: true
      });
      
      return actions;
    }
  });
}
