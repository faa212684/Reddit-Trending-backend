import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Thread } from '../services/thread';
import CommentService from '../services/comment';
//import symbolDict from '../variable/symbolDict.json' assert { type: 'json' };

@Injectable
export default class ThreadController {
    @Inject(CommentService)
    private readonly commentService: CommentService;
    @Inject(RedisCache)
    private readonly cacheService: RedisCache;

    @POST('/comment')
    saveComment(req: Request) {
        let comments = req.body.comments;
        comments.forEach(x => (x.created = new Date(x.created)));
        return this.commentService.insert(comments);
    }
}
