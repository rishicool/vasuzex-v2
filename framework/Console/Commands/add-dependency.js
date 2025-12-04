/**
 * Add Dependency Command
 * Add dependency to root and workspace apps
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

export async function addDependency(packages, options) {
  const isDev = options.dev || false;
  const isWorkspace = options.workspace || false;
  
  // Filter out option flags from packages
  const packageList = packages.filter(pkg => !pkg.startsWith('--'));
  
  if (!packageList || packageList.length === 0) {
    console.error('❌ Please specify package(s) to install');
    console.log('Usage: pnpm framework -- add:dep <package> [--dev] [--workspace]');
    process.exit(1);
  }

  const packagesStr = packageList.join(' ');
  
  console.log(`\n📦 Adding ${isDev ? 'dev ' : ''}dependencies: ${packagesStr}\n`);

  try {
    // Add to root
    const rootFlag = isDev ? '-D' : '';
    const rootCmd = `pnpm add -w ${rootFlag} ${packagesStr}`.trim();
    
    console.log('📍 Installing in root workspace...');
    execSync(rootCmd, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log('✅ Root installation complete\n');

    // Add to workspace apps if --workspace flag
    if (isWorkspace) {
      const appsDir = join(process.cwd(), 'apps');
      
      if (!existsSync(appsDir)) {
        console.log('⚠️  No apps directory found');
        return;
      }

      // Find all apps
      const apps = findAllApps(appsDir);
      
      if (apps.length === 0) {
        console.log('⚠️  No apps found in workspace');
        return;
      }

      console.log(`📦 Installing in ${apps.length} workspace app(s)...\n`);
      
      for (const appPath of apps) {
        const relPath = appPath.replace(process.cwd() + '/', '');
        console.log(`  → ${relPath}`);
        
        try {
          execSync(rootCmd, {
            cwd: appPath,
            stdio: 'pipe',
          });
        } catch (error) {
          console.log(`  ⚠️  Failed to install in ${relPath}`);
        }
      }
      
      console.log('\n✅ Workspace installation complete\n');
    }

    console.log('✅ Done!\n');
  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    process.exit(1);
  }
}

/**
 * Find all apps with package.json
 */
function findAllApps(dir, apps = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    if (item === 'node_modules') continue;
    
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Check if has package.json
      if (existsSync(join(fullPath, 'package.json'))) {
        apps.push(fullPath);
      } else {
        // Recurse
        findAllApps(fullPath, apps);
      }
    }
  }
  
  return apps;
}
