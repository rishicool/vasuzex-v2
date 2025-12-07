/**
 * Integration Test - Full API Generation
 * Tests the complete vasuzex generate:app command end-to-end
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_APP_NAME = 'test-gen-api';
const TEST_APP_DIR = path.join(__dirname, '../../apps', TEST_APP_NAME);

describe('Integration Test - Full API Generation', () => {
  beforeAll(async () => {
    // Clean up if exists
    await fs.remove(TEST_APP_DIR);
  });

  afterAll(async () => {
    // Clean up after tests
    await fs.remove(TEST_APP_DIR);
  });

  describe('App Generation', () => {
    it('should successfully generate API app', () => {
      const command = `vasuzex generate:app ${TEST_APP_NAME} --type api`;
      
      expect(() => {
        execSync(command, {
          cwd: path.join(__dirname, '../..'),
          stdio: 'pipe'
        });
      }).not.toThrow();
    });

    it('should create API directory structure', async () => {
      const apiDir = path.join(TEST_APP_DIR, 'api');
      expect(await fs.pathExists(apiDir)).toBe(true);
    });

    it('should create src directory', async () => {
      const srcDir = path.join(TEST_APP_DIR, 'api/src');
      expect(await fs.pathExists(srcDir)).toBe(true);
    });
  });

  describe('Generated Files', () => {
    it('should create 12 source files', async () => {
      const srcDir = path.join(TEST_APP_DIR, 'api/src');
      const files = await fs.readdir(srcDir, { recursive: true });
      const jsFiles = files.filter(f => f.endsWith('.js'));
      
      expect(jsFiles.length).toBe(12);
    });

    it('should create controllers directory with 2 files', async () => {
      const controllersDir = path.join(TEST_APP_DIR, 'api/src/controllers');
      expect(await fs.pathExists(controllersDir)).toBe(true);
      
      const files = await fs.readdir(controllersDir);
      expect(files).toContain('BaseController.js');
      expect(files).toContain('AuthController.js');
    });

    it('should create services directory with AuthService', async () => {
      const servicesDir = path.join(TEST_APP_DIR, 'api/src/services');
      expect(await fs.pathExists(servicesDir)).toBe(true);
      
      const files = await fs.readdir(servicesDir);
      expect(files).toContain('AuthService.js');
    });

    it('should create middleware directory with 2 files', async () => {
      const middlewareDir = path.join(TEST_APP_DIR, 'api/src/middleware');
      expect(await fs.pathExists(middlewareDir)).toBe(true);
      
      const files = await fs.readdir(middlewareDir);
      expect(files).toContain('authMiddleware.js');
      expect(files).toContain('errorHandler.js');
    });

    it('should create routes directory with 2 files', async () => {
      const routesDir = path.join(TEST_APP_DIR, 'api/src/routes');
      expect(await fs.pathExists(routesDir)).toBe(true);
      
      const files = await fs.readdir(routesDir);
      expect(files).toContain('auth.js');
      expect(files).toContain('index.js');
    });

    it('should create requests directory with AuthRequests', async () => {
      const requestsDir = path.join(TEST_APP_DIR, 'api/src/requests');
      expect(await fs.pathExists(requestsDir)).toBe(true);
      
      const files = await fs.readdir(requestsDir);
      expect(files).toContain('AuthRequests.js');
    });

    it('should create helpers directory with env.js', async () => {
      const helpersDir = path.join(TEST_APP_DIR, 'api/src/helpers');
      expect(await fs.pathExists(helpersDir)).toBe(true);
      
      const files = await fs.readdir(helpersDir);
      expect(files).toContain('env.js');
    });

    it('should create config directory with database.js', async () => {
      const configDir = path.join(TEST_APP_DIR, 'api/src/config');
      expect(await fs.pathExists(configDir)).toBe(true);
      
      const files = await fs.readdir(configDir);
      expect(files).toContain('database.js');
    });

    it('should create app.js and index.js in src root', async () => {
      const srcDir = path.join(TEST_APP_DIR, 'api/src');
      const files = await fs.readdir(srcDir);
      
      expect(files).toContain('app.js');
      expect(files).toContain('index.js');
    });

    it('should create package.json', async () => {
      const packageJson = path.join(TEST_APP_DIR, 'api/package.json');
      expect(await fs.pathExists(packageJson)).toBe(true);
    });

    it('should create .env file', async () => {
      const envFile = path.join(TEST_APP_DIR, 'api/.env');
      expect(await fs.pathExists(envFile)).toBe(true);
    });

    it('should create README.md', async () => {
      const readme = path.join(TEST_APP_DIR, 'api/README.md');
      expect(await fs.pathExists(readme)).toBe(true);
    });
  });

  describe('Content Interpolation', () => {
    it('should use correct projectName in imports', async () => {
      const authService = path.join(TEST_APP_DIR, 'api/src/services/AuthService.js');
      const content = await fs.readFile(authService, 'utf-8');
      
      expect(content).toContain("import { User } from '@vasuzex/database'");
    });

    it('should use PascalCase appName for class names', async () => {
      const appFile = path.join(TEST_APP_DIR, 'api/src/app.js');
      const content = await fs.readFile(appFile, 'utf-8');
      
      expect(content).toContain('class TestGenApiApp extends BaseApp');
    });

    it('should capitalize appName in descriptions', async () => {
      const appFile = path.join(TEST_APP_DIR, 'api/src/app.js');
      const content = await fs.readFile(appFile, 'utf-8');
      
      expect(content).toContain('TestGenApi API Application');
    });

    it('should use kebab-case in environment variables', async () => {
      const appFile = path.join(TEST_APP_DIR, 'api/src/app.js');
      const content = await fs.readFile(appFile, 'utf-8');
      
      expect(content).toContain("'test-gen-api");
    });
  });

  describe('Package.json Content', () => {
    it('should have correct name', async () => {
      const packageJson = path.join(TEST_APP_DIR, 'api/package.json');
      const pkg = await fs.readJSON(packageJson);
      
      expect(pkg.name).toBe('test-gen-api');
    });

    it('should have required dependencies', async () => {
      const packageJson = path.join(TEST_APP_DIR, 'api/package.json');
      const pkg = await fs.readJSON(packageJson);
      
      expect(pkg.dependencies).toBeDefined();
      expect(pkg.dependencies).toHaveProperty('express');
      expect(pkg.dependencies).toHaveProperty('bcryptjs');
      expect(pkg.dependencies).toHaveProperty('jsonwebtoken');
      expect(pkg.dependencies).toHaveProperty('joi');
      expect(pkg.dependencies).toHaveProperty('cors');
      expect(pkg.dependencies).toHaveProperty('helmet');
      expect(pkg.dependencies).toHaveProperty('dotenv');
      // vasuzex and @vasuzex/database are hoisted from root workspace
    });

    it('should have dev and start scripts', async () => {
      const packageJson = path.join(TEST_APP_DIR, 'api/package.json');
      const pkg = await fs.readJSON(packageJson);
      
      expect(pkg.scripts).toHaveProperty('dev');
      expect(pkg.scripts).toHaveProperty('start');
    });
  });

  describe('Valid JavaScript Syntax', () => {
    it('should generate syntactically valid AuthService', async () => {
      const authService = path.join(TEST_APP_DIR, 'api/src/services/AuthService.js');
      const content = await fs.readFile(authService, 'utf-8');
      
      // Check for class structure
      expect(content).toMatch(/export class AuthService/);
      expect(content).toMatch(/async register\(data\)/);
      expect(content).toMatch(/async login\(email, password\)/);
      expect(content).toMatch(/generateToken\(user\)/);
    });

    it('should generate syntactically valid AuthController', async () => {
      const authController = path.join(TEST_APP_DIR, 'api/src/controllers/AuthController.js');
      const content = await fs.readFile(authController, 'utf-8');
      
      expect(content).toMatch(/export class AuthController extends BaseController/);
      expect(content).toMatch(/register = async \(req, res\)/);
      expect(content).toMatch(/login = async \(req, res\)/);
      expect(content).toMatch(/me = async \(req, res\)/);
    });

    it('should generate valid route exports', async () => {
      const authRoutes = path.join(TEST_APP_DIR, 'api/src/routes/auth.js');
      const content = await fs.readFile(authRoutes, 'utf-8');
      
      expect(content).toMatch(/import express from/);
      expect(content).toMatch(/const router = express\.Router\(\)/);
      expect(content).toMatch(/router\.post\('\/register'/);
      expect(content).toMatch(/router\.post\('\/login'/);
      expect(content).toMatch(/export const authRoutes = router/);
    });
  });
});
