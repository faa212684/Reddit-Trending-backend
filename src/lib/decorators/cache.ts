import Log from 'log4fns';
import CacheManager from '../../services/cacheManager';
import { Request, Response } from 'express';

import { getQueryFromReq } from '../reqParser';

const defaultReq = { minVote: 0, minComment: 0, dateRange: 1 };

export default function Cache(key: string, requireQuery: boolean = true) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const fn = descriptor.value;
        const query = getQueryFromReq(defaultReq);
        const _key = requireQuery ? `${key}:${JSON.stringify(query)}` : key;
        const cacheFunction = async () => descriptor.value.apply(target, [query]);
        CacheManager.periodCall(cacheFunction, _key);

        descriptor.value = async function (req: Request, res: Response) {
            const query = getQueryFromReq(req);
            const _key = requireQuery ? `${key}:${JSON.stringify(query)}` : key;
            const cache = await target.cacheService.get(_key);
            if (cache) {
                Log('Return result from cache for ', _key);
                return cache;
            }
            let result = await fn.apply(target, [query]);
            await target.cacheService.set(_key, result);
            return result;
        };
    };
}
