exports.up = function (knex) {
    return knex.schema.table('THREAD', function (table) {
        table.specificType('symbol', 'RAW(100)');
    });
};

exports.down = function (knex) {
    return knex.schema.table('THREAD', function (table) {
        table.dropColumn('symbol');
    });
};
