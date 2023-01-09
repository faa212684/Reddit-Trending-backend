import { Request } from 'express';
import jwt from 'jsonwebtoken';
import Log from 'log4fns';
import { Inject, POST } from '../lib/decorators';
import RedisCache from '../services/redisCache';

/**
 * A class for managing authentication.
 */
export default class AuthController {
    /**
     * A cache for storing valid tokens.
     * Injected using the `@Inject` decorator.
     */
    @Inject(RedisCache)
    private static readonly cache: RedisCache;
    /**
     * The expiration time for tokens, in seconds.
     * Tokens will expire 48 hours after they are issued.
     */
    private readonly expireTime = Math.floor(Date.now() / 1000) + 60 * 60 * 48; // 48 Hour

    /**
     * A route handler for generating and issuing a new token.
     * @param {Request} req - The request object.
     * @returns {Promise<{token: string}>} A promise that resolves to an object with the issued token.
     * @throws {string} If the provided username and password do not match the expected values.
     */
    @POST('/token')
    async getToken(req: Request) {
        const { username, password } = req.body;
        if (username !== process.env.USERNAME || password !== process.env.PASSWORD) throw 'user not match';
        const token = jwt.sign({ exp: this.expireTime, data: 'foobar' }, process.env.SECRET_KEY);
        await AuthController.cache.set(token, true);
        return { token };
    }

    /**
     * Verifies the validity of a given token.
     * @param {string} token - The token to verify.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the token is valid, or `false` if it is invalid.
     */
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
