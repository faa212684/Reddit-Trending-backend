import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Tag } from '../services/tagService';
import TagService from '../services/tagService';

@Injectable
export default class TagController {
    @Inject(TagService)
    private readonly tagService: TagService;

    @GET('/tag')
    async getSymbol(title: string /* req: Request */) {
        //const title = req.query.title as string;
        const tags = (await this.tagService.getTag(title)) as Tag;
        const { stock, crypto, other } = await this.tagService.extractSymbols(tags.noun);
        return [stock, crypto, other, tags.verb];
    }
}
