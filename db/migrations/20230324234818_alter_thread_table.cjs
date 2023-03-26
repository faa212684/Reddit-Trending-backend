exports.up = function (knex) {
    return knex.schema.table('THREAD', function (table) {
        table.string('symbol')
    });
};

exports.down = function (knex) {
    return knex.schema.table('THREAD', function (table) {
        table.dropColumn('symbol');
    });
};
