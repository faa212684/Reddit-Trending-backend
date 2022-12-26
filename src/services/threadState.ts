import { Inject, Injectable } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import timeFormat from '../lib/timeFormat';
import { DATABASE } from './constant';
import Database from './database';

export interface ThreadState {
    id: string;
    updated: Date;
    vote: number;
    comment: number;
    title?: string;
}

export interface DetailThreadState extends ThreadState {
    MAX: number;
    MIN: number;
}

@Injectable
export default class ThreadStateService {
    @Inject(Database)
    private readonly db: Database;

    getDateByDateRange(dateRange: number): Date {
        const now = new Date();
        const max = new Date(timeFormat(Date.now() - 86400000 * dateRange));
        return max;
    }

    async count(): Promise<number> {
        return this.db
            .knex(DATABASE.THREAD_STAT)
            .count('*', { as: 'a' })
            .then((result: any) => result[0].a);
    }

    async byPage({ page, pageSize }: QueryParams): Promise<ThreadState[]> {
        return this.db
            .knex(DATABASE.THREAD_STAT)
            .select('*')
            .offset(page * pageSize)
            .limit(pageSize);
    }

    async lastestUpdated(): Promise<string> {
        return this.db
            .knex(DATABASE.THREAD_STAT)
            .max({ updated: 'updated' })
            .then((result: any) => result[0].updated);
    }

    async bySymbol({ id }: QueryParams): Promise<ThreadState[]> {
        return this.db.knex
            .select('*')
            .from(DATABASE.THREAD_STAT)
            .where('id', id)
            //.limit(limit)
            .orderBy('updated', 'desc');
    }

    stateCallback(vals: any) {
        return vals
            .map((val: any) => ({
                ...val,
                change: (((val.MAX - val.MIN) / val.MIN) * 100) << 0
            }))
            .sort((a: any, b: any) => b.change - a.change);
    }

    async lastestOfAll({ forum,  dateRange, minVote, minComment }: QueryParams): Promise<ThreadState[]> {
        const forumObj = forum ? {} : { [`${DATABASE.THREAD_STAT}.forum`]: forum };
        return this.db.knex
            .select('*')
            .from(
                this.db.knex
                    .select('A.id', 'A.vote', 'A.comment', 'A.updated')
                    .from(
                        this.db.knex
                            .select('id', this.db.knex.raw('max(??) as updated', ['updated']))
                            .from(DATABASE.THREAD_STAT)
                            .where(forumObj)
                            .andWhere('updated', '>', this.getDateByDateRange(dateRange))
                            .andWhere('vote', '>', minVote)
                            .andWhere('comment', '>', minComment)
                            .groupBy('id')
                            .as('B')
                    )

                    .join(`${DATABASE.THREAD_STAT} as A`, function () {
                        this.on('A.id', '=', 'B.id').andOn('A.updated', '=', 'B.UPDATED');
                    })
                    //.join(`${DATABASE.THREAD_STAT} as A`, { "A.id": "B.id" }, { "A.updated": "B.updated" })
                    .as('C')
            )
            .join(`${DATABASE.THREAD} as D`, 'D.id', '=', 'C.id')
            .where(forumObj)
            //.limit(limit);
    }

    async byDateRange({ forum,  dateRange, minVote, minComment }: QueryParams): Promise<ThreadState[]> {
        const forumObj = forum ? {} : { [`${DATABASE.THREAD_STAT}.forum`]: forum };
        return this.db.knex
            .select(`${DATABASE.THREAD_STAT}.*`, `${DATABASE.THREAD}.title`)
            .from(DATABASE.THREAD_STAT)
            .join(DATABASE.THREAD, `${DATABASE.THREAD_STAT}.id`, '=', `${DATABASE.THREAD}.id`)
            //.limit(limit)
            .where(forumObj)
            .andWhere('vote', '>', minVote)
            .andWhere('comment', '>', minComment)
            .andWhere('updated', '>', this.getDateByDateRange(dateRange))
            .orderBy('updated', 'desc');
    }

    async vote({ dateRange, minVote }: QueryParams): Promise<DetailThreadState[]> {
        return this.db.knex
            .select(`${DATABASE.THREAD}.title`, `${DATABASE.THREAD}.forum`, 't1.*')
            .from(
                this.db.knex
                    .select(
                        'id',
                        this.db.knex.raw('max(??) as max', ['vote']),
                        this.db.knex.raw('min(??) as min', ['vote'])
                    )
                    .from(DATABASE.THREAD_STAT)
                    .where('vote', '>', minVote)
                    .andWhere('updated', '>', this.getDateByDateRange(dateRange))
                    .groupBy('id')
                    .as('t1')
            )
            .join(DATABASE.THREAD, `t1.id`, '=', `${DATABASE.THREAD}.id`)
            .then(this.stateCallback);
    }

    async comment({ dateRange, minComment }: QueryParams): Promise<DetailThreadState[]> {
        return this.db.knex
            .select(`${DATABASE.THREAD}.title`, `${DATABASE.THREAD}.forum`, 't1.*')
            .from(
                this.db.knex
                    .select(
                        'id',
                        this.db.knex.raw('max(??) as max', ['comment']),
                        this.db.knex.raw('min(??) as min', ['comment'])
                    )
                    .from(DATABASE.THREAD_STAT)
                    .where('comment', '>', minComment)
                    //.whereBetween("updated", [new Date(timeFormat(Date.now() - 86400000)), new Date(timeFormat(Date.now()))])
                    .andWhere('updated', '>', this.getDateByDateRange(dateRange))
                    .groupBy('id')
                    .as('t1')
            )
            .join(DATABASE.THREAD, `t1.id`, '=', `${DATABASE.THREAD}.id`)
            .then(this.stateCallback);
    }

    async saveThreadsStat(thread: ThreadState[]) {
        return this.db.knex(DATABASE.THREAD_STAT).insert(thread).returning('id');
    }
}

/* Schema:
{
    id: {
        type: "VARCHAR2",
        defaultValue: null,
        maxLength: 255,
        nullable: false,
    },
    vote: {
        type: "NUMBER",
        defaultValue: null,
        maxLength: null,
        nullable: false,
    },
    comment: {
        type: "NUMBER",
        defaultValue: null,
        maxLength: null,
        nullable: false,
    },
    updated: {
        type: "DATE",
        defaultValue: "CURRENT_TIMESTAMP ",
        maxLength: null,
        nullable: false,
    },
    forum: {
        type: "VARCHAR2",
        defaultValue: null,
        maxLength: 255,
        nullable: true,
    },
}; */
