export async function up(db) {
  await db.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.string('author', 100).notNullable();
    table.enum('status', ['draft', 'published']).default('draft');
    table.timestamp('published_at').nullable();
    table.boolean('is_deleted').default(false);
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    
    table.index('status');
    table.index('author');
  });
  
  console.log('✅ Created posts table');
}

export async function down(db) {
  await db.schema.dropTableIfExists('posts');
  console.log('✅ Dropped posts table');
}
