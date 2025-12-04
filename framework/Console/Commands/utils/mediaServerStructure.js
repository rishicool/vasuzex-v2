/**
 * Media Server Structure Generator
 * Handles creation of media server directory structure and files
 */

import { join } from 'path';
import {
  createDirectories,
  writeFileContent,
} from './fileOperations.js';
import {
  generateMediaServerConfigTemplate,
  generateImageControllerTemplate,
  generateImageRoutesTemplate,
  generateMediaServerRoutesIndexTemplate,
} from './mediaServerTemplates.js';

/**
 * Create media server directory structure
 */
export async function createMediaServerDirectoryStructure(targetDir) {
  const directories = [
    'src/controllers',
    'src/routes',
    'config',
  ];
  
  await createDirectories(targetDir, directories);
}

/**
 * Generate media server controllers
 */
export async function generateMediaServerControllers(targetDir) {
  await writeFileContent(
    join(targetDir, 'src/controllers/ImageController.js'),
    generateImageControllerTemplate()
  );
}

/**
 * Generate media server routes
 */
export async function generateMediaServerRoutes(targetDir) {
  // Image routes
  await writeFileContent(
    join(targetDir, 'src/routes/image.routes.js'),
    generateImageRoutesTemplate()
  );
  
  // Routes index
  await writeFileContent(
    join(targetDir, 'src/routes/index.js'),
    generateMediaServerRoutesIndexTemplate()
  );
}

/**
 * Generate media server config
 */
export async function generateMediaServerConfig(targetDir, port) {
  await writeFileContent(
    join(targetDir, 'config/app.cjs'),
    generateMediaServerConfigTemplate(port)
  );
}

/**
 * Generate complete media server structure
 */
export async function generateCompleteMediaServerStructure(targetDir, port) {
  await createMediaServerDirectoryStructure(targetDir);
  await generateMediaServerControllers(targetDir);
  await generateMediaServerRoutes(targetDir);
  await generateMediaServerConfig(targetDir, port);
}
