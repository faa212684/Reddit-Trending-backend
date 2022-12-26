import 'dotenv/config';
import Log from 'log4fns';
import mongoose from 'mongoose';
import { Injectable } from '../lib/decorators';
import { DATABASE } from './constant';
import { Thread } from './thread';
import { ThreadState } from './threadState';
//mongoose.set('debug', true);

const ThreadSchema = new mongoose.Schema<Thread>(
    {
        _id: String,
        forum: {
            type: String,
            index: true,
            unique: true
        },
        title: String,
        tags: [String],
        created: {
            type: Date,
            default: Date.now()
        }
    },
    {
        collection: DATABASE.THREAD,
        autoIndex: true,
        virtuals: {
            id: {
                get() {
                    return this._id;
                },
                set(v) {
                    Log(v);
                    this._id = v;
                }
            }
        }
    }
);

const ThreadStateSchema = new mongoose.Schema<ThreadState>(
    {
        id: {
            type: String,
            index: true
        },
        vote: Number,
        comment: Number,
        updated: {
            type: Date,
            default: Date.now(),
            index: true
        }
    },
    {
        collection: DATABASE.THREAD_STAT
    }
);

export const ThreadModel = mongoose.model<Thread>(DATABASE.THREAD, ThreadSchema);
export const ThreadStateModel = mongoose.model<ThreadState>(DATABASE.THREAD_STAT, ThreadStateSchema);

//ThreadModel.collection.dropIndexes();
//ThreadModel.createIndexes();
//ThreadSchema.index({ id: 1 }, { unique: true });

@Injectable
class DatabaseJSON {
    constructor() {
        this.initConnection();
    }

    initConnection() {
        Log('Initializing Mongo connection');
        mongoose
            .connect(process.env.JSONDB_CONNECTSTRING2, {
                autoIndex: true
            })
            .then(async result => {
                Log('Initializing Mongo connection success');
                await ThreadModel.ensureIndexes();
            })
            .catch(err => {
                Log('Initialized Mongo connection fail');
                console.log(err);
            });
    }
}

export default DatabaseJSON;
