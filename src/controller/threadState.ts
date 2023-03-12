import Log from 'log4fns';
import { Request } from 'express';
import { Cache, GET, Inject, Injectable, POST, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import symbol from '../lib/symbol';
import RedisCache from '../services/redisCache';
import type { DetailThreadState } from '../services/threadState';
import ThreadStateService from '../services/threadState';

enum CACHE {
    COUNT = '/count/threadState',
    LASTEST_TIME = '/count/latest',
    SYMBOL = '/thread/one',
    PAGE = '/state/page',
    LASTEST_ALL = '/state/lastest',
    DATE_RANGE = '/state/all',
    VOTE = '/state/vote',
    COMMENT = '/state/comment',
    DISTRIBUTION = '/state/distribution'
}

@Injectable
export default class ThreadStateController {
    @Inject(ThreadStateService, 'threadStateService')
    private readonly threadStateService: ThreadStateService;

    @Inject(RedisCache, 'cacheService')
    private readonly cacheService: RedisCache;

    static readonly symbol: Set<string> = new Set(symbol);

    constructor() {
        //this.symbol = new Set(symbol);
    }

    @Cache(CACHE.COUNT, false)
    @GET('/count/threadState')
    getCount() {
        return this.threadStateService.count();
    }

    @Cache(CACHE.LASTEST_TIME, false)
    @GET('/count/latest')
    getLastestUpdated() {
        return this.threadStateService.lastestUpdated();
    }

    @Cache(CACHE.SYMBOL)
    @GET('/thread/one')
    getThreadsStatBySymbol(obj: QueryParams) {
        return this.threadStateService.bySymbol(obj);
    }

    @Cache(CACHE.LASTEST_ALL)
    @GET('/state/lastest')
    getLastestStateOfAll(obj: QueryParams) {
        return this.threadStateService.lastestOfAll(obj);
    }

    @Cache(CACHE.DATE_RANGE)
    @GET('/state/all')
    getStateByDateRange(obj: QueryParams) {
        return this.threadStateService.byDateRange(obj);
    }

    @GET('/state/all_test')
    async getStateByDateRange_test(obj: QueryParams) {
        const result = await this.getStateByDateRange(obj);
        const key = Object.keys(result[0]);
        const value = result.map(r => Object.values(r));
        return { key, value };
    }

    @Cache(CACHE.PAGE)
    @GET('/state/page')
    getStateByPage(obj: QueryParams) {
        return this.threadStateService.byPage(obj);
    }

    @Cache(CACHE.VOTE)
    @GET('/state/vote')
    getStateOnVote(obj: QueryParams) {
        //Log(obj);
        return this.threadStateService.vote(obj);
    }

    @Cache(CACHE.COMMENT)
    @GET('/state/comment')
    getStateOnComment(obj: QueryParams) {
        return this.threadStateService.comment(obj);
    }

    /* @Cache(CACHE.DISTRIBUTION)
    @ParseQueryParams
    @GET('/state/distribution')
    async getSymbolDistribution(obj: QueryParams) {
        return this.threadStateService.vote(obj).then((lasestStatus: any) => {
            const result: Object = {}; //{[key: string]: any}

            lasestStatus
                .map((thread: any) => ({
                    title: thread.title,
                    forum: thread.forum
                })) //.replace(/[^A-Za-z0-9 ]/g, "")
                .forEach((thread: any) => {
                    thread.title.split(' ').forEach((id: string) => {
                        if (ThreadStateController.symbol.has(id)) {
                            if (!result[id]) result[id] = { id: id, total: 0, forum: {} };
                            if (!result[id].forum[thread.forum]) result[id].forum[thread.forum] = 0;
                            result[id].total++;
                            result[id].forum[thread.forum]++;
                            //result[id][thread.forum] = result[id][thread.forum] + 1 || 1;
                        }
                    });
                });
            return Object.values(result);
        });
    } */

    @RequestAuth
    @POST('/threadsStat')
    saveThreadsStat(req: Request) {
        let payload = req.body.thread;
        if (typeof payload == 'string') payload = JSON.parse(payload);
        const threadsState: DetailThreadState[] = payload.map((x: DetailThreadState) => ({
            ...x,
            updated: new Date(x.updated)
        }));
        return this.threadStateService.saveThreadsStat(threadsState);
    }
}
