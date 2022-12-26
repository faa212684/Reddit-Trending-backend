import { Inject, Injectable } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import timeFormat from '../lib/timeFormat';
import { DATABASE } from './constant';
import Database from './database';
import TagService from './tagService';

type Tags = {
    adj: string[];
    noun: string[];
    verb: string[];
};

export interface Thread {
    _id?: string;
    id: string;
    forum: string;
    title: string;
    author: string;
    created: Date | string;
    tags?: string[] | string | Tags;
    isDailyDiscussion: boolean;
    symbol?: string;
}

export function parseThreadFromDB(thread: any): Thread {
    return {
        ...thread,
        tags: JSON.parse(thread.tags),
        isDailyDiscussion: thread.isDailyDiscussion == '1'
    };
}

@Injectable
export default class ThreadService {
    @Inject(Database)
    private readonly db: Database;
    @Inject(TagService)
    private readonly tagService: TagService;

    constructor() {}

    async all({ forum,  dateRange }: QueryParams): Promise<Thread[]> {
        return (
            this.db.knex
                .select('*')
                .from(DATABASE.THREAD)
                //.limit(limit)
                //.where(forum)
                .andWhere('created', '>', new Date(timeFormat(Date.now() - 86400000 * dateRange)))
                .orderBy('created', 'desc')
        );
    }

    async getBySymbol({ id }): Promise<Thread> {
        return this.db.knex.select('*').from(DATABASE.THREAD).where({ id }).first().then(parseThreadFromDB);
    }

    async byPage({ page, pageSize }: QueryParams): Promise<Thread[]> {
        return this.db
            .knex(DATABASE.THREAD)
            .select('*')
            .offset(page * pageSize)
            .limit(pageSize)
            .orderBy('created', 'desc');
    }

    async count(): Promise<number> {
        return this.db
            .knex(DATABASE.THREAD)
            .count('*', { as: 'a' })
            .then((result: any) => result[0].a);
    }

    async forums(): Promise<{ forum: string; count: number }[]> {
        return this.db.knex
            .select('forum', this.db.knex.raw('count(??) as "count"', ['forum']))
            .from(DATABASE.THREAD)
            .groupBy('forum');
    }

    async saveThreads(threads: Thread[]) {
        const ids = [];
        threads = await Promise.all(
            threads.map(async thread => {
                ids.push(thread.id);
                thread.tags = await this.tagService.getTag(thread.title, true);
                //if (Array.isArray(thread.tags)) thread.tags = JSON.stringify(thread.tags);
                if (typeof thread.created == 'string') thread.created = new Date(thread.created);
                return thread;
            })
        );
        /* threads = threads.map(thread => {
            ids.push(thread.id)
            thread.tags = this.tagService.getTag(thread.title)
            //if (Array.isArray(thread.tags)) thread.tags = JSON.stringify(thread.tags);
            if (typeof thread.created == 'string') thread.created = new Date(thread.created);
            return thread;
        }); */
        return this.db
            .knex(DATABASE.THREAD)
            .select('id')
            .whereIn('id', ids)
            .then((rows: Thread[]) => {
                const existIds = new Set(rows.map(x => x.id));
                const threadsNotExist = threads.filter(thread => !existIds.has(thread.id));
                //.map(x => ({ ...x, created: new Date(x.created) }));
                if (threadsNotExist.length) {
                    return this.db.knex(DATABASE.THREAD).insert(threadsNotExist).returning('id');
                } else {
                    return [];
                }
            })
            .catch((err: any) => {
                console.log(err);
                return err;
            });
    }

    async updateThread(thread: Thread) {
        let { id, title, forum, author, tags, isDailyDiscussion } = thread;
        //if (typeof rest.created == 'string') rest.created = new Date(rest.created);
        if (Array.isArray(tags)) tags = JSON.stringify(tags);
        return this.db
            .knex(DATABASE.THREAD)
            .update({ title, forum, author, tags, isDailyDiscussion }, ['id'])
            .where({ id });
    }

    async deleteThread(id: string): Promise<any> {
        return this.db.knex(DATABASE.THREAD).delete({ id });
    }
}
/**
Schema:
{
    id: {
        type: "VARCHAR2",
        defaultValue: null,
        maxLength: 255,
        nullable: false,
    },
    title: {
        type: "VARCHAR2",
        defaultValue: null,
        maxLength: 4000,
        nullable: false,
    },
    forum: {
        type: "VARCHAR2",
        defaultValue: null,
        maxLength: 255,
        nullable: false,
    },
    created: {
        type: "DATE",
        defaultValue: null,
        maxLength: null,
        nullable: false,
    },
};
*/
