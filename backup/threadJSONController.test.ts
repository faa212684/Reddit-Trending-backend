import { getQueryFromReq } from '../src/lib/reqParser';
import JSONThreadService from '../src/services/thread_json';
import { JSONThreadController } from '../src/controller';

jest.mock('../src/services/injectManager', () => ({ get: () => mockService, set: jest.fn() }));
jest.mock('../src/services/thread_json');

const mockService = {} as JSONThreadService;

Object.getOwnPropertyNames(JSONThreadService.prototype).forEach(fnName => (mockService[fnName] = jest.fn()));

describe('Test thread controller for JSON database', () => {
    it('"getAll" should call the service function "all"', async () => {
        await new JSONThreadController().getAll({});
        expect(mockService.all).toHaveBeenCalledTimes(1);
    });

    it('"getThreadsStatBySymbol" should call the service function "getById" with a param', async () => {
        const param = getQueryFromReq({ id: 'test3' });
        await new JSONThreadController().getThreadsStatBySymbol({ id: 'test3' });
        expect(mockService.getById).toHaveBeenCalledWith(param);
    });
});
