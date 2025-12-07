/**
 * Plop Generator Utility
 * Programmatically invoke Plop for template generation
 */

import nodePlop from 'node-plop';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate API service files using Plop
 * 
 * @param {string} destPath - Destination path for generated files
 * @param {string} projectName - Project name for @projectName/database imports
 * @param {string} appName - App name (e.g., 'blog', 'shop')
 * @returns {Promise<Object>} Generation results
 */
export async function generateAPIApp(destPath, projectName, appName) {
  try {
    // Load plopfile - it's in Console/, not Console/Commands/
    const plopfilePath = path.join(__dirname, '../../plopfile.js');
    
    // Load plop with plopfile
    const plop = await nodePlop(plopfilePath);
    
    // Get the generator
    const generator = plop.getGenerator('api-app');
    
    // Run the generator with data
    const results = await generator.runActions({
      destPath,
      projectName,
      appName
    });
    
    return {
      success: true,
      results,
      filesCreated: results.changes.map(c => c.path)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Keep old name for backward compatibility
export const generateAPIService = generateAPIApp;

/**
 * Generate all API files
 * Wrapper function that generates complete API structure
 * 
 * @param {string} destPath - Destination path
 * @param {string} projectName - Project name
 * @param {string} appName - App name
 * @returns {Promise<Object>} Generation results
 */
export async function generateCompleteAPI(destPath, projectName, appName) {
  const results = {
    services: null,
    controllers: null,
    middleware: null,
    routes: null,
    success: true,
    errors: []
  };
  
  try {
    // Generate API service files
    const serviceResult = await generateAPIService(destPath, projectName, appName);
    results.services = serviceResult;
    
    if (!serviceResult.success) {
      results.success = false;
      results.errors.push(serviceResult.error);
    }
    
    return results;
  } catch (error) {
    results.success = false;
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Test Plop setup
 * Verify that Plop is correctly configured
 */
export async function testPlopSetup() {
  try {
    const plopfilePath = path.join(__dirname, '../plopfile.js');
    const plop = await nodePlop(plopfilePath);
    const generators = plop.getGeneratorList();
    
    return {
      success: true,
      generators: generators.map(g => g.name)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
