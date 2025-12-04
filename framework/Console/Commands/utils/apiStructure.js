/**
 * API Structure Generator
 * Handles creation of API-specific directory structure and files
 */

import { join } from 'path';
import {
  createDirectories,
  writeFileContent,
} from './fileOperations.js';
import {
  generateBaseControllerTemplate,
  generateAuthControllerTemplate,
  generatePostControllerTemplate,
  generateCommentControllerTemplate,
  generateUserModelTemplate,
  generateAuthServiceTemplate,
  generateAuthMiddlewareTemplate,
  generateErrorHandlerTemplate,
  generateAuthRequestsTemplate,
  generateAuthRoutesTemplate,
  generatePostRoutesTemplate,
  generateRoutesIndexTemplate,
} from './apiTemplates.js';

/**
 * Create API directory structure
 */
export async function createAPIDirectoryStructure(targetDir) {
  const directories = [
    'src/controllers',
    'src/models',
    'src/services',
    'src/middleware',
    'src/routes',
    'src/requests',
  ];
  
  await createDirectories(targetDir, directories);
}

/**
 * Generate all API controllers
 */
export async function generateAPIControllers(targetDir) {
  // BaseController
  await writeFileContent(
    join(targetDir, 'src/controllers/BaseController.js'),
    generateBaseControllerTemplate()
  );
  
  // AuthController
  await writeFileContent(
    join(targetDir, 'src/controllers/AuthController.js'),
    generateAuthControllerTemplate()
  );
  
  // PostController
  await writeFileContent(
    join(targetDir, 'src/controllers/PostController.js'),
    generatePostControllerTemplate()
  );
  
  // CommentController
  await writeFileContent(
    join(targetDir, 'src/controllers/CommentController.js'),
    generateCommentControllerTemplate()
  );
}

/**
 * Generate all API models
 */
export async function generateAPIModels(targetDir) {
  // User model
  await writeFileContent(
    join(targetDir, 'src/models/User.js'),
    generateUserModelTemplate()
  );
}

/**
 * Generate all API services
 */
export async function generateAPIServices(targetDir) {
  // AuthService
  await writeFileContent(
    join(targetDir, 'src/services/AuthService.js'),
    generateAuthServiceTemplate()
  );
}

/**
 * Generate all API middleware
 */
export async function generateAPIMiddleware(targetDir) {
  // Auth middleware
  await writeFileContent(
    join(targetDir, 'src/middleware/authMiddleware.js'),
    generateAuthMiddlewareTemplate()
  );
  
  // Error handler
  await writeFileContent(
    join(targetDir, 'src/middleware/errorHandler.js'),
    generateErrorHandlerTemplate()
  );
}

/**
 * Generate all API request validators
 */
export async function generateAPIRequests(targetDir) {
  // Auth requests
  await writeFileContent(
    join(targetDir, 'src/requests/AuthRequests.js'),
    generateAuthRequestsTemplate()
  );
}

/**
 * Generate all API routes
 */
export async function generateAPIRoutes(targetDir) {
  // Auth routes
  await writeFileContent(
    join(targetDir, 'src/routes/auth.routes.js'),
    generateAuthRoutesTemplate()
  );
  
  // Post routes
  await writeFileContent(
    join(targetDir, 'src/routes/post.routes.js'),
    generatePostRoutesTemplate()
  );
  
  // Routes index
  await writeFileContent(
    join(targetDir, 'src/routes/index.js'),
    generateRoutesIndexTemplate()
  );
}

/**
 * Generate complete API structure
 */
export async function generateCompleteAPIStructure(targetDir) {
  await createAPIDirectoryStructure(targetDir);
  await generateAPIControllers(targetDir);
  await generateAPIModels(targetDir);
  await generateAPIServices(targetDir);
  await generateAPIMiddleware(targetDir);
  await generateAPIRequests(targetDir);
  await generateAPIRoutes(targetDir);
}
