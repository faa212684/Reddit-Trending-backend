exports.up = function (knex) {
    return knex.schema.table('SYMBOL', function (table) {
        table.integer('vote');
        table.integer('comment');
    });
};

exports.down = function (knex) {
    return knex.schema.table('SYMBOL', function (table) {
        table.dropColumn('vote');
        table.dropColumn('comment');
    });
};
