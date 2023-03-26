exports.up = function (knex) {
    return knex.schema.createTable('SYMBOL', function (table) {
        table.string('symbol').notNullable();
        table.date('created').notNullable();
        table.string('threads');
        table.integer('counter');
        table.string('verb');
        table.primary(['symbol', 'created']);
        //table.primary(['symbol']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('SYMBOL');
};
