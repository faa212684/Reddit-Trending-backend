import { Request, Response } from 'express';
import { getQueryFromReq } from '../reqParser';

/**
 * A decorator function that modifies a route handler function to extract query parameters from the request object and pass them as an argument to the decorated function.
 * @param {Object} target - The object containing the decorated method.
 * @param {string} propertyKey - The name of the decorated method.
 * @param {PropertyDescriptor} descriptor - The property descriptor for the decorated method.
 * @returns {void}
 */
export default function ParseQueryParams(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async function (req: Request, res: Response) {
        const query = getQueryFromReq(req);
        return fn.apply(target, [query]);
    };
}
