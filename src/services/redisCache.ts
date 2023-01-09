import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-redis';
import moment from 'moment';
import { Injectable } from '../lib/decorators';
import CacheService from './cacheService.interface';

/**
 * A class for managing a Redis cache.
 */
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

    /**
     * Gets a value from the cache by key.     *
     * @param {string} key - The key of the value to get.
     * @returns {Promise<any>} A promise that resolves with the value from the cache.
     */
    async get(key: string): Promise<any> {
        try {
            return this._cache.get(key);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /**
     * Sets a value in the cache.     *
     * @param {string} key - The key of the value to set.
     * @param {any} value - The value to set.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     */
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

    /**
     * Deletes a value from the cache by key.     *
     * @param {string} key - The key of the value to delete.
     * @returns {Promise<any>} A promise that resolves when the value is deleted.
     */
    async delete(key: string): Promise<any> {
        try {
            await this._cache.del(key);
        } catch (e) {
            console.log(e);
        }
    }
}

/**
 * Gets the time until the next full 30 minute interval from the current time. *
 * @returns {number} The time until the next full 30 minute interval, in milliseconds.
 */
export function getRestTimeFromNow() {
    const duration = moment.duration(30, 'minutes');
    const next = moment(Math.ceil(+Date.now() / +duration) * +duration).valueOf();
    return next - Date.now();
}
