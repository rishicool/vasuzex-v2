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
  generateAuthServiceTemplate,
  generateAuthMiddlewareTemplate,
  generateErrorHandlerTemplate,
  generateAuthRequestsTemplate,
  generateAuthRoutesTemplate,
  generateRoutesIndexTemplate,
  generateDatabaseConfigTemplate,
  generateEnvHelperTemplate,
  generateApiEnvTemplate,
} from './apiTemplates.js';

/**
 * Create API directory structure with database folders
 */
export async function createAPIDirectoryStructure(targetDir) {
  const directories = [
    'src/controllers',
    'src/services',
    'src/middleware',
    'src/routes',
    'src/requests',
    'src/helpers',
    'config',
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
  
  // Note: Post and Comment controllers removed - no models generated
  // Users can create their own with: pnpm make:controller PostController
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
  
  // Routes index (no post routes - users can add their own)
  await writeFileContent(
    join(targetDir, 'src/routes/index.js'),
    generateRoutesIndexTemplate()
  );
}

/**
 * Generate complete API structure with database setup
 */
export async function generateCompleteAPIStructure(targetDir) {
  await createAPIDirectoryStructure(targetDir);
  await generateAPIControllers(targetDir);
  // Models are in centralized database/models/ at project root
  await generateAPIServices(targetDir);
  await generateAPIMiddleware(targetDir);
  await generateAPIRequests(targetDir);
  await generateAPIRoutes(targetDir);
  await generateDatabaseConfig(targetDir);
}

/**
 * Generate database configuration only
 * Note: migrations and seeders are in centralized database/ at project root
 */
export async function generateDatabaseConfig(targetDir) {
  // Config files
  await writeFileContent(
    join(targetDir, 'config/database.js'),
    generateDatabaseConfigTemplate()
  );
  
  // Helper files
  await writeFileContent(
    join(targetDir, 'src/helpers/env.js'),
    generateEnvHelperTemplate()
  );
  
  // Note: Migrations and seeders should be created at project root using:
  // pnpm make:migration create_posts_table
  // pnpm make:seeder PostSeeder
  
  // .env.example
  await writeFileContent(
    join(targetDir, '.env.example'),
    generateApiEnvTemplate()
  );
}
