const Worker = require('../worker');
const fs = require('fs');
jest.mock('log4fns', () => jest.fn(() => {}));

jest.mock('fs', () => ({
    writeFileSync: jest.fn()
}));
describe('Worker', () => {
    let worker = new Worker(['SPACs']);

    afterEach(() => {
        worker = new Worker(['SPACs']);
    });

    /* test('getLatest() Should update the last detail', () => {
        jest.mock('../last.json', () => ({ scrape: 1669679911635, insertDB: 1669679911632 }));
        worker.getLatest();
        expect(worker.last.scrape).toBe(1669679911635);
        expect(worker.last.insertDB).toBe(1669679911632);
    });

    it('updateTimeStamp() Should update the insertTimeStamp', () => {
        worker.updateTimeStamp();
        expect(worker.insertTimeStamp).toBeInstanceOf(Date);
    });

    it("handleScrape() Should call getByForum by 'SPACs'", async () => {
        worker.getLatest = jest.fn();
        worker.getByForum = jest.fn();
        await worker.handleScrape();

        expect(worker.getLatest).not.toHaveBeenCalled();
        expect(worker.getByForum).toHaveBeenCalledWith('SPACs');
    });

    test('updateLatest() Should update he last.json', () => {
        const last = { scrape: 1669677854229, insertDB: 1669678172009 };
        worker.last = last;
        worker.updateLatest();
        expect(fs.writeFileSync).toHaveBeenCalledWith('last.json', JSON.stringify(last));
    }); */


});
