/**
 * BaseServer - Base class for server bootstrap
 * Handles server initialization and lifecycle
 */
export class BaseServer {
  constructor(options = {}) {
    this.options = options;
    this.appName = options.appName || 'app';
    this.projectRoot = options.projectRoot || process.cwd();
    this.port = options.port || process.env.APP_PORT || 3000;
    this.app = null;
    this.server = null;
  }

  /**
   * Validate configuration (override in subclass)
   */
  validateConfig() {
    // Override in subclass for custom validations
  }

  /**
   * Initialize services (override in subclass)
   */
  async initializeServices() {
    // Override in subclass to initialize custom services
  }

  /**
   * Create Express app (must be implemented by subclass)
   */
  async createApp() {
    throw new Error('createApp() must be implemented by subclass');
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Validate configuration
      this.validateConfig();

      // Initialize services
      await this.initializeServices();

      // Create app using subclass method
      this.app = await this.createApp();
      
      // Get Express instance (handle both BaseApp and plain Express)
      const express = this.app.getExpress ? this.app.getExpress() : this.app;
      
      return new Promise((resolve) => {
        this.server = express.listen(this.port, () => {
          console.log(`🚀 ${this.appName} running on http://localhost:${this.port}`);
          resolve(this.server);
        });
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('Server stopped');
          resolve();
        });
      });
    }
  }

  /**
   * Get server instance
   */
  getServer() {
    return this.server;
  }

  /**
   * Get app instance
   */
  getApp() {
    return this.app;
  }
}

