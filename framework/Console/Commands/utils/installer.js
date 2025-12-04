/**
 * Installation Utilities
 * Handle dependency installation and cleanup
 */

import { execSync } from 'child_process';
import { getProjectRoot } from './fileOperations.js';

/**
 * Install dependencies using pnpm
 * Handles both root-level and workspace installations
 */
export async function installDependencies(silent = false) {
  console.log('📦 Installing dependencies...\n');
  
  try {
    const projectRoot = getProjectRoot();
    
    // First install at root level (updates workspace)
    execSync('pnpm install', {
      cwd: projectRoot,
      stdio: silent ? 'pipe' : 'inherit',
    });
    
    console.log('\n✅ Dependencies installed!\n');
    return true;
  } catch (error) {
    console.log('\n⚠️  Failed to install dependencies. Run manually:\n');
    console.log('  pnpm install\n');
    return false;
  }
}

/**
 * Install dependencies for a specific app
 * This ensures app-level dependencies are available
 */
export async function installAppDependencies(appDir, silent = false) {
  try {
    // Install at project root to resolve workspace
    const projectRoot = getProjectRoot();
    execSync('pnpm install', {
      cwd: projectRoot,
      stdio: silent ? 'pipe' : 'inherit',
    });
    return true;
  } catch (error) {
    console.error('Failed to install app dependencies:', error.message);
    return false;
  }
}

/**
 * Clean workspace cache after app deletion
 */
export async function cleanWorkspaceCache() {
  console.log('🧹 Cleaning workspace cache...');
  
  try {
    execSync('pnpm install', {
      cwd: getProjectRoot(),
      stdio: 'pipe',
    });
    
    console.log('✅ Workspace cache cleaned\n');
    return true;
  } catch (error) {
    console.log('⚠️  Run `pnpm install` manually to clean workspace\n');
    return false;
  }
}
