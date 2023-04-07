import { Inject, Injectable } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import timeFormat from '../lib/timeFormat';
import { DATABASE } from './constant';
import Database from './database';
import TagService from './tagService';
import type { Tag } from './tagService';
import { CommentRaw } from '../types';

@Injectable
export default class CommentService {
    @Inject(Database)
    private readonly db: Database;

    constructor() {}

    async insert(objects: CommentRaw[]) {
        return this.db.knex(DATABASE.COMMENT).insert(objects).returning('id');
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
