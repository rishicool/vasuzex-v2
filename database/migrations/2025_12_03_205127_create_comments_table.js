import { Schema } from 'guruorm';

export default class CreateCommentsTable {
  async up() {
    await Schema.create('comments', (table) => {
      table.id();
      table.timestamps();
    });
  }

  async down() {
    await Schema.dropIfExists('comments');
  }
}
