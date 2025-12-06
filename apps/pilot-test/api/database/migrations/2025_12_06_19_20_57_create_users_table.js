/**
 * Users Table Migration
 * Creates users table with authentication fields
 */

export const up = async (db) => {
  await db.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).notNullable();
    table.timestamps();
  });
  
  console.log('✅ Users table created');
};

export const down = async (db) => {
  await db.schema.dropTableIfExists('users');
  console.log('✅ Users table dropped');
};
