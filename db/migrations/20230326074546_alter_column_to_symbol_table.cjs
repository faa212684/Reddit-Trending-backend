exports.up = function(knex) {
    return knex.schema.alterTable('SYMBOL', function(table) {
      table.string('threads', 4000).alter();
      table.string('verb', 4000).alter();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('SYMBOL', function(table) {
      table.string('threads').alter();
      table.string('verb').alter();
    });
  };
  