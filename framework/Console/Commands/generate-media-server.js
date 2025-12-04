/**
 * Generate Media Server Command (Refactored)
 * Creates centralized media server for dynamic thumbnail generation
 */

import { join } from 'path';
import {
  // File Operations
  getProjectRoot,
  pathExists,
  writeFileContent,
  writeJsonFile,
  
  // Package Manager
  createMediaServerPackageJson,
  addMediaServerScripts,
  
  // Media Server Templates
  generateMediaServerEnvTemplate,
  generateNodmonConfigTemplate,
  generateMediaServerIndexTemplate,
  generateMediaServerReadmeTemplate,
  
  // Media Server Structure
  generateCompleteMediaServerStructure,
  
  // Installer
  installDependencies,
  
  // Console Display
  displayMediaServerStructure,
  displayMediaServerNextSteps,
} from './utils/index.js';

/**
 * Main generate media server function
 */
export async function generateMediaServer(options) {
  const port = options.port || '4003';
  const targetDir = join(getProjectRoot(), 'apps', 'media-server');

  console.log('🖼️  Generating Media Server...\n');

  // Check if already exists
  if (pathExists(targetDir)) {
    console.error(`❌ Error: Media server already exists at ${targetDir}`);
    console.log('💡 Delete the existing directory first or use a different location.');
    process.exit(1);
  }

  try {
    // Create complete media server structure
    await generateCompleteMediaServerStructure(targetDir, port);
    
    // Generate package.json
    await createMediaServerPackageJson(targetDir);
    
    // Generate nodemon.json
    await writeJsonFile(
      join(targetDir, 'nodemon.json'),
      JSON.parse(generateNodmonConfigTemplate())
    );
    
    // Generate .env files
    const envContent = generateMediaServerEnvTemplate(port);
    await writeFileContent(join(targetDir, '.env.example'), envContent);
    await writeFileContent(join(targetDir, '.env'), envContent);
    
    // Generate main index.js
    await writeFileContent(
      join(targetDir, 'src/index.js'),
      generateMediaServerIndexTemplate(port)
    );
    
    // Generate README
    await writeFileContent(
      join(targetDir, 'README.md'),
      generateMediaServerReadmeTemplate(port)
    );
    
    // Update root package.json scripts
    console.log('\n🔧 Updating root package.json scripts...');
    await addMediaServerScripts();
    
    // Display structure
    displayMediaServerStructure();
    
    // Install dependencies
    await installDependencies();
    
    // Display next steps
    displayMediaServerNextSteps(port);

  } catch (error) {
    console.error('❌ Error generating media server:', error.message);
    process.exit(1);
  }
}
