/**
 * Package Manager Utilities
 * Handle package.json operations and dependency management
 */

import { join } from 'path';
import { pathExists, readJsonFile, writeJsonFile, getProjectRoot } from './fileOperations.js';

/**
 * Detect vasuzex dependency version
 * - For apps in user projects: use same version as root package.json
 * - For local dev of vasuzex itself: use file: path
 * - For published package: use ^1.0.6
 */
export async function detectVasuzexDependency(appDir = null) {
  // If we're in a user project (has vasuzex as dependency)
  const projectRoot = getProjectRoot();
  const rootPkgPath = join(projectRoot, 'package.json');
  
  if (pathExists(rootPkgPath)) {
    try {
      const rootPkg = await readJsonFile(rootPkgPath);
      const vasuzexValue = rootPkg.dependencies?.vasuzex;
      
      // If root already has vasuzex, apps should use same reference
      if (vasuzexValue) {
        if (vasuzexValue.startsWith('file:')) {
          // User project links to vasuzex via file: - apps should use same
          return vasuzexValue;
        }
        if (vasuzexValue.match(/^\^?\d+\.\d+\.\d+/)) {
          // Published version - return exact same value
          return vasuzexValue;
        }
        // Don't return workspace:* - it breaks fresh installs
        // Fall through to default
      }
    } catch (error) {
      // Ignore errors, fall through to default
    }
  }
  
  // Default: use published version (V2)
  return '^2.0.0';
}

/**
 * Create package.json for app (V2 - Minimal, uses hoisted dependencies)
 */
export async function createAppPackageJson(appName, appType, targetDir, framework = null) {
  const packageJson = {
    name: `${appName}-${appType}`,
    version: '1.0.0',
    description: `${appName} ${appType} application`,
    type: 'module',
    private: true,
    scripts: {}
  };
  
  // API-specific configuration (scripts only - uses hoisted dependencies)
  if (appType === 'api') {
    packageJson.scripts = {
      dev: 'nodemon src/index.js',
      start: 'node src/index.js',
    };
  }
  
  // Web-specific configuration (scripts only - uses hoisted dependencies)
  if (appType === 'web') {
    packageJson.scripts = {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    };
  }
  
  await writeJsonFile(join(targetDir, 'package.json'), packageJson);
  
  console.log('\n💡 App uses hoisted dependencies from root node_modules');
  console.log('   No need to install packages individually!');
}

/**
 * Create package.json for media server (V2 - Minimal, uses hoisted dependencies)
 */
export async function createMediaServerPackageJson(targetDir) {
  const packageJson = {
    name: '@vasuzex/media-server',
    version: '1.0.0',
    description: 'Centralized media server for dynamic thumbnail generation',
    type: 'module',
    private: true,
    scripts: {
      dev: 'nodemon src/index.js',
      start: 'node src/index.js',
    }
  };
  
  await writeJsonFile(join(targetDir, 'package.json'), packageJson);
  
  console.log('\n💡 Media server uses hoisted dependencies from root node_modules');
  console.log('   No need to install packages individually!');
}

/**
 * Add scripts to root package.json
 */
export async function addRootScripts(appName, appType) {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    
    const devScriptName = `dev:${appName}-${appType}`;
    const startScriptName = `start:${appName}-${appType}`;
    const filterName = `${appName}-${appType}`;
    
    const scriptsAdded = [];
    
    if (!rootPkg.scripts[devScriptName]) {
      rootPkg.scripts[devScriptName] = `turbo run dev --filter=${filterName}`;
      scriptsAdded.push(`pnpm ${devScriptName}`);
    }
    
    if (!rootPkg.scripts[startScriptName]) {
      rootPkg.scripts[startScriptName] = `turbo run start --filter=${filterName}`;
      scriptsAdded.push(`pnpm ${startScriptName}`);
    }
    
    // Update combined dev/start scripts to run all apps
    updateCombinedScripts(rootPkg);
    
    if (scriptsAdded.length > 0) {
      await writeJsonFile(rootPkgPath, rootPkg);
      console.log(`\n✅ Added scripts: ${scriptsAdded.join(', ')}`);
    }
  } catch (error) {
    console.log('\n⚠️  Could not add scripts to root package.json');
  }
}

/**
 * Remove scripts from root package.json
 */
export async function removeRootScripts(appName, appType) {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    
    const devScriptName = `dev:${appName}-${appType}`;
    const startScriptName = `start:${appName}-${appType}`;
    
    const scriptsRemoved = [];
    
    if (rootPkg.scripts[devScriptName]) {
      delete rootPkg.scripts[devScriptName];
      scriptsRemoved.push(devScriptName);
    }
    
    if (rootPkg.scripts[startScriptName]) {
      delete rootPkg.scripts[startScriptName];
      scriptsRemoved.push(startScriptName);
    }
    
    if (scriptsRemoved.length > 0) {
      await writeJsonFile(rootPkgPath, rootPkg);
      console.log(`✅ Removed scripts: ${scriptsRemoved.join(', ')}\n`);
    } else {
      console.log('   No scripts found to remove\n');
    }
  } catch (error) {
    console.log('⚠️  Could not cleanup root package.json\n');
  }
}

/**
 * Add media server scripts to root package.json
 */
export async function addMediaServerScripts() {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    
    rootPkg.scripts['dev:media-server'] = 'turbo run dev --filter=@vasuzex/media-server';
    rootPkg.scripts['start:media-server'] = 'turbo run start --filter=@vasuzex/media-server';
    
    // Update combined dev/start scripts to run all apps
    updateCombinedScripts(rootPkg);
    
    await writeJsonFile(rootPkgPath, rootPkg);
    console.log('✅ Added scripts: pnpm dev:media-server, pnpm start:media-server');
  } catch (error) {
    console.log('⚠️  Could not add media server scripts to root package.json');
  }
}

/**
 * Update combined dev/start scripts to run all available apps
 */
function updateCombinedScripts(rootPkg) {
  // Find all dev:* and start:* scripts (excluding the combined ones)
  const devScripts = Object.keys(rootPkg.scripts || {})
    .filter(key => key.startsWith('dev:') && key !== 'dev');
  const startScripts = Object.keys(rootPkg.scripts || {})
    .filter(key => key.startsWith('start:') && key !== 'start');
  
  // Create combined scripts that run all apps in parallel
  if (devScripts.length > 0) {
    rootPkg.scripts['dev'] = `turbo run dev`;
  }
  
  if (startScripts.length > 0) {
    rootPkg.scripts['start'] = `turbo run start`;
  }
}
