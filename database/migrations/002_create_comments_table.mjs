export async function up(db) {
  await db.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.integer('post_id').unsigned().notNullable();
    table.string('author', 100).notNullable();
    table.text('content').notNullable();
    table.boolean('is_deleted').default(false);
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    
    table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.index('post_id');
  });
  
  console.log('✅ Created comments table');
}

export async function down(db) {
  await db.schema.dropTableIfExists('comments');
  console.log('✅ Dropped comments table');
}
