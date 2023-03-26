import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Symbol } from '../services/symbol';
import SymbolService from '../services/symbol';
import symbolDict from '../variable/symbolDict.json' assert { type: 'json' };
import { ThreadController } from '../services';
import type { ThreadState } from '../services';
import ThreadStateController from './threadState';
import { parseToMidnight } from '../lib/timeFormat';
import TagController from './tag';

@Injectable
export default class SymbolController {
    @Inject(SymbolService)
    private readonly symbolService: SymbolService;

    @Inject(TagController)
    private readonly tagController: TagController;

    @Inject(ThreadStateController)
    private readonly threadStateController: ThreadStateController;

    @GET('/symbol')
    getAllSymbol(obj: QueryParams) {
        return this.symbolService.get();
    }

    //@RequestAuth
    @POST('/symbol')
    saveSymbols(req: Request) {
        let symbols = req.body;
        return this.symbolService.insert(symbols);
    }

    //@RequestAuth
    @PUT('/symbol')
    updateSymbols(req: Request) {
        let symbol = { ...req.body };
        return this.symbolService.update(symbol);
    }

    //@RequestAuth
    @DELETE('/symbol')
    deleteSymbol(req: Request) {
        let symbol = { ...req.body };
        //Log(symbol)
        return this.symbolService.delete(symbol);
    }

    @GET('/symbol/day')
    async getDailySymbol(req: Request): Promise<Symbol[]> {
        const date = req.query.date as string;
        const start = parseToMidnight(date);

        const stockMap = {};
        const cryptoMap: Record<string, Symbol> = {};
        const threadStates = await this.threadStateController.getDailybyDateRange(start);
        const titleMap = {};
        //Log(threadStates.length)
        for (const threadState of threadStates) {
            const { id, title } = threadState;
            if (!titleMap[id]) {
                const [stockArr, cryptoArr, otherArr, verbArr] = await this.tagController.getSymbol(
                    title.replace('&amp;', '&')
                );
                //Log(stockArr.length,cryptoArr.length)
                for (const stock of stockArr) {
                    if (!stockMap[stock])
                        stockMap[stock] = { symbol: stock, created: start, threads: [], verb: [], type: 'stock' };
                    stockMap[stock].threads = [...new Set([...stockMap[stock].threads, id])];
                    stockMap[stock].verb = [...new Set([...stockMap[stock].verb, ...verbArr])];
                }
                for (const crypto of cryptoArr) {
                    if (!cryptoMap[crypto])
                        cryptoMap[crypto] = { symbol: crypto, created: start, threads: [], verb: [], type: 'crypto' };
                    cryptoMap[crypto].threads = [...new Set([...cryptoMap[crypto].threads, id])];
                    cryptoMap[crypto].verb = [...new Set([...cryptoMap[crypto].verb, ...verbArr])];
                }
                titleMap[id] = true;
            }
        }

        return [...(Object.values(stockMap) as Symbol[]), ...(Object.values(cryptoMap) as Symbol[])]; //.filter(x=>x.threads.length>3).map(x=>x.symbol)
    }

    @GET('/symbol/day/insert')
    async handleDailySymbol(req: Request) {
        const symbols = await this.getDailySymbol(req);
        Log(symbols.length);
        return this.symbolService.insert(symbols);
    }
}
