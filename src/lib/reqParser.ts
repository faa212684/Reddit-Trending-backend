export type QueryParams = {
    //limit?: number;
    minVote?: number;
    minComment?: number;
    cache?: Boolean;
    dateRange?: number;
    forum?: string | { forum: string } | {};
    id?: string;
    page?: number;
    pageSize?: number;
};

export interface GraphQLReq {
    id?: string;
    //limit?: number;
    minVote?: number;
    minComment?: number;
    cache?: Boolean;
    dateRange?: number;
    forum?: string | { forum: string } | {};
    page?: number;
    pageSize?: number;
}

type Query = {
    forum: string | null;
    start: Date;
    end: Date;
    //limit: number;
    minVote: number;
    minComment: number;
    symbol: string;
};

/**
 * Extracts query parameters from a request object and returns them as an object.
 * @param {any} req - The request object from which to extract the query parameters.
 * @returns {QueryParams} An object containing the extracted query parameters.
 */
export function getQueryFromReq(req: any): QueryParams {
    const obj = req ? (req.query ? req.query : req) : {};
    const id = obj.id ? obj.id : null;
    //const forum = obj.forum ? { forum: obj.forum } : {};
    const forum = {};
    //const limit = Number(obj.limit ? (obj.limit > 20000 ? 20000 : obj.limit) : 6000);
    const dateRange = Number(obj.dateRange || 1);
    const minVote = Number(obj.minVote || 0);
    const minComment = Number(obj.minVote || 0);
    const page = Number(obj.page || 0);
    const pageSize = Number(obj.pageSize | 100);
    const cache = obj.cache==true;
    return { ...obj, forum, dateRange, minVote, minComment, cache, id, page, pageSize };
}
