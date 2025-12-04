import { Application } from './Application.js';

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
    this.middlewareSetup = false;
    this.routesSetup = false;
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

    // Boot all registered service providers
    for (const provider of this.providers) {
      if (typeof provider.boot === 'function') {
        await provider.boot();
      }
    }

    this.booted = true;
  }
}

