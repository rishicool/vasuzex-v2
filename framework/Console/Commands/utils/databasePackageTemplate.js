/**
 * Database Package Template
 * Creates a workspace package for centralized database models
 */

/**
 * Generate database/package.json
 */
export function generateDatabasePackageJson(projectName) {
  return {
    name: `@${projectName}/database`,
    version: '1.0.0',
    type: 'module',
    main: './index.js',
    exports: {
      '.': './index.js',
      './models/*': './models/*.js'
    }
  };
}
