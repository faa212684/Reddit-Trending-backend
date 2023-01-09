import { TagService } from './TagService';


describe('TagService', () => {
    let tagService: TagService;
    let cacheServiceMock;

    beforeEach(() => {
        // Create a mock for the RedisCache dependency
        cacheServiceMock = {
            set: jest.fn().mockResolvedValue(),
            get: jest.fn().mockResolvedValue({})
        };

        // Initialize the TagService with the mock cache service
        tagService = new TagService(cacheServiceMock);
    });

    describe('getTagWithSpace', () => {
        it('should return tags with spaces from the given string', () => {
            const tags = tagService.getTagWithSpace('This is a test string with some tags #tag1 and #tag2');
            expect(tags).toEqual(['#tag1', '#tag2']);
        });
    });

    describe('getTagWithoutSpace', () => {
        it('should return tags without spaces from the given string', () => {
            const tags = tagService.getTagWithoutSpace('This is a test string with some tags #tag1 and #tag2');
            expect(tags).toEqual([]);
        });
    });

    describe('getTag', () => {
        it('should return an array of tags from the given string', async () => {
            // Set up the mock axios call to return a specific set of tags
            jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: ['#tag1', '#tag2'] });

            const tags = await tagService.getTag('This is a test string with some tags #tag1 and #tag2');
            expect(tags).toEqual(['#tag1', '#tag2']);
        });

        it('should return a string representation of the array of tags from the given string', async () => {
            // Set up the mock axios call to return a specific set of tags
            jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: ['#tag1', '#tag2'] });

            const tags = await tagService.getTag('This is a test string with some tags #tag1 and #tag2', true);
            expect(tags).toEqual('["#tag1","#tag2"]');
        });
    });
});
