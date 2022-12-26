import { getRestTimeFromNow } from '../src/services/redisCache';

describe('Test RedisCache', () => {
    it('getRestTimeFromNow() should return a milliseconds value', async () => {
        const result = getRestTimeFromNow();
        expect(result).toBeGreaterThan(0);
    });

    it('getRestTimeFromNow() value add up Date.now() should be on the half or on the hour ', async () => {
        const minute = new Date(Date.now() + getRestTimeFromNow()).getMinutes();
        expect([30, 0]).toEqual(expect.arrayContaining([minute]));
    });
});
