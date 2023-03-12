import { Request, Response } from 'express';

/**
 * Wraps a controller function in a Promise to catch errors and send appropriate responses to the client.
 * @param {any} controller - The controller function to wrap.
 * @returns {(req: Request, res: Response) => void} - A function that can be used as an Express route handler.
 */
export default function apiWrapper(controller: any) {
    return async (req: Request, res: Response) => {
        controller(req, res)
            .then((result: any) => {
                //Log(result.length)
                res.status(200).json(result);
            })
            .catch((err: any) => {
                if (err.code && err.msg) return res.status(err.code).json({ message: err.msg });
                res.status(400).json({ message: err.toString() });
            });
    };
}
