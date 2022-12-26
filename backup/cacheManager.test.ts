import Log from 'log4fns';
import CacheManager from '../src/services/cacheManager';
import { Cache } from '../src/lib/decorators';
import RedisCache from '../src/services/redisCache';
class Test {
    @Cache('Test.mainSync', false)
    mainSync() {
        return 'test value sync';
    }

    @Cache('Test.main', false)
    async main() {
        return new Promise(resolve => setTimeout(() => resolve('test value'), 1000));
    }
}

describe('Test CacheManager', () => {
    const redisCache = new RedisCache();
    const test = new Test();
    afterAll(async () => {
        await CacheManager.cacheService.delete('Test.main');
        await CacheManager.cacheService.delete('Test.mainSync');
    });

    it('Should save cache to the redis database for both sync and async method', async () => {
        await new Promise(r => setTimeout(r, 1000));
        const resultSync = await CacheManager.cacheService.get('Test.mainSync');
        const result = await CacheManager.cacheService.get('Test.main');
        expect(resultSync).toEqual('test value sync');
        expect(result).toEqual('test value');
    });
});
