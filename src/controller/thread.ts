import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Thread } from '../services/thread';
import ThreadService from '../services/thread';
import symbolDict from '../variable/symbolDict.json' assert { type: 'json' };

enum CACHE {
    ALL_THREAD = '/thread',
    COUNT = '/count/thread',
    FORUMS = '/count/forum',
    DISTRIBUTION = '/state/distribution',
    BY_PAGE = '/thread/page'
}

/**
 * A controller class for handling requests related to threads.
 * @decorator {Injectable} - This class can be injected as a dependency.
 */
@Injectable
export default class ThreadController {
    @Inject(ThreadService)
    private readonly threadService: ThreadService;
    @Inject(RedisCache)
    private readonly cacheService: RedisCache;

    /**
     * A route handler for an HTTP GET request to the '/thread' endpoint. Retrieves and returns all threads from a database or other data source based on the specified query parameters. The response will be cached using the ALL_THREAD cache.
     * @param {QueryParams} obj - An object representing a set of query parameters.
     * @returns {any} The return value of the `all` method of the `threadService` instance.
     * @decorator {Cache} - Indicates that the response of this route will be cached using the `ALL_THREAD` cache.
     * @decorator {GET} - Indicates that this function is a route handler for an HTTP GET request.
     */
    @Cache(CACHE.ALL_THREAD)
    @GET('/thread')
    getAllThread(obj: QueryParams) {
        return this.threadService.all(obj);
    }

    /**
     * A route handler for an HTTP GET request to the '/thread/page' endpoint. Retrieves and returns a thread or threads from a database or other data source based on the specified page number and other query parameters. The response will be cached using the BY_PAGE cache.
     * @param {QueryParams} obj - An object representing a set of query parameters.
     * @returns {any} The return value of the `byPage` method of the `threadService` instance.
     * @decorator {Cache} - Indicates that the response of this route will be cached using the `BY_PAGE` cache.
     * @decorator {GET} - Indicates that this function is a route handler for an HTTP GET request.
     */
    @Cache(CACHE.BY_PAGE)
    @GET('/thread/page')
    getThreadByPage(obj: QueryParams) {
        return this.threadService.byPage(obj);
    }

    @Cache(CACHE.COUNT, false)
    @GET('/count/thread')
    getCount() {
        return this.threadService.count();
    }

    @Cache(CACHE.FORUMS)
    @GET('/count/forum')
    getForums() {
        //{"limit":"6000","minVote":"10","minComment":"10","dateRange":"1"}
        return this.threadService.forums();
    }

    @RequestAuth
    @POST('/threads')
    saveThreads(req: Request) {
        let threads = req.body.thread;
        if (typeof threads == 'string') threads = JSON.parse(threads);
        return this.threadService.saveThreads(threads);
    }

    @RequestAuth
    @PUT('/threads')
    updateThreads(req: Request) {
        const col = ['id', 'title', 'forum', 'created', 'author', 'isDailyDiscussion'];
        let thread = { ...req.body };
        //Log(thread)
        return this.threadService.updateThread(thread);
    }

    @RequestAuth
    @DELETE('/threads')
    deleteThread(req: Request) {
        const col = ['id', 'title', 'forum', 'created', 'author', 'isDailyDiscussion'];
        const { id, ...rest } = req.body;
        //Log(thread)
        return this.threadService.deleteThread(id);
    }

    @Cache(CACHE.DISTRIBUTION)
    @GET('/state/distribution') //{"limit":"6000","minVote":"10","minComment":"10","dateRange":"1"}
    async getSymbolDistribution(obj: QueryParams) {
        return this.getAllThread(obj).then((threads: Thread[]) => {
            const result: Object = {}; //{[key: string]: any}
            //console.log(Array(threads[0].tags))
            for (const { tags, forum, title } of threads) {
                //Log(tags)
                //JSON.parse(<string>tags).forEach(tag => {
                Object.values(JSON.parse(<string>tags))
                    .flat()
                    .forEach((tag: string) => {
                        if (!result[tag]) result[tag] = { id: tag, total: 0, forum: {}, data: [] };
                        if (!result[tag].forum[forum]) result[tag].forum[forum] = 0;
                        result[tag].total++;
                        result[tag].forum[forum]++;
                        result[tag].data.push(title);
                    });
            }
            return Object.values(result).filter(r => r.total > 2);
        });
    }

    @ParseQueryParams
    @GET('/thread/tag')
    async getTags(obj: QueryParams) {
        const time = {};
        const threads = await this.getAllThread(obj);
        threads.forEach((thread: Thread) => {
            let { created, tags } = thread;
            const _created = created.toString();
            tags = Object.values(JSON.parse(tags as string)).flat() as string[];
            if (!time[_created]) time[_created] = {};
            tags.forEach((tag: string) => {
                if (!time[_created][tag]) time[_created][tag] = 0;
                time[_created][tag]++;
            });
        });
        return time;
    }

    @ParseQueryParams
    @GET('/thread/tag/symbol')
    async getSymbolTags(obj: QueryParams) {
        const dict = {};
        const threads = await this.getAllThread({ ...obj, dateRange: 3 });
        threads.forEach((thread: Thread) => {
            const tags = Object.values(JSON.parse(thread.tags as string)).flat() as string[];
            //const tags = thread.title.toLocaleLowerCase().split(' ');
            tags.forEach((tag: string) => {
                if (symbolDict[tag]) {
                    if (!dict[symbolDict[tag]]) dict[symbolDict[tag]] = 0;
                    dict[symbolDict[tag]]++;
                }
            });
        });
        return dict;
    }
}
