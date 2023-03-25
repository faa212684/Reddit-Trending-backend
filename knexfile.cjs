require('dotenv').config();

module.exports = {
    development: {
        client: 'oracledb',
        connection: {
            connectString: process.env.CONNNETSTRING,
            database: process.env.DATABASE,
            user: process.env.DATABASEUSER,
            password: process.env.DATABASEPASS
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: `${__dirname}/db/migrations`
        },
        fetchAsString: []
    }
};
