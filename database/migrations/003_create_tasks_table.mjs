export async function up(db) {
  await db.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.enum('priority', ['low', 'medium', 'high']).default('medium');
    table.enum('status', ['pending', 'completed']).default('pending');
    table.timestamp('due_date').nullable();
    table.timestamp('completed_at').nullable();
    table.boolean('is_deleted').default(false);
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    
    table.index('status');
    table.index('priority');
    table.index('due_date');
  });
  
  console.log('✅ Created tasks table');
}

export async function down(db) {
  await db.schema.dropTableIfExists('tasks');
  console.log('✅ Dropped tasks table');
}
