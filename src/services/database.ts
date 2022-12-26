import 'dotenv/config';
import Knex from 'knex';
import Log from 'log4fns';
import oracledb from 'oracledb';
import { Injectable } from '../lib/decorators';

@Injectable
class Database {
    private readonly _knex: any;

    constructor(target: string = 'oracledb') {
        Log(`Initializing ${target} connection`);
        const option = {
            client: target,
            connection: {
                user: process.env.DATABASEUSER,
                password: process.env.DATABASEPASS,
                requestTimeout: 100,
                connectString: process.env.CONNNETSTRING,
                database: process.env.DATABASE,
                typeCast: function (field, next) {
                    Log(field.type);
                    if (field.type == 'CLOB') {
                        return JSON.parse(field.string());
                    }
                    return next();
                }
            },
            fetchAsString: []
        };

        if (target == 'oracledb') {
            oracledb.initOracleClient({
                //configDir: process.env.WALLET,
                libDir: process.env.LD_LIBRARY_PATH
            });
        }

        this._knex = Knex(option);
        Log(`Initialized ${target} connection success`);
    }

    get knex() {
        return this._knex;
    }

    disconnect() {
        this._knex.destroy();
    }
}

export default Database;
