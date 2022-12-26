import { Request, Response } from 'express';
import { getQueryFromReq } from '../reqParser';
export default function ParseQueryParams(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async function (req: Request, res: Response) {
        const query = getQueryFromReq(req);
        return fn.apply(target, [query]);
    };
}
