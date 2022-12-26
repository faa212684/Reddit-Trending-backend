import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Thread } from '../services/thread';
import ThreadService from '../services/thread';

enum CACHE {
    ALL_THREAD = '/thread',
    COUNT = '/count/thread',
    FORUMS = '/count/forum',
    DISTRIBUTION = '/state/distribution',
    BY_PAGE = '/thread/page'
}

@Injectable
export default class ThreadController {
    @Inject(ThreadService)
    private readonly threadService: ThreadService;
    @Inject(RedisCache)
    private readonly cacheService: RedisCache;

    @Cache(CACHE.ALL_THREAD) //{"limit":"6000","minVote":"10","minComment":"10","dateRange":"1"}
    @GET('/thread')
    getAllThread(obj: QueryParams) {
        return this.threadService.all(obj);
    }

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
}
