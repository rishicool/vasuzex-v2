import { Schema } from 'guruorm';

export default class CreateUsersTable {
  async up() {
    await Schema.create('users', (table) => {
      table.id();
      table.string('name');
      table.string('email');
      table.string('password');
      table.timestamps();
    });
  }

  async down() {
    await Schema.dropIfExists('users');
  }
}
