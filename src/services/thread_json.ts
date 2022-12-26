import { Inject, Injectable } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import DatabaseJSON from './database_json';
//import Log from 'log4fns'
import Log from 'log4fns';
import { ThreadModel } from './database_json';
import TagService from './tagService';
import { Thread } from './thread';
@Injectable
export default class JSONThreadService {
    @Inject(DatabaseJSON)
    private readonly db: DatabaseJSON;

    @Inject(TagService)
    private readonly tagService: TagService;

    async all(): Promise<any> {
        return ThreadModel.find();
    }

    async getById({ id }: QueryParams): Promise<any> {
        Log('id', id);
        return ThreadModel.findById(id).exec();
    }

    async saveThreads(threads: Thread[]): Promise<any> {
        threads = await Promise.all(
            threads.map(async thread => {
                return {
                    ...thread,
                    tags: await this.tagService.getTag(thread.title, true)
                };
            })
        );
    }

    async updateThread(thread: Thread) {
        const { id, ...rest } = thread;
        return ThreadModel.findOneAndUpdate({ id: id }, rest, { new: true });
    }

    async deleteThread({ id }: { id: string }) {
        return ThreadModel.deleteOne({ _id: id });
    }
}
