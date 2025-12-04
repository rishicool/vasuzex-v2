/**
 * Delete App Command (Refactored)
 * Remove app and cleanup references
 */

import { join } from 'path';
import {
  // File Operations
  getAppPath,
  pathExists,
  deleteDirectory,
  
  // Package Manager
  removeRootScripts,
  
  // Validation
  checkAppExistsForDeletion,
  requireForceFlag,
  
  // Installer
  cleanWorkspaceCache,
  
  // Console Display
  displayDeletionWarning,
  displayEntireAppDeletionWarning,
  displayDeletionSuccess,
} from './utils/index.js';

/**
 * Main delete app function
 */
export async function deleteApp(name, options) {
  const type = options.type;
  const force = options.force || false;
  
  // If no type specified, delete entire app (both api and web)
  if (!type) {
    await deleteEntireApp(name, force);
    return;
  }
  
  // Validate app type
  const validTypes = ['api', 'web'];
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid app type: ${type}`);
    console.log('Valid types: api, web');
    process.exit(1);
  }
  
  await deleteSingleApp(name, type, force, false);
}

/**
 * Delete entire app (all types)
 */
async function deleteEntireApp(name, force) {
  displayEntireAppDeletionWarning(name);
  
  // Require force flag
  requireForceFlag(force, 'deletion');
  
  const appDir = getAppPath(name);
  
  if (!pathExists(appDir)) {
    console.error(`❌ Error: App does not exist at ${appDir}`);
    process.exit(1);
  }
  
  // Delete both api and web if they exist
  await deleteSingleApp(name, 'api', force, true);
  await deleteSingleApp(name, 'web', force, true);
  
  // Delete parent directory
  try {
    await deleteDirectory(appDir);
    console.log(`\n📁 Deleted app directory: apps/${name}/`);
  } catch (error) {
    // Already deleted or doesn't exist
  }
  
  console.log('\n✅ Entire app deleted successfully!');
}

/**
 * Delete single app type
 */
async function deleteSingleApp(name, type, force, skipConfirm = false) {
  const targetDir = getAppPath(name, type);

  if (!skipConfirm) {
    displayDeletionWarning(name, type);
    requireForceFlag(force, 'deletion');
  }

  // Check if app exists
  const exists = checkAppExistsForDeletion(targetDir, skipConfirm);
  if (!exists && skipConfirm) {
    console.log(`⚠️  ${type} app doesn't exist, skipping...\n`);
    return;
  }

  try {
    // Notify about stopping servers
    console.log('🛑 Stopping any running servers...');
    console.log('   (Please ensure dev server is stopped manually if running)\n');

    // Delete app directory
    console.log(`📁 Deleting directory: apps/${name}/${type}/`);
    await deleteDirectory(targetDir);
    console.log('✅ Directory deleted\n');

    // Check if parent directory is empty and delete it
    const appDir = getAppPath(name);
    const apiExists = pathExists(join(appDir, 'api'));
    const webExists = pathExists(join(appDir, 'web'));
    
    if (!apiExists && !webExists && pathExists(appDir)) {
      await deleteDirectory(appDir);
      console.log(`📁 Deleted empty parent directory: apps/${name}/\n`);
    }

    // Remove scripts from root package.json
    console.log('🧹 Cleaning up root package.json scripts...');
    await removeRootScripts(name, type);

    // Clean pnpm workspace cache
    await cleanWorkspaceCache();

    // Display success
    displayDeletionSuccess(name, type);

  } catch (error) {
    console.error('\n❌ Error deleting app:', error.message);
    process.exit(1);
  }
}
