/**
 * Pilot-test Server
 * Extends BaseServer from framework with database support
 */

import { BaseServer, Facade } from 'vasuzex';
import guruorm from 'guruorm';
const { Capsule } = guruorm;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PilotTestServer - Extends BaseServer
 */
class PilotTestServer extends BaseServer {
  constructor() {
    // Get project root (2 levels up from apps/{name}/{type})
    const projectRoot = path.resolve(process.cwd(), '../..');
    
    super({
      appName: process.env.APP_NAME || 'pilot-test-api',
      projectRoot: projectRoot
    });
    
    this.db = null;
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    // Add your custom config validations here
    super.validateConfig();
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    try {
      // Use root config (centralized)
      const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/pilot-test_db';
      
      // Create capsule instance (GuruORM)
      const capsule = new Capsule();
      
      // Add PostgreSQL connection
      capsule.addConnection({
        driver: 'pgsql',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        database: process.env.POSTGRES_DB || 'pilot-test_db',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        charset: 'utf8',
        prefix: '',
        schema: 'public',
      });
      
      // Make capsule globally available
      capsule.setAsGlobal();
      capsule.bootEloquent();
      
      // Get DB connection for Facade
      this.db = capsule.connection();
      
      // Register DB in a simple container object for Facade
      const container = {
        make: (name) => {
          if (name === 'db') return this.db;
          throw new Error(`Service ${name} not found`);
        },
        has: (name) => name === 'db'
      };
      
      // Set facade application
      Facade.setFacadeApplication(container);
      
      console.log('[Pilot-testAPI] 🗄️  Database connected');
    } catch (error) {
      console.error('[Pilot-testAPI] ❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Initialize pilot-test-specific services
   */
  async initializeServices() {
    // Initialize database first
    await this.initializeDatabase();
    
    // Initialize your other services here
    // Example: await initializeStorageService();
    console.log('[Pilot-testAPI] 📦 Services initialized');
  }

  /**
   * Create Express app
   */
  async createApp() {
    const { createApp } = await import('./app.js');
    return createApp();
  }
}

// Start the server
const server = new PilotTestServer();
server.start();
