/**
 * Integration Tests for Project Generator
 * Tests create-vasuzex command and template generation
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../../.test-tmp');

describe('Project Generator', () => {
  beforeAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Media Server Generation', () => {
    test('should generate media server with correct structure', () => {
      const templatePath = path.join(__dirname, '../../framework/Console/Commands/utils/mediaServerTemplates.js');
      expect(fs.existsSync(templatePath)).toBe(true);
      
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      // Check for correct route pattern
      expect(content).toContain("router.get('/{*path}',");
      expect(content).not.toContain("router.get('/*',");
      expect(content).not.toContain("router.get('/:path(*)',");
      
      // Check for correct param handling
      expect(content).toContain('Array.isArray(req.params.path)');
      expect(content).not.toContain('req.params[0]');
    });
  });

  describe('Template Generation', () => {
    test('should have up-to-date dependencies', () => {
      const createScript = path.join(__dirname, '../../bin/create-vasuzex.js');
      const content = fs.readFileSync(createScript, 'utf-8');
      
      // Check ESLint version - use regex for flexible matching
      expect(content).toMatch(/eslint:\s*['"]\^9\.17\.0['"]/);
      expect(content).not.toMatch(/eslint:\s*['"]\^8\./);
      
      // Check eslint-config-prettier version - use regex
      expect(content).toMatch(/['"]eslint-config-prettier['"]:\s*['"]\^10\.0\.1['"]/);
      expect(content).not.toMatch(/['"]eslint-config-prettier['"]:\s*['"]\^9\./);
    });
  });

  describe('Package.json Generation', () => {
    test('should use latest non-deprecated dependency versions', () => {
      const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const createScript = fs.readFileSync('bin/create-vasuzex.js', 'utf-8');
      
      // Check critical dependencies have same versions
      const eslintVersion = rootPkg.devDependencies['eslint'];
      const prettierConfigVersion = rootPkg.devDependencies['eslint-config-prettier'];
      
      // Verify they're not deprecated
      expect(eslintVersion).toMatch(/^\^9\./);
      expect(prettierConfigVersion).toMatch(/^\^10\./);
      
      // Verify create script contains these versions (flexible regex)
      expect(createScript).toMatch(/eslint:\s*['"]\^9\./);
      expect(createScript).toMatch(/eslint-config-prettier['"]:\s*['"]\^10\./);
    });
  });
});
