export {};

declare global {
    namespace Express {
        interface Request {
            query: any;
        }
        interface Response {
            send: any;
        }
    }
}
