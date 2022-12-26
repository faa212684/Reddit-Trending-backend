import Log from 'log4fns';
import ThreadService from '../src/services/thread';
import TagService from '../src/services/tagService';
/* jest.mock('../src/services/constant', () => ({
    DATABASE: {
        THREAD: 'THREAD_TEST',
        THREAD_STAT: 'THREAD_STAT',
        USERS: 'USERS'
    }
})); */

describe('Test Oracle Database(Thread service)', () => {
    const tagService = new TagService();
    const threadService = new ThreadService();
 
    /* describe('Update data', () => {
        it("updateThread() should return the updated Object's id", async () => {
            for (const data of testData) {
                data.tags = (await tagService.getTag(data.title)) as string;
                await threadService.updateThread({ ...data, isDailyDiscussion: data.isDailyDiscussion == '1' });
            }
            expect(true).toEqual(true);
        });
    }); */
    const testData = {
        id: 'testID2',
        title: 'Bitcoin millionaire who retired at 35 complains that being rich is "boring"',
        forum: 'CryptoCurrency',
        created: '2022-12-09T07:43:52.000Z',
        author: 'LoquaciousLethologic',
        isDailyDiscussion: false
        //tags: ['Bitcoin', 'tag1', 'tag2']
    };

    const result = {
        ...testData,
        created: new Date(testData.created)
    };

    describe('Insert data', () => {
        it('saveThreads() return inserted id: testID', async () => {
            const result = await threadService.saveThreads([testData]);
            //Log(result);
            expect(result[0]).toEqual(testData.id);
        });
    });

    describe('Get data', () => {
        it('getBySymbol() should return the same Object as testData', async () => {
            const obj = await threadService.getBySymbol({ id: testData.id });
            expect(obj.id).toEqual(testData.id);
            expect(obj.title).toEqual(testData.title);
            
            expect(obj.tags).toEqual(['bitcoin']);
        });
    });

    describe('Update data', () => {
        it("updateThread() should return the updated Object's id", async () => {
            const obj = await threadService.updateThread({ ...testData, title: 'new title', tags: ['Bitcoin'] });
            //Log(obj);
            expect(obj[0].id).toEqual(testData.id);
            expect(obj[0].title).toEqual('new title');
        });
    });

    describe('Delete data', () => {
        it('deleteThread() should return the deleted quantity 1', async () => {
            const obj = await threadService.deleteThread(testData.id);
            expect(obj).toEqual(1);
        });
    }); 
});
