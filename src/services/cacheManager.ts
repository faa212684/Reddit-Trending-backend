import Log from 'log4fns';
import Inject from '../lib/decorators/inject';
import RedisCache, { getRestTimeFromNow } from './redisCache';
import CacheService from "./cacheService.interface"


/**
 * A class for managing cache operations.
 */
class CacheManager {
    @Inject(RedisCache)
    static readonly cacheService: CacheService;

    /**
     * A decorator function for caching the result of a method.
     *
     * @param {string} key - The cache key.
     * @param {any} defaultParams - The default parameters for the method.
     * @returns {PropertyDescriptor} The property descriptor for the method.
     */
    static cache(key: string, defaultParams: any) {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            const className = target.name;
            const fn = async () => descriptor.value.apply(target, [defaultParams]);
            CacheManager.periodCall(fn, key);
            return descriptor;
        };
    }

    /**
     * Calls a function periodically and updates the cache.
     *
     * @param {Function} fn - The function to be called.
     * @param {string} key - The cache key.
     * @returns {void}
     */
    static async periodCall(fn: Function, key: string) {
        const interval = getRestTimeFromNow();
        const expireAt = new Date(Date.now() + interval).toLocaleString('en-US', { timeZone: 'America/Vancouver' });
        if ((await CacheManager.cacheService.get(key)) != null) {
            await CacheManager.cacheService.delete(key);
        }
        Log(`Default cache ${key.split(':')[0]} expire at ${expireAt}`);
        await fn();
        setTimeout(() => CacheManager.periodCall(fn, key), interval);
    }

    static async delete(key: string) {}
}

export default CacheManager;
