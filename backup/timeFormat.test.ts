import timeFormat from '../src/lib/timeFormat';
describe('Test timeFormat', () => {
    it('Should return something', async () => {
        const result = timeFormat(Date.now() - 86400000 * 1);
        expect(result).not.toBeNull();
        //expect(result).toEqual(symbolDict);
    });
});
