exports.up = function (knex) {
    return knex.schema.createTable('COMMENTS', function (table) {
        table.string('id').primary();
        table.string('type');
        table.string('forum');
        table.integer('score');
        table.string('author');
        table.text('body');
        table.string('parent_comment_id');
        table.timestamp('created');
        table.string('thread_id');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('COMMENTS');
};
