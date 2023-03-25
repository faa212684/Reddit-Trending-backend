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

/**
 * Converts a raw database record for a thread into a more usable format.
 * @param {any} thread - An object representing a raw database record for a thread.
 * @returns {Thread} A new object with the same properties as `thread`, with the exception of the `tags`
 * and `isDailyDiscussion` properties. The `tags` property is parsed from a JSON string to an array,
 * and the `isDailyDiscussion` property is converted from a string representation of a
 * boolean value (`'1'` or `'0'`) to a boolean value (`true` or `false`).
 */
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

    /**
     * Retrieves and returns all threads from a database or other data source based on the specified date range.
     * @param {QueryParams} - An object representing a set of query parameters.
     * @param {number} - The number of days to include in the date range.
     * @returns {Promise<Thread[]>} - A promise that resolves to an array of threads.
     */
    async all({ dateRange }: QueryParams): Promise<Thread[]> {
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

    /**
     * Retrieves and returns a single thread from a database or other data source based on the specified symbol.
     * @param {string} id - The symbol of the thread to retrieve.
     * @returns {Promise<Thread>} - A promise that resolves to a single thread.
     */
    async getBySymbol({ id }): Promise<Thread> {
        return this.db.knex.select('*').from(DATABASE.THREAD).where({ id }).first().then(parseThreadFromDB);
    }


    /**
     * Retrieves and returns a set of threads from a database or other data source based on the specified page number and page size.
     * @param {QueryParams} - An object representing a set of query parameters.
     * @param {number} - The number of the page to retrieve.
     * @param {number} - The number of threads to include in each page.
     * @returns {Promise<Thread[]>} - A promise that resolves to an array of threads.
     */
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

    /**
     * Saves a set of threads to a database or other data source.
     *
     * The saveThreads method then selects the id column from the THREAD database table where the id is in the
     * array of thread IDs provided as input. This is done to check which threads already exist in the database
     * and should not be re-inserted. If there are threads that do not already exist in the database, the saveThreads
     * method inserts them using the INSERT query and the knex library. It returns the IDs of the inserted threads
     * using the returning method. If no threads are inserted, an empty array is returned.
     *
     * @param {Thread[]} threads - An array of threads to be saved.
     * @returns {Promise<number[] | any>} - A promise that resolves to an array of IDs of the saved threads, or an error object if an error occurred.
     */
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
                //console.log(err);
                return err;
            });
    }

    async updateThread(thread: Thread) {
        let { id, title, forum, author, tags, isDailyDiscussion, symbol } = thread;
        //if (typeof rest.created == 'string') rest.created = new Date(rest.created);
        if (Array.isArray(tags)) tags = JSON.stringify(tags);
        return this.db
            .knex(DATABASE.THREAD)
            .update({ title, forum, author, tags, isDailyDiscussion, symbol: JSON.stringify(symbol)  }, ['id'])
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
