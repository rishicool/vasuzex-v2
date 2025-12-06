/**
 * Database Configuration
 * Uses environment variables via env() helper
 */

import { env } from '../helpers/env.js';

export default {
  // Database connection URL
  url: env('DATABASE_URL', 'postgresql://user:password@localhost:5432/mydb'),
  
  // Connection pool settings
  pool: {
    min: parseInt(env('DB_POOL_MIN', '2')),
    max: parseInt(env('DB_POOL_MAX', '10'))
  },
  
  // Migrations path
  migrations: {
    directory: './database/migrations'
  },
  
  // Seeds path
  seeds: {
    directory: './database/seeders'
  }
};
