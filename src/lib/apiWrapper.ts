import { Request, Response } from 'express';
export default function apiWrapper(controller: any) {
    return async (req: Request, res: Response) => {
        controller(req, res)
            .then((result: any) => {
                //Log(result.length)
                res.status(200).json(result);
            })
            .catch((err: any) => {
                if (err.code && err.msg) return res.status(err.code).json({ message: err.msg });
                console.log('error', err);
                res.status(400).json({ message: err.toString() });
            });
    };
}
