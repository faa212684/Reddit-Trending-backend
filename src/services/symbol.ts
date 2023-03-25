import { Inject, Injectable } from '../lib/decorators';
import { DATABASE } from './constant';
import Database from './database';
import { parseToMidnight } from '../lib/timeFormat';

export interface Symbol {
    _id?: string;
    symbol: string;
    created: Date;
    threads: string;
    counter: number;
    verb: string;
}

@Injectable
export default class SymbolService {
    @Inject(Database)
    private readonly db: Database;

    constructor() {}

    async get(): Promise<Symbol[]> {
        return this.db.knex.select('*').from(DATABASE.SYMBOL).orderBy('created', 'desc');
    }

    async insert(symbols: Symbol[]): Promise<any[]> {
        const symbolWhere = [];
        const symbolObj = new Map<string, Symbol>();
        for (const symbol of symbols){
            if (typeof symbol.created == 'string') symbol.created = parseToMidnight(new Date(symbol.created));
            //if (typeof symbol.counter == 'string') symbol.counter = parseInt(symbol.counter);
            if (Array.isArray(symbol.threads)) {
                symbol.counter = symbol.threads.length
                symbol.threads = symbol.threads.join(',');
            }else{
                symbol.counter = symbol.threads.split(",").length
            }

            if (Array.isArray(symbol.verb)) symbol.verb = symbol.verb.join(',');

            symbolWhere.push([symbol.symbol, symbol.created]);
            symbolObj.set(`${symbol.symbol}${symbol.created}`, symbol);
        }


        const existingSymbols = await this.db
            .knex(DATABASE.SYMBOL)
            .select('*')
            .whereIn(['symbol', 'created'], symbolWhere);

        const success = [];
        let result = [];
/*         console.log('symbolWhere', symbolWhere);
        console.log('ExistingSymbol', existingSymbols);
        console.log('symbolObj', ...symbolObj.values()); */
        for (const oriSymbol of existingSymbols) {
            const { symbol, created, verb, threads } = oriSymbol;
            const key = `${symbol}${created}`;

            if (symbolObj.has(key)) {
                const newSymbol = symbolObj.get(key);
                
                oriSymbol.verb = [...new Set([...verb.split(','), ...newSymbol.verb.split(',')])].join(',');
                oriSymbol.threads = [...new Set([...threads.split(','), ...newSymbol.threads.split(',')])]
                oriSymbol.counter = oriSymbol.threads.length
                oriSymbol.threads  = oriSymbol.threads.join(',');
                console.log('Updateing ', oriSymbol);
                await this.db
                    .knex(DATABASE.SYMBOL)
                    .where({ symbol, created })
                    .update(oriSymbol)
                    .then(_ => {
                        success.push(key);
                        symbolObj.delete(key);
                    })
                    .catch(err => console.log(err));
            }
        }

        const notExistSymbols = [...symbolObj.values()];
        if (notExistSymbols.length > 0) {
            result = await this.db.knex(DATABASE.SYMBOL).insert(notExistSymbols).returning(['symbol', 'created']);
        }

        return success.concat(result);
        /* const binds = {
            symbol: symbol.symbol,
            created: new Date(),
            threads: symbol.threads,
            counter: symbol.counter,
            verb: symbol.verb
        };
        console.log(binds) */

        /*  await this.db.knex(DATABASE.SYMBOL).insert({
            symbol: symbol.symbol,
            created: symbol.created,
            threads: symbol.threads,
            counter: symbol.counter,
            verb: symbol.verb
        });*/
    }
    async update(symbol: Symbol): Promise<void> {
        return this.db
            .knex(DATABASE.SYMBOL)
            .where({ symbol: symbol.symbol, created: symbol.created })
            .update({
                threads: JSON.stringify(symbol.threads),
                counter: symbol.counter,
                verb: JSON.stringify(symbol.verb)
            });
    }

    async delete(symbol: Symbol): Promise<void> {
        await this.db.knex(DATABASE.SYMBOL).where({ symbol: symbol.symbol, created: symbol.created }).delete();
    }
}
