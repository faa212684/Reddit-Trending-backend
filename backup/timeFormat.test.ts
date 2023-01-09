import timeFormat from '../src/lib/timeFormat';
describe('Test timeFormat', () => {
    it('should round down the date to the nearest 30 minutes', () => {
        expect(timeFormat(1536456000000)).toEqual(1536453600000); // rounds down to 15:00:00
        expect(timeFormat(1536456400000)).toEqual(1536453600000); // rounds down to 15:00:00
        expect(timeFormat(1536456399999)).toEqual(1536453600000); // rounds down to 15:00:00
    });

    it('should round up the date to the nearest 30 minutes', () => {
        expect(timeFormat(1536453599999)).toEqual(1536453600000); // rounds up to 15:30:00
        expect(timeFormat(1536453600000)).toEqual(1536453600000); // remains unchanged at 15:30:00
        expect(timeFormat(1536453799999)).toEqual(1536453600000); // rounds up to 15:30:00
    });
});
