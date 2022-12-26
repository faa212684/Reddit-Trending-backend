import { Request } from 'express';
import { DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import JSONThreadService from '../services/thread_json';

enum CACHE {
    ALL_THREAD = 'JSON_ALL_THREAD'
}

@Injectable
export default class JSONThreadController {
    @Inject(JSONThreadService)
    private readonly jsonThreadService: JSONThreadService;

    @GET('/threads/json')
    getAll(obj: QueryParams) {
        return this.jsonThreadService.all();
    }

    @ParseQueryParams
    @GET('/threads/json/one')
    getThreadsStatBySymbol(obj: QueryParams) {
        return this.jsonThreadService.getById(obj);
    }

    @ParseQueryParams
    @POST('/threads/json')
    saveThreads(req: Request) {
        let threads = req.body.thread;
        //if (typeof threads == 'string') threads = JSON.parse(threads);
        return this.jsonThreadService.saveThreads(threads);
    }

    @ParseQueryParams
    @PUT('/threads/json')
    updateThread(req: Request) {
        let threads = req.body.thread;
        //if (typeof threads == 'string') threads = JSON.parse(threads);
        return this.jsonThreadService.updateThread(threads);
    }

    @ParseQueryParams
    @DELETE('/threads/json')
    deleteThread(req: Request) {
        let thread = req.body.thread;
        //if (typeof threads == 'string') threads = JSON.parse(threads);
        const { id, ...rest } = thread;
        return this.jsonThreadService.deleteThread(id);
    }
}
