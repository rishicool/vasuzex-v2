/**
 * CleanupTest API Application
 * Extends BaseApp from framework for clean architecture
 */

import { BaseApp } from 'vasuzex';
import { env } from './helpers/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getAllRoutes } from './routes/index.js';

/**
 * CleanupTestApp - Extends BaseApp
 * Organized and maintainable Express app configuration
 */
class CleanupTestApp extends BaseApp {
  constructor() {
    super({
      serviceName: process.env.APP_NAME || 'cleanup-test-api',
      corsOrigin: env('CORS_ORIGIN', 'http://localhost:3001')
    });
  }

  /**
   * Setup custom middleware (after body parsers, before routes)
   */
  setupCustomMiddleware() {
    // Add your custom middleware here
    // Example: app.use(requestLogger());
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    const routes = getAllRoutes();
    routes.forEach(({ path, router, handler }) => {
      if (handler) {
        this.express.get(path, handler);
      } else if (router) {
        this.registerRoute(path, router);
      }
    });
  }

  /**
   * Get error handlers
   */
  getErrorHandlers() {
    return { errorHandler, notFoundHandler };
  }
}

/**
 * Create and configure the Express app
 */
export function createApp() {
  const app = new CleanupTestApp();
  return app.build();
}
