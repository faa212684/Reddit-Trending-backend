exports.up = function (knex) {
    return knex.schema.table('SYMBOL', function (table) {
        table.string('type');
    });
};

exports.down = function (knex) {
    return knex.schema.table('SYMBOL', function (table) {
        table.dropColumn('type');
    });
};
