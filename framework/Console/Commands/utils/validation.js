/**
 * Validation Utilities
 * Input validation and error handling
 */

import { existsSync } from 'fs';

/**
 * Validate app type
 */
export function validateAppType(type) {
  const validTypes = ['api', 'web'];
  
  if (!type) {
    console.error('❌ Error: --type is required (api or web)');
    console.log('Usage: vasuzex generate:app <name> --type <api|web>');
    console.log('Example: vasuzex generate:app blog --type api');
    process.exit(1);
  }
  
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid app type: ${type}`);
    console.log('Valid types: api, web');
    process.exit(1);
  }
  
  return true;
}

/**
 * Check if app already exists
 */
export function checkAppExists(targetDir, appName, appType) {
  if (existsSync(targetDir)) {
    console.error(`❌ Error: App already exists at ${targetDir}`);
    console.log('💡 Delete the existing directory first or use a different name.');
    process.exit(1);
  }
}

/**
 * Check if app exists for deletion
 */
export function checkAppExistsForDeletion(targetDir, skipConfirm = false) {
  if (!existsSync(targetDir)) {
    if (skipConfirm) {
      return false; // App doesn't exist, skip
    }
    console.error(`❌ Error: App does not exist at ${targetDir}`);
    process.exit(1);
  }
  
  return true;
}

/**
 * Require force flag for deletion
 */
export function requireForceFlag(force, message = 'deletion') {
  if (!force) {
    console.error(`❌ Please add --force flag to confirm ${message}`);
    process.exit(1);
  }
}
