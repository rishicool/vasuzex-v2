/**
 * Integration Test - Database & Authentication
 * Tests the complete auth flow with actual database operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_APP_NAME = 'auth-integration-test';
const TEST_APP_DIR = path.join(__dirname, '../../apps', TEST_APP_NAME, 'api');

describe('Integration Test - Database & Authentication', () => {
  let app;
  let testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePassword123!'
  };
  let authToken;

  beforeAll(async () => {
    // Generate fresh API app
    await fs.remove(path.join(__dirname, '../../apps', TEST_APP_NAME));
    
    execSync(`vasuzex generate:app ${TEST_APP_NAME} --type api`, {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe'
    });

    // Update .env with test database
    const envPath = path.join(TEST_APP_DIR, '.env');
    let envContent = await fs.readFile(envPath, 'utf-8');
    envContent = envContent
      .replace(/APP_PORT=3000/, 'APP_PORT=4567')
      .replace(/DB_CONNECTION=postgresql/, 'DB_CONNECTION=sqlite')
      .replace(/DB_DATABASE=.*/, `DB_DATABASE=${TEST_APP_DIR}/test.sqlite`);
    await fs.writeFile(envPath, envContent);

    // Import and build the app
    const appModule = await import(path.join(TEST_APP_DIR, 'src/app.js'));
    const AppClass = appModule[Object.keys(appModule).find(key => key.includes('App'))];
    
    const appInstance = new AppClass({
      rootDir: path.join(__dirname, '../..'),
      corsOrigin: 'http://localhost:3001'
    });
    
    app = appInstance.build();
  }, 120000); // 2 minute timeout for setup

  afterAll(async () => {
    // Cleanup
    await fs.remove(path.join(__dirname, '../../apps', TEST_APP_NAME));
  });

  describe('Health Check', () => {
    it('should respond to health endpoint', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('User Registration', () => {
    it('should register new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password'); // Should be hidden
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/already exists|duplicate/i);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' }) // Missing email and password
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'password123'
        })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('User Login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      
      // Store token for authenticated requests
      authToken = response.body.token;
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-12345');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3001');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3001');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle preflight OPTIONS request', async () => {
      const response = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-methods']).toMatch(/POST/);
      expect(response.headers['access-control-allow-headers']).toMatch(/Content-Type/);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', () => {
      expect(authToken).toBeDefined();
      expect(typeof authToken).toBe('string');
      expect(authToken.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', async () => {
      // Decode JWT (without verification for testing)
      const [, payloadBase64] = authToken.split('.');
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email', testUser.email);
    });
  });

  describe('Password Security', () => {
    it('should not return password in any response', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test User',
          email: 'security@example.com',
          password: 'TestPassword123'
        })
        .set('Content-Type', 'application/json');

      expect(registerResponse.body.user).not.toHaveProperty('password');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'security@example.com',
          password: 'TestPassword123'
        })
        .set('Content-Type', 'application/json');

      expect(loginResponse.body.user).not.toHaveProperty('password');
    });
  });
});
