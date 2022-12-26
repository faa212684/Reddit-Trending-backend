import JSONThreadService from '../src/services/thread_json';
import mongoose, { ConnectOptions } from 'mongoose';
import Log from 'log4fns';
import { Thread } from '../src/services/thread';
describe('Test Oracle json database', () => {
    mongoose.set('debug', false);

    const jsonThreadService = new JSONThreadService();

    console.log = jest.fn();

    const testData = [
        {
            id: 'test3',
            forum: 'spac',
            title: 'Ethereum’s energy switch saves as much electricity as entire Ireland uses | The success of The Merge concept may now serve as a roadmap to enable a switch from Proof of Work to Proof of Stake in Bitcoin.',
            tags: [],
            created: new Date('2022-12-02T02:42:40.497Z')
        },
        {
            id: 'test4',
            forum: 'spac',
            title: 'This is a test4 title',
            tags: [],
            created: new Date('2022-12-02T02:42:40.497Z')
        }
    ] as Thread[];

    beforeAll(async () => {
        await mongoose.connect(process.env.JSONDB_CONNECTSTRING2);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
    describe('Insert data', () => {
        it('Shoud return inserted id: test3,test4', async () => {
            const result = await jsonThreadService.saveThreads(testData);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].id).toEqual('test3');
        });
    });

    describe('Get data by id', () => {
        it('Shoud return test3', async () => {
            const result = await jsonThreadService.getById({ id: 'test3' });
            expect(result.title).not.toBeNull();
            Log(result.tags);
            expect(result.tags.length).toBeGreaterThan(0);

            expect(result.tags).toContain('bitcoin');
        });
    });

    describe('Get data', () => {
        it('Shoud return all record', async () => {
            const result = await jsonThreadService.all();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('id');
        });
    });

    describe('Update data', () => {
        it('Shoud update the data', async () => {
            const newData = { ...testData[0], title: 'new title' };
            const result = await jsonThreadService.updateThread(newData);
            expect(result.title).toEqual('new title');
        });
    });

    describe('Delete data', () => {
        const id = 'test333';
        it('Shoud return delete count 1', async () => {
            const result = await jsonThreadService.deleteThread({ id: testData[0].id });
            expect(result.deletedCount).toEqual(1);
        });

        it('Shoud return deleted count 0 since id not exist', async () => {
            const result = await jsonThreadService.deleteThread({ id: 'sdfgsdfh' });
            expect(result.deletedCount).toEqual(0);
        });

        it('Should clean up test datas', async () => {
            await jsonThreadService.deleteThread({ id: testData[0].id });
            await jsonThreadService.deleteThread({ id: testData[1].id });
            const result = await jsonThreadService.all();
            expect(result.length).toEqual(0);
        });
    });
});
