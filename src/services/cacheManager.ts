import Log from 'log4fns';
import Inject from '../lib/decorators/inject';
import RedisCache, { getRestTimeFromNow } from './redisCache';
//import Injectable from '../lib/decorators/injectable';

//@Injectable
class CacheManager {
    @Inject(RedisCache)
    static readonly cacheService: RedisCache;

    static cache(key: string, defaultParams: any) {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            const className = target.name;
            const fn = async () => descriptor.value.apply(target, [defaultParams]);
            CacheManager.periodCall(fn, key);
            return descriptor;
        };
    }

    static async periodCall(fn: Function, key: string) {
        const interval = getRestTimeFromNow();
        const expireAt = new Date(Date.now() + interval).toLocaleString('en-US', { timeZone: 'America/Vancouver' });
        if ((await CacheManager.cacheService.get(key)) != null) {            
            await CacheManager.cacheService.delete(key);
        }
        Log(`Setting cache ${key} expire at ${expireAt}`);
        await fn();
        setTimeout(() => CacheManager.periodCall(fn, key), interval);
    }

    static async delete(key: string) {}
}

export default CacheManager;
