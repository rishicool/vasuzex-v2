/**
 * GuruORM Database Commands
 * Proxy commands to GuruORM CLI
 */

import { spawn, execSync } from 'child_process';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { join } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

/**
 * Generate GuruORM config from framework config
 */
function generateGuruORMConfig() {
  const configPath = resolve(process.cwd(), 'config', 'database.cjs');
  
  if (!existsSync(configPath)) {
    throw new Error('Database config not found at config/database.cjs');
  }

  const dbConfig = require(configPath);
  
  // Map Laravel config to GuruORM format
  const connections = {};
  for (const [name, config] of Object.entries(dbConfig.connections)) {
    // Map connection name: postgresql -> pgsql
    const connName = name === 'postgresql' ? 'pgsql' : name;
    
    connections[connName] = {
      driver: config.driver === 'postgresql' ? 'pgsql' : config.driver,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      charset: config.charset || 'utf8',
      prefix: config.prefix || '',
      schema: config.schema || 'public',
    };
  }

  // Map default connection name
  const defaultConn = dbConfig.default === 'postgresql' ? 'pgsql' : dbConfig.default;

  const guruConfig = {
    default: defaultConn,
    connections,
    migrations: {
      table: dbConfig.migrations || 'migrations',
      path: resolve(process.cwd(), 'database', 'migrations'),
    },
    seeders: {
      path: resolve(process.cwd(), 'database', 'seeders'),
    },
  };

  // Write temporary config for GuruORM
  const tempConfigPath = resolve(process.cwd(), 'guruorm.config.cjs');
  writeFileSync(
    tempConfigPath,
    `module.exports = ${JSON.stringify(guruConfig, null, 2)};`
  );

  return tempConfigPath;
}

/**
 * Clean up temporary GuruORM config
 */
function cleanupGuruORMConfig() {
  const tempConfigPath = resolve(process.cwd(), 'guruorm.config.cjs');
  if (existsSync(tempConfigPath)) {
    unlinkSync(tempConfigPath);
  }
}

/**
 * Run GuruORM command
 */
export function runGuruORMCommand(command, args = []) {
  // Generate temporary config from framework config
  const configPath = generateGuruORMConfig();
  
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['guruorm', command, ...args], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      // Cleanup temporary config
      cleanupGuruORMConfig();
      
      if (code !== 0) {
        reject(new Error(`GuruORM command failed with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      cleanupGuruORMConfig();
      reject(err);
    });
  });
}

/**
 * Create database if not exists
 */
export async function createDatabase() {
  const dbName = process.env.POSTGRES_DB || 'vasuzex_dev';
  const dbUser = process.env.POSTGRES_USER || 'postgres';
  const dbHost = process.env.POSTGRES_HOST || 'localhost';
  const dbPort = process.env.POSTGRES_PORT || 5432;
  
  try {
    console.log(`📦 Creating database: ${dbName}...`);
    
    // Try to create database using psql
    execSync(
      `PGPASSWORD="${process.env.POSTGRES_PASSWORD}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -tc "SELECT 1 FROM pg_database WHERE datname = '${dbName}'" | grep -q 1 || PGPASSWORD="${process.env.POSTGRES_PASSWORD}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -c "CREATE DATABASE ${dbName}"`,
      { stdio: 'inherit' }
    );
    
    console.log(`✅ Database ${dbName} ready!\n`);
  } catch (error) {
    console.log(`⚠️  Could not create database automatically. Please create it manually:`);
    console.log(`   CREATE DATABASE ${dbName};\n`);
  }
}

/**
 * Database migrate command
 */
export async function dbMigrate(options = {}) {
  console.log('🔄 Running database migrations...\n');
  
  try {
    await createDatabase();
    await runGuruORMCommand('migrate');
    console.log('\n✅ Migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Database migrate status command
 */
export async function dbMigrateStatus(options = {}) {
  console.log('📊 Checking migration status...\n');
  
  try {
    await runGuruORMCommand('migrate:status');
  } catch (error) {
    console.error('\n❌ Failed to check migration status:', error.message);
    process.exit(1);
  }
}

/**
 * Database rollback command
 */
export async function dbRollback(options = {}) {
  const steps = options.step || 1;
  console.log(`⏮️  Rolling back ${steps} migration(s)...\n`);
  
  try {
    await runGuruORMCommand('migrate:rollback', ['--step', steps]);
    console.log('\n✅ Rollback completed successfully!');
  } catch (error) {
    console.error('\n❌ Rollback failed:', error.message);
    process.exit(1);
  }
}

/**
 * Database seed command
 */
export async function dbSeed(options = {}) {
  const seeder = options.class;
  
  console.log(seeder ? `🌱 Running seeder: ${seeder}...\n` : '🌱 Running all seeders...\n');
  
  try {
    const args = seeder ? ['--class', seeder] : [];
    await runGuruORMCommand('db:seed', args);
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

/**
 * Database fresh command (drop all tables and re-run migrations)
 */
export async function dbFresh(options = {}) {
  console.log('🔄 Dropping all tables and re-running migrations...\n');
  
  try {
    await runGuruORMCommand('migrate:fresh');
    
    if (options.seed) {
      console.log('\n🌱 Seeding database...\n');
      await runGuruORMCommand('db:seed');
    }
    
    console.log('\n✅ Database refreshed successfully!');
  } catch (error) {
    console.error('\n❌ Fresh migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Make migration command
 */
export async function makeMigration(name, options = {}) {
  if (!name) {
    console.error('❌ Migration name is required');
    console.log('Usage: framework make:migration <name>');
    process.exit(1);
  }
  
  console.log(`📝 Creating migration: ${name}...\n`);
  
  try {
    await runGuruORMCommand('make:migration', [name]);
    console.log('\n✅ Migration created successfully!');
  } catch (error) {
    console.error('\n❌ Failed to create migration:', error.message);
    process.exit(1);
  }
}

/**
 * Make seeder command
 */
export async function makeSeeder(name, options = {}) {
  if (!name) {
    console.error('❌ Seeder name is required');
    console.log('Usage: framework make:seeder <name>');
    process.exit(1);
  }
  
  console.log(`📝 Creating seeder: ${name}...\n`);
  
  try {
    await runGuruORMCommand('make:seeder', [name]);
    console.log('\n✅ Seeder created successfully!');
  } catch (error) {
    console.error('\n❌ Failed to create seeder:', error.message);
    process.exit(1);
  }
}

/**
 * Make model command
 */
export async function makeModel(name, options = {}) {
  if (!name) {
    console.error('❌ Model name is required');
    console.log('Usage: framework make:model <name>');
    process.exit(1);
  }
  
  console.log(`📝 Creating model: ${name}...\n`);
  
  try {
    const args = [name];
    
    if (options.migration) {
      args.push('--migration');
    }
    
    await runGuruORMCommand('make:model', args);
    console.log('\n✅ Model created successfully!');
  } catch (error) {
    console.error('\n❌ Failed to create model:', error.message);
    process.exit(1);
  }
}
