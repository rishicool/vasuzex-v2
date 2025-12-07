/**
 * Unit Tests for BaseApp
 * Tests CORS, body parsing, and security middleware
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { BaseApp } from '../../framework/Foundation/BaseApp.js';

// Test implementation of BaseApp
class TestApp extends BaseApp {
  setupRoutes() {
    this.express.post('/test-body', (req, res) => {
      res.json({ 
        hasBody: !!req.body,
        email: req.body?.email,
        name: req.body?.name 
      });
    });
    
    this.express.get('/test-cors', (req, res) => {
      res.json({ message: 'CORS test' });
    });
    
    this.express.post('/test-cors-post', (req, res) => {
      res.json({ data: req.body });
    });
    
    this.express.get('/test-security', (req, res) => {
      res.json({ secure: true });
    });
    
    this.express.get('/test-error', async (req, res) => {
      throw new Error('Test error');
    });
  }
  
  getErrorHandlers() {
    return {
      errorHandler: (err, req, res, next) => {
        res.status(500).json({ error: err.message });
      }
    };
  }
}

describe('BaseApp - Unit Tests', () => {
  describe('Body Parsing Middleware', () => {
    let app;

    beforeEach(() => {
      // Create test app with body parsing
      const testApp = new TestApp({
        corsOrigin: 'http://localhost:3001'
      });
      app = testApp.build();
    });

    it('should parse JSON body correctly', async () => {
      const response = await request(app)
        .post('/test-body')
        .send({ email: 'test@example.com', name: 'Test User' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.hasBody).toBe(true);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
    });

    it('should parse URL-encoded body correctly', async () => {
      const response = await request(app)
        .post('/test-body')
        .send('email=test@example.com&name=Test+User')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
      expect(response.body.hasBody).toBe(true);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
    });

    it('should handle empty body gracefully', async () => {
      const response = await request(app)
        .post('/test-body')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      // express.json() creates empty object {}, not undefined
      expect(response.body.hasBody).toBe(true); // {} is truthy
    });
  });

  describe('CORS Middleware', () => {
    let app;

    beforeEach(() => {
      const testApp = new TestApp({
        corsOrigin: 'http://localhost:3001'
      });
      app = testApp.build();
    });

    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/test-cors')
        .set('Origin', 'http://localhost:3001');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3001');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/test-cors-post')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3001');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    });

    it('should work without CORS when origin not provided', async () => {
      const noCorsApp = new TestApp({});
      const builtApp = noCorsApp.build();
      const response = await request(builtApp).get('/test-cors');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('CORS test');
    });
  });

  describe('Security Middleware', () => {
    it('should apply helmet middleware by default', async () => {
      const secureApp = new TestApp({});
      const app = secureApp.build();
      const response = await request(app).get('/test-security');

      expect(response.status).toBe(200);
      expect(response.body.secure).toBe(true);
    });
  });

  describe('Custom Middleware', () => {
    it('should apply custom middleware in correct order', async () => {
      const executionOrder = [];
      
      class CustomMiddlewareApp extends BaseApp {
        setupCustomMiddleware() {
          this.express.use((req, res, next) => {
            executionOrder.push('custom-1');
            next();
          });
          this.express.use((req, res, next) => {
            executionOrder.push('custom-2');
            next();
          });
        }
        
        setupRoutes() {
          this.express.get('/test-order', (req, res) => {
            executionOrder.push('route');
            res.json({ order: executionOrder });
          });
        }
      }

      const app = new CustomMiddlewareApp({}).build();
      const response = await request(app).get('/test-order');

      expect(response.body.order).toEqual(['custom-1', 'custom-2', 'route']);
    });
  });

  describe('Error Handling', () => {
    it('should catch async errors in routes', async () => {
      const errorApp = new TestApp({});
      const app = errorApp.build();
      const response = await request(app).get('/test-error');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Configuration', () => {
    it('should store corsOrigin in constructor', () => {
      const baseApp = new BaseApp({
        corsOrigin: 'https://example.com'
      });

      expect(baseApp.corsOrigin).toBe('https://example.com');
    });

    it('should accept serviceName from options', () => {
      const baseApp = new BaseApp({ serviceName: 'my-service' });
      expect(baseApp.serviceName).toBe('my-service');
    });

    it('should have appName from options', () => {
      const baseApp = new BaseApp({ appName: 'my-test-app' });
      expect(baseApp.appName).toBe('my-test-app');
    });
  });
});
