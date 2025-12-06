/**
 * User Seeder
 * Creates demo users for development
 */

import bcrypt from 'bcryptjs';

export default class UserSeeder {
  async run(db) {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 10),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await db.table('users').insert(users);
    console.log('✅ Seeded', users.length, 'users');
  }
}
