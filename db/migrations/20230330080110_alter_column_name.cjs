exports.down = function (knex) {
    return Promise.all([
        knex.schema.alterTable('THREAD_STAT', function (table) {
            table.renameColumn('id', 'ID');
            table.renameColumn('vote', 'VOTE');
            table.renameColumn('comment', 'COMMENT');
            table.renameColumn('updated', 'UPDATED');
            table.renameColumn('forum', 'FORUM');
        }),

        knex.schema.alterTable('THREAD', function (table) {
            table.renameColumn('author', 'AUTHOR');
            table.renameColumn('isDailyDiscussion', 'ISDAILYDISCUSSION');
            table.renameColumn('tags', 'TAGS');
            table.renameColumn('symbol', 'SYMBOL');
            table.renameColumn('id', 'ID');
            table.renameColumn('title', 'TITLE');
            table.renameColumn('forum', 'FORUM');
            table.renameColumn('created', 'CREATED');
        })
    ]);
};

exports.up = function (knex) {
    return Promise.all([
        knex.schema.alterTable('THREAD_STAT', function (table) {
            table.renameColumn('ID', 'id');
            table.renameColumn('VOTE', 'vote');
            table.renameColumn('COMMENT', 'comment');
            table.renameColumn('UPDATED', 'updated');
            table.renameColumn('FORUM', 'forum');
        }),

        knex.schema.alterTable('THREAD', function (table) {
            table.renameColumn('AUTHOR', 'author');
            table.renameColumn('ISDAILYDISCUSSION', 'isDailyDiscussion');
            table.renameColumn('TAGS', 'tags');
            table.renameColumn('SYMBOL', 'symbol');
            table.renameColumn('ID', 'id');
            table.renameColumn('TITLE', 'title');
            table.renameColumn('FORUM', 'forum');
            table.renameColumn('CREATED', 'created');
        })
    ]);
};
