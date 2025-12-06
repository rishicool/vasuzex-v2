/**
 * User Model
 * Database operations for users table
 */

import { DB } from 'vasuzex';

export class User {
  /**
   * Get query builder for users table
   */
  static query() {
    return DB.table('users');
  }

  /**
   * Create a new user
   */
  static async create(data) {
    const [user] = await DB.table('users').insert({
      name: data.name,
      email: data.email,
      password: data.password,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const user = await DB.table('users')
      .where('email', email)
      .first();

    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const user = await DB.table('users')
      .where('id', id)
      .first();

    return user;
  }

  /**
   * Update user
   */
  static async update(id, data) {
    const [user] = await DB.table('users')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');

    return user;
  }

  /**
   * Delete user
   */
  static async delete(id) {
    await DB.table('users')
      .where('id', id)
      .delete();
  }
}
