import express from 'express';
import { Application } from './Application.js';
import { applySecurityMiddleware } from '../Http/Middleware/SecurityMiddleware.js';
import { LogServiceProvider } from '../Services/Log/LogServiceProvider.js';
import { HashServiceProvider } from './Providers/HashServiceProvider.js';
import { ValidationServiceProvider } from './Providers/ValidationServiceProvider.js';
import { EncryptionServiceProvider } from './Providers/EncryptionServiceProvider.js';
import { StorageServiceProvider } from '../Services/Storage/StorageServiceProvider.js';

/**
 * BaseApp - Base class for application-level apps (Express apps)
 * Provides core application functionality for API and Web apps
 */
export class BaseApp extends Application {
  constructor(options = {}) {
    const rootDir = options.rootDir || options.projectRoot;
    super(rootDir);
    
    // App-level configuration
    this.serviceName = options.serviceName || options.appName || 'app';
    this.appName = options.appName;
    this.appType = options.appType;
    this.corsOrigin = options.corsOrigin; // Store CORS origin for security middleware
    this.middlewareSetup = false;
    this.routesSetup = false;
    this.securitySetup = false;
    
    // Register core service providers automatically
    this.registerCoreServiceProviders();
  }
  
  /**
   * Register core framework service providers
   * These are registered automatically for all apps
   */
  registerCoreServiceProviders() {
    // Core services that every app needs
    this.register(LogServiceProvider);
    this.register(HashServiceProvider);
    this.register(ValidationServiceProvider);
    this.register(EncryptionServiceProvider);
    this.register(StorageServiceProvider);
  }

  /**
   * Set app metadata
   */
  setAppInfo(name, type) {
    this.appName = name;
    this.appType = type;
    return this;
  }

  /**
   * Build the Express application
   * This method orchestrates the app setup
   */
  build() {
    // Setup security middleware (should be first)
    if (!this.securitySetup) {
      this.setupSecurityMiddleware();
      this.securitySetup = true;
    }

    // Setup core body parsing middleware (required for API)
    this.setupBodyParsing();

    // Setup custom middleware
    if (!this.middlewareSetup) {
      this.setupCustomMiddleware();
      this.middlewareSetup = true;
    }

    // Setup routes
    if (!this.routesSetup) {
      this.setupRoutes();
      this.routesSetup = true;
    }

    // Setup error handlers (must be last)
    const errorHandlers = this.getErrorHandlers();
    if (errorHandlers) {
      if (errorHandlers.notFoundHandler) {
        this.express.use(errorHandlers.notFoundHandler);
      }
      if (errorHandlers.errorHandler) {
        this.express.use(errorHandlers.errorHandler);
      }
    }

    return this.express;
  }

  /**
   * Setup security middleware
   * Applies Helmet, CORS, CSRF, and custom security headers
   */
  setupSecurityMiddleware() {
    try {
      // Get security configuration (may not exist in test environment)
      let securityConfig = this.has('config') ? this.config('security', {}) : {};
      
      // If no config exists but corsOrigin is provided, create minimal CORS config
      if (this.corsOrigin && (!securityConfig || Object.keys(securityConfig).length === 0)) {
        securityConfig = {
          helmet: false, // Disable helmet if no config
          cors: {
            origin: this.corsOrigin,
            credentials: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Device-ID'],
            exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
            maxAge: 86400,
            preflightContinue: false,
            optionsSuccessStatus: 204
          },
          csrf: { enabled: false } // Disable CSRF by default for API
        };
      } else if (this.corsOrigin && securityConfig.cors) {
        // Override CORS origin if config exists
        securityConfig.cors = {
          ...securityConfig.cors,
          origin: this.corsOrigin
        };
      }
      
      // Only apply if configuration exists and not explicitly disabled
      if (securityConfig && Object.keys(securityConfig).length > 0) {
        applySecurityMiddleware(this.express, securityConfig);
      }
    } catch (error) {
      // Silently skip if config not available (e.g., in tests)
      // This is expected behavior when app is not bootstrapped
    }
  }

  /**
   * Setup body parsing middleware
   * Core middleware for parsing JSON and URL-encoded request bodies
   */
  setupBodyParsing() {
    // Parse JSON request bodies
    this.express.use(express.json());
    
    // Parse URL-encoded request bodies (forms)
    this.express.use(express.urlencoded({ extended: true }));
  }

  /**
   * Register a route
   */
  registerRoute(path, router) {
    this.express.use(path, router);
  }

  /**
   * Setup custom middleware (override in subclass)
   * Called before routes are registered
   */
  setupCustomMiddleware() {
    // Override in subclass to add custom middleware
  }

  /**
   * Setup routes (override in subclass)
   * Called after middleware, before error handlers
   */
  setupRoutes() {
    // Override in subclass to register routes
  }

  /**
   * Get error handlers (override in subclass)
   * Should return { notFoundHandler, errorHandler }
   */
  getErrorHandlers() {
    return null;
  }

  /**
   * Get Express instance for middleware and routing
   */
  getExpress() {
    return this.express;
  }

  /**
   * Boot the application
   */
  async boot() {
    if (this.booted) return;

    // Bootstrap application first
    if (!this.bootstrapped) {
      await this.bootstrap();
    }

    // Register phase - call register() on all service providers
    for (const provider of this.providers) {
      if (typeof provider.register === 'function') {
        await provider.register();
      }
    }

    // Boot phase - call boot() on all service providers
    for (const provider of this.providers) {
      if (typeof provider.boot === 'function') {
        await provider.boot();
      }
    }

    this.booted = true;
  }
}

