/**
 * Centralized Database Export
 * Single database connection for entire monorepo
 * All apps use this - NO per-app DB connections!
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Capsule } from 'guruorm';

// Load environment variables from root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

// Create singleton capsule instance
const capsule = new Capsule();

// Add PostgreSQL connection using environment variables
capsule.addConnection({
  driver: 'pgsql',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'vasuzex_dev',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  charset: 'utf8',
  prefix: '',
  schema: 'public',
});

// Make capsule globally available for models
capsule.setAsGlobal();
capsule.bootEloquent();

// Get database connection for query builder
const DB = capsule.connection();

// Query builder helper
export const query = (table) => DB.table(table);

// Export DB connection
export { DB };

// Export all models (named exports)
export { User } from './models/User.js';

// Default export
export default DB;
