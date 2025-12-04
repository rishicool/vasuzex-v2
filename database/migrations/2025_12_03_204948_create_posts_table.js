import { Schema } from 'guruorm';

export default class CreatePostsTable {
  async up() {
    await Schema.create('posts', (table) => {
      table.id();
      table.string('name');
      table.timestamps();
    });
  }

  async down() {
    await Schema.dropIfExists('posts');
  }
}
