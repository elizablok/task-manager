export const up = (knex) => (
  knex.schema.createTable('tasks_labels', (table) => {
    table.increments('id').primary();

    table
      .integer('task_id')
      .unsigned()
      .index()
      .references('tasks.id')
      .onDelete('CASCADE');

    table
      .integer('label_id')
      .unsigned()
      .index()
      .references('labels.id')
      .onDelete('CASCADE');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('tasks_labels');
