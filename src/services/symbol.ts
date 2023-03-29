import { Inject, Injectable } from '../lib/decorators';
import { DATABASE } from './constant';
import Database from './database';
import { parseToMidnight } from '../lib/timeFormat';
import Log from 'log4fns';

export interface Symbol {
    _id?: string;
    symbol: string;
    created: Date;
    threads: string[] | string;
    counter?: number;
    verb: string | string[];
    type: string;
    vote: number;
    comment: number;
}

function replaceSpecialCharacters(str: string): string {
    const regex = /[^a-zA-Z0-9,\s]/g; // Matches any character that is not a letter, number, comma, or whitespace
    return str.replace(regex, '');
}

@Injectable
export default class SymbolService {
    @Inject(Database)
    private readonly db: Database;

    constructor() {}

    async test() {
        return await this.db
            .knex('THREAD_STAT as ts')
            .join('SYMBOL as s', this.db.knex.raw(`INSTR(',' || s.threads || ',', ',' || ts.id || ',') > 0`))
            .select('ts.id', 'ts.vote', 's.symbol');
    }

    async get(start: Date, end: Date, type: string): Promise<Symbol[]> {
        return this.db.knex
            .select('*')
            .from(DATABASE.SYMBOL)
            .whereBetween('created', [start, end])
            .andWhere('type', '=', type)
            .orderBy('created', 'desc');
    }

    async insert(symbols: Symbol[]): Promise<any[]> {
        const symbolWhere = [];
        const symbolObj = new Map<string, Symbol>();
        for (const symbol of symbols) {
            if (typeof symbol.created == 'string') symbol.created = parseToMidnight(new Date(symbol.created));
            if (!Array.isArray(symbol.threads)) {
                symbol.threads = replaceSpecialCharacters(symbol.threads).split(',');
            }
            if (!Array.isArray(symbol.verb)) {
                symbol.verb = replaceSpecialCharacters(symbol.verb).split(',');
            }
            if (typeof symbol.vote === 'string') symbol.vote = parseInt(symbol.vote) || 0;
            if (typeof symbol.comment === 'string') symbol.vote = parseInt(symbol.comment) || 0;

            symbolWhere.push([symbol.symbol, symbol.created]);
            symbolObj.set(`${symbol.symbol}${symbol.created}`, symbol);
        }

        //Log([...symbolObj.keys()]);
        const existingSymbols = await this.db
            .knex(DATABASE.SYMBOL)
            .select('*')
            .whereIn(['symbol', 'created'], symbolWhere);

        let success = [];
        let result = [];
        /*         console.log('symbolWhere', symbolWhere);
        console.log('ExistingSymbol', existingSymbols);
        console.log('symbolObj', ...symbolObj.values()); */
        for (const oriSymbol of existingSymbols) {
            const { symbol, created, verb, threads } = oriSymbol;
            const key = `${symbol}${created}`;
            //Log(key);
            if (symbolObj.has(key)) {
                try {
                    const newSymbol = symbolObj.get(key);

                    oriSymbol.verb = verb
                        ? [...new Set([...verb.split(','), ...newSymbol.verb])].join(',')
                        : (newSymbol.verb as any).join(',');
                    oriSymbol.threads = threads
                        ? [...new Set([...threads.split(','), ...newSymbol.threads])]
                        : newSymbol.threads;
                    oriSymbol.counter = oriSymbol.threads.length;
                    oriSymbol.threads = oriSymbol.threads.join(',');
                    oriSymbol.vote = Math.max(oriSymbol.vote, newSymbol.vote);
                    oriSymbol.comment = Math.max(oriSymbol.vote, newSymbol.comment);
                    //Log('Updateing ', oriSymbol);
                    await this.db
                        .knex(DATABASE.SYMBOL)
                        .where({ symbol, created })
                        .update(oriSymbol)
                        .then(_ => {
                            success.push(key);
                            symbolObj.delete(key);
                        })
                        .catch(err => console.log(err));
                } catch (e) {
                    console.log(e);
                }
            }
        }

        const notExistSymbols = [...symbolObj.values()].map(symbol => ({
            ...symbol,
            counter: typeof symbol.threads === 'string' ? symbol.threads.split(',').length : symbol.threads.length,
            threads: typeof symbol.threads === 'string' ? symbol.threads : symbol.threads.join(','),
            verb: typeof symbol.verb === 'string' ? symbol.verb : symbol.verb.join(',')
        }));
        for (let i = 0; i < notExistSymbols.length; i += 200) {
            const batch = notExistSymbols.slice(i, i + 200);
            result = await this.db.knex(DATABASE.SYMBOL).insert(batch).returning(['symbol', 'created']);
            success = [...success, ...result];
        }

        return success;
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
