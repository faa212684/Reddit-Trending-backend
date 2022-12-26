import { Request } from 'express';
import jwt from 'jsonwebtoken';
import Log from 'log4fns';
import { Inject, POST } from '../lib/decorators';
import RedisCache from '../services/redisCache';

export default class AuthController {
    @Inject(RedisCache)
    private static readonly cache: RedisCache;
    private readonly expireTime = Math.floor(Date.now() / 1000) + 60 * 60 * 48; // 48 Hour

    @POST('/token')
    async getToken(req: Request) {
        const { username, password } = req.body;
        if (username !== process.env.USERNAME || password !== process.env.PASSWORD) throw 'user not match';
        const token = jwt.sign({ exp: this.expireTime, data: 'foobar' }, process.env.SECRET_KEY);
        await AuthController.cache.set(token, true);
        return { token };
    }

    static async verify(token: string) {
        if (!/Bearer/.test(token)) return false;
        token = token.split(' ')[1];
        if (AuthController.cache.get(token)) return true;
        try {
            return jwt.verify(token, process.env.SECRET_KEY);
        } catch (e) {
            Log('invalid token');
            return false;
        }
    }
}
