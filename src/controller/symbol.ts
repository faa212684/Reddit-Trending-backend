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
        //if (typeof symbols == 'string') symbols = JSON.parse(symbols);
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
    async getDailySymbol(req: Request) {
        const date = req.query.date as string;
        const start = parseToMidnight(date);

        const result = [];
        const symbolMap = {}
        const threadStates = await this.threadStateController.getDailybyDateRange(start);
        const threadStateMap = {}; // { [date] : [id1,id2,id3] }
        const titleMap = new Map<string, string[][]>(); // {[id] : [[symbol],[verb]] }
        for (const threadState of threadStates.slice(0,100)) {
            const { id, title } = threadState;
            //const date = parseToMidnight(updated);
            //if (!threadStateMap[`${date}`]) threadStateMap[`${date}`] = new Set();
            //threadStateMap[`${date}`].add(id);
            if (!titleMap.has(id)) {
                const [symbolArr, other, verbArr] = await this.tagController.getSymbol(title);
                //titleMap.set(id, [symbol, verb]);
                for (const symbol of symbolArr){
                    if (!symbolMap[symbol])symbolMap[symbol] = [symbol,start,[],[]]
                    symbolMap[symbol][2] = [...new Set([...symbolMap[symbol][2],id])]
                    symbolMap[symbol][3] = [...new Set([...symbolMap[symbol][3],...verbArr])]
                }                
            }
        }

        return Object.values(symbolMap)
    }
}
