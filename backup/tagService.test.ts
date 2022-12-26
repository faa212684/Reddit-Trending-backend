import InjectManager from '../src/services/injectManager';
import TagService from '../src/services/tagService';
import RedisCache from '../src/services/redisCache';
import symbolDict from '../src/variable/symbolDict.json';
import Log from 'log4fns';

describe('Test TagService', () => {
    //const cacheService = new RedisCache();
    let tagService: TagService = new TagService();
    /* beforeEach(() => {
        //tagService = new TagService();
    });
    it('Should store symbolDict into Redis cache', async () => {
        const result = await cacheService.get('symbolDict');
        expect(result).not.toBeNull();
        //expect(result).toEqual(symbolDict);
    });

    it("'getTagWithSpace()' should return a non null string[]", () => {
        const testString = 'the graph is a tes graph';
        const result = tagService.getTagWithSpace(testString);
        expect(result.length).toBeGreaterThan(0);
        expect(result).toEqual(['the graph']);
    });

    it("'getTagWithoutSpace()' should return a non null string[]", () => {
        const testString = 'wu xxxx yoshiharu zzzz tsla';
        const result = tagService.getTagWithoutSpace(testString);
        Log("result",result)
        expect(result.length).toBeGreaterThan(0);
        expect(result).toEqual(['wu', 'tsla']);
    }); */

    it("'getTag()' should return a non null string[]", async () => {
        //const testString = 'the graph is a tes graph wu xxxx yoshiharu zzzz tsla';
        const testString = `Fed tightening &amp; inverted yield curves aren't always "priced in."`;
        const result = await tagService.getTag(testString);
        console.log('result', result);
        expect(result).toEqual({
            adj: [],
            noun: ['ground', 'trading'],
            verb: ['recommend', 'learn']
        });
    });

    /* it("'getSymbols()' should return a non null symbol string array", async () => {
        const testData = ['aan','abev'];
        const result = await tagService.getSymbols(testData);
        Log("result",result)
        expect(result.length).toBeGreaterThan(0);
        expect(result).toEqual(["AAN","ABEV"]);
    }); */
});
