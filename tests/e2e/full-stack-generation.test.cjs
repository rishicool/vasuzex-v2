/**
 * E2E Tests for Full Stack Generation
 */

const fs = require('fs');

describe('E2E: Full Stack Project Generation', () => {
  describe('Media Server Startup', () => {
    test('should have error handling in templates', () => {
      const mediaServerTemplate = fs.readFileSync(
        'framework/Console/Commands/utils/mediaServerTemplates.js',
        'utf-8'
      );

      // Check the entire file for error handling patterns
      expect(mediaServerTemplate).toMatch(/catch\s*\(\s*error\s*\)/);
      expect(mediaServerTemplate).toContain('try {');
      
      // Validate proper array handling for path params  
      expect(mediaServerTemplate).toContain('Array.isArray(req.params.path)');
      expect(mediaServerTemplate).toMatch(/req\.params\.path\.join/); // Flexible - don't check quotes
    });

    test('should have correct route definitions', () => {
      const routesTemplate = fs.readFileSync(
        'framework/Console/Commands/utils/mediaServerTemplates.js',
        'utf-8'
      );

      // Should use correct wildcard pattern
      expect(routesTemplate).toContain("router.get('/{*path}',");
      
      // Should not use deprecated patterns
      expect(routesTemplate).not.toContain("router.get('/*',");
      expect(routesTemplate).not.toContain("router.get('/:path(*)',");
      expect(routesTemplate).not.toContain("router.get('/:path*',");
    });
  });

  describe('Dependency Versions', () => {
    test('should not include deprecated packages', () => {
      const createScript = fs.readFileSync('bin/create-vasuzex.js', 'utf-8');

      // Should use ESLint 9.x
      expect(createScript).toMatch(/eslint:\s*['"]\^9\./);
      expect(createScript).not.toMatch(/eslint:\s*['"]\^8\./);

      // Should use latest eslint-config-prettier
      expect(createScript).toMatch(/eslint-config-prettier['"]:\s*['"]\^10\./);
    });
  });
});
