/**
 * Unit Tests for Plop Template Generation
 * Tests the Plop generator, Handlebars helpers, and template loading
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import nodePlop from 'node-plop';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Plop Template Generation - Unit Tests', () => {
  let plop;
  let generator;
  const testOutputDir = path.join(__dirname, '../temp-test-output');

  beforeAll(async () => {
    // Load plopfile
    const plopfilePath = path.join(__dirname, '../../framework/Console/plopfile.js');
    plop = await nodePlop(plopfilePath);
    generator = plop.getGenerator('api-app');
    
    // Clean test output directory
    await fs.remove(testOutputDir);
    await fs.ensureDir(testOutputDir);
  });

  afterAll(async () => {
    // Cleanup
    await fs.remove(testOutputDir);
  });

  describe('Handlebars Helpers', () => {
    it('should have capitalize helper', () => {
      const helpers = plop.getHelperList();
      expect(helpers).toContain('capitalize');
    });

    // Test helpers by invoking them directly
    it('should correctly capitalize strings', () => {
      const helper = plop.getHelper('capitalize');
      expect(helper('blog')).toBe('Blog');
      expect(helper('myShop')).toBe('MyShop');
      expect(helper('test-app')).toBe('Test-app');
    });

    it('should correctly convert to PascalCase', () => {
      const helper = plop.getHelper('pascalCase');
      expect(helper('blog')).toBe('Blog');
      expect(helper('my-shop')).toBe('MyShop');
      expect(helper('test_app')).toBe('TestApp');
      expect(helper('my-cool-app')).toBe('MyCoolApp');
    });

    it('should correctly convert to camelCase', () => {
      const helper = plop.getHelper('camelCase');
      expect(helper('blog')).toBe('blog');
      expect(helper('my-shop')).toBe('myShop');
      expect(helper('test_app')).toBe('testApp');
    });

    it('should correctly convert to kebab-case', () => {
      const helper = plop.getHelper('kebabCase');
      expect(helper('BlogApp')).toBe('blog-app');
      expect(helper('MyShopApp')).toBe('my-shop-app');
    });
  });

  describe('Generator Configuration', () => {
    it('should have api-app generator', () => {
      expect(generator).toBeDefined();
      expect(generator.name).toBe('api-app');
    });

    it('should have description', () => {
      expect(generator.description).toBe('Generate complete API application');
    });

    it('should have no prompts (data comes from code)', () => {
      expect(generator.prompts).toEqual([]);
    });
  });

  describe('Template File Generation', () => {
    let result;

    beforeAll(async () => {
      // Run generator
      result = await generator.runActions({
        destPath: testOutputDir,
        projectName: 'test-project',
        appName: 'blog'
      });
    });

    it('should generate without failures', () => {
      expect(result.failures).toHaveLength(0);
    });

    it('should generate 12 files', () => {
      expect(result.changes).toHaveLength(12);
    });

    it('should create all controller files', async () => {
      const baseController = path.join(testOutputDir, 'src/controllers/BaseController.js');
      const authController = path.join(testOutputDir, 'src/controllers/AuthController.js');
      
      expect(await fs.pathExists(baseController)).toBe(true);
      expect(await fs.pathExists(authController)).toBe(true);
    });

    it('should create all service files', async () => {
      const authService = path.join(testOutputDir, 'src/services/AuthService.js');
      expect(await fs.pathExists(authService)).toBe(true);
    });

    it('should create all middleware files', async () => {
      const authMiddleware = path.join(testOutputDir, 'src/middleware/authMiddleware.js');
      const errorHandler = path.join(testOutputDir, 'src/middleware/errorHandler.js');
      
      expect(await fs.pathExists(authMiddleware)).toBe(true);
      expect(await fs.pathExists(errorHandler)).toBe(true);
    });

    it('should create all route files', async () => {
      const authRoutes = path.join(testOutputDir, 'src/routes/auth.js');
      const indexRoutes = path.join(testOutputDir, 'src/routes/index.js');
      
      expect(await fs.pathExists(authRoutes)).toBe(true);
      expect(await fs.pathExists(indexRoutes)).toBe(true);
    });

    it('should create request validator files', async () => {
      const authRequests = path.join(testOutputDir, 'src/requests/AuthRequests.js');
      expect(await fs.pathExists(authRequests)).toBe(true);
    });

    it('should create helper files', async () => {
      const envHelper = path.join(testOutputDir, 'src/helpers/env.js');
      expect(await fs.pathExists(envHelper)).toBe(true);
    });

    it('should create config files', async () => {
      const dbConfig = path.join(testOutputDir, 'src/config/database.js');
      expect(await fs.pathExists(dbConfig)).toBe(true);
    });

    it('should create main app files', async () => {
      const appFile = path.join(testOutputDir, 'src/app.js');
      const indexFile = path.join(testOutputDir, 'src/index.js');
      
      expect(await fs.pathExists(appFile)).toBe(true);
      expect(await fs.pathExists(indexFile)).toBe(true);
    });
  });

  describe('Template Content Interpolation', () => {
    it('should correctly interpolate projectName in imports', async () => {
      const authService = path.join(testOutputDir, 'src/services/AuthService.js');
      const content = await fs.readFile(authService, 'utf-8');
      
      expect(content).toContain("import { User } from '@test-project/database'");
    });

    it('should correctly interpolate appName in app.js', async () => {
      const appFile = path.join(testOutputDir, 'src/app.js');
      const content = await fs.readFile(appFile, 'utf-8');
      
      expect(content).toContain('Blog API Application');
      expect(content).toContain('class BlogApp extends BaseApp');
      expect(content).toContain("serviceName: process.env.APP_NAME || 'blog-api'");
    });

    it('should correctly interpolate appName in server file', async () => {
      const indexFile = path.join(testOutputDir, 'src/index.js');
      const content = await fs.readFile(indexFile, 'utf-8');
      
      expect(content).toContain('Blog Server');
      expect(content).toContain('class BlogServer extends BaseServer');
    });

    it('should use correct project name in database config', async () => {
      const dbConfig = path.join(testOutputDir, 'src/config/database.js');
      const content = await fs.readFile(dbConfig, 'utf-8');
      
      // Plop substitutes {{projectName}} with actual value
      expect(content).toContain('test-project'); // Should be substituted
    });
  });

  describe('Generated Code Syntax', () => {
    it('should generate valid JavaScript for AuthService', async () => {
      const authService = path.join(testOutputDir, 'src/services/AuthService.js');
      const content = await fs.readFile(authService, 'utf-8');
      
      // Check for proper class structure
      expect(content).toContain('export class AuthService');
      expect(content).toContain('async register(data)');
      expect(content).toContain('async login(email, password)');
      expect(content).toContain('generateToken(user)');
      expect(content).toContain('verifyToken(token)');
    });

    it('should generate valid JavaScript for AuthController', async () => {
      const authController = path.join(testOutputDir, 'src/controllers/AuthController.js');
      const content = await fs.readFile(authController, 'utf-8');
      
      expect(content).toContain('export class AuthController extends BaseController');
      expect(content).toContain('register = async (req, res)');
      expect(content).toContain('login = async (req, res)');
      expect(content).toContain('me = async (req, res)');
      expect(content).toContain('logout = async (req, res)');
    });

    it('should generate valid route definitions', async () => {
      const authRoutes = path.join(testOutputDir, 'src/routes/auth.js');
      const content = await fs.readFile(authRoutes, 'utf-8');
      
      expect(content).toContain('import express from');
      expect(content).toContain('const router = express.Router()');
      expect(content).toContain("router.post('/register'");
      expect(content).toContain("router.post('/login'");
      expect(content).toContain("router.get('/me'");
      expect(content).toContain('export const authRoutes = router');
    });
  });
});
