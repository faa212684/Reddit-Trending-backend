import Log from 'log4fns';
import CacheManager from '../../services/cacheManager';
import { Request, Response } from 'express';

import { getQueryFromReq } from '../reqParser';

const defaultReq = { minVote: 0, minComment: 0, dateRange: 1 };

/**
 * A decorator function that enables caching for a route handler function.
 *
 * The Cache decorator is a higher-order function that takes a key parameter and an optional requireQuery
 * parameter and returns a decorator that can be applied to a route handler function. When applied to a route
 * handler function, the decorator modifies the function to first check if a cached version of the response
 * exists for the specified key, and if it does, it returns the cached response. If no cached version of the
 * response exists, the decorated function is executed, and the response is cached using the specified key.
 * If the requireQuery parameter is set to true (which is the default value), the query parameters of the
 * request are included in the cache key.
 *
 * @param {string} key - The key to use for caching the response.
 * @param {boolean} [requireQuery=true] - Indicates whether the query parameters of the request should be included in the cache key.
 * @returns {(target: any, propertyKey: string, descriptor: PropertyDescriptor) => void} A decorator that can be applied to a route handler function.
 */
export default function Cache(key: string, requireQuery: boolean = true) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const fn = descriptor.value;
        const query = getQueryFromReq(defaultReq);
        const _key = requireQuery ? `${key}:${JSON.stringify(query)}` : key;
        const cacheFunction = async () => descriptor.value.apply(target, [query]);
        //CacheManager.periodCall(cacheFunction, _key);

        descriptor.value = async function (req: Request, res: Response) {
            const query = getQueryFromReq(req);
            const _key = requireQuery ? `${key}:${JSON.stringify(query)}` : key;
            const cache = await target.cacheService.get(_key);
            if (cache && query.cache) {
                Log('Return result from cache for ', _key);
                return cache;
            }
            let result = await fn.apply(target, [query, requireQuery ? req : null]);
            await target.cacheService.set(_key, result);
            return result;
        };
    };
}
