//injectManager.set("asd",Date)
import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-redis';
import moment from 'moment';
import { Injectable } from '../lib/decorators';
import CacheService from './cacheService.interface';



@Injectable
export default class RedisCache implements CacheService {
    private _cache: any;

    constructor() {
        const options = {
            store: redisStore,
            url: 'redis://redis:6379'
            //ttl: 3600
        };
        this._cache = cacheManager.caching(options);
        this._cache.store.events.on('redisError', function (error) {
            console.log(error);
        });
    }

    async get(key: string): Promise<any> {
        try {
            return this._cache.get(key);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async set(key: string, value: any): Promise<void> {
        //console.log({key,ttl})
        const ttl = getRestTimeFromNow();
        //console.log({ttl:Math.round(ttl / 1000)})
        try {
            await this._cache.set(key, value, { ttl: Math.round(ttl / 1000) });
        } catch (e) {
            console.log(e);
        }
    }

    async delete(key: string): Promise<any> {
        try {
            await this._cache.del(key);
        } catch (e) {
            console.log(e);
        }
    }
}

export function getRestTimeFromNow() {
    const duration = moment.duration(30, 'minutes');
    const next = moment(Math.ceil(+Date.now() / +duration) * +duration).valueOf();
    return next - Date.now();
}

