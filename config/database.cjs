/**
 * Database Configuration
 * 
 * All database connections and settings.
 */

function env(key, defaultValue = null) {
  return process.env[key] !== undefined ? process.env[key] : defaultValue;
}

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Database Connection
  |--------------------------------------------------------------------------
  */
  default: env('DB_CONNECTION', 'postgresql'),

  /*
  |--------------------------------------------------------------------------
  | Database Connections
  |--------------------------------------------------------------------------
  */
  connections: {
    postgresql: {
      driver: 'postgresql',
      host: env('POSTGRES_HOST', 'localhost'),
      port: parseInt(env('POSTGRES_PORT', '5432'), 10),
      database: env('POSTGRES_DB', 'vasuzex_dev'),
      user: env('POSTGRES_USER', 'postgres'),
      password: env('POSTGRES_PASSWORD', ''),
      charset: 'utf8',
      prefix: '',
      schema: 'public',
    },

    mysql: {
      driver: 'mysql',
      host: env('DB_HOST', 'localhost'),
      port: parseInt(env('DB_PORT', '3306'), 10),
      database: env('DB_DATABASE', 'vasuzex'),
      user: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      prefix: '',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Migration Repository Table
  |--------------------------------------------------------------------------
  */
  migrations: 'migrations',

  /*
  |--------------------------------------------------------------------------
  | Redis Connection
  |--------------------------------------------------------------------------
  */
  redis: {
    client: 'ioredis',
    default: {
      host: env('REDIS_HOST', 'localhost'),
      port: parseInt(env('REDIS_PORT', '6379'), 10),
      password: env('REDIS_PASSWORD', null),
      database: 0,
    },
  },
};
