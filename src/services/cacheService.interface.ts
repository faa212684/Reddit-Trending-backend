/**
 * An interface for cache services.
 */
interface CacheService {
    /**
     * Sets a cache value.
     *
     * @param {string} key - The cache key.
     * @param {any} value - The value to be cached.
     * @returns {void}
     */
    set(key: string, value: any): void;

    /**
     * Gets a cache value.
     *
     * @param {string} key - The cache key.
     * @returns {Promise<any>} A promise that resolves to the cache value.
     */
    get(key: string): Promise<any>;

    /**
     * Deletes a cache.
     *
     * @param {string} key - The cache key.
     * @returns {Promise<any>} A promise that resolves when the cache is deleted.
     */
    delete(key: string): Promise<any>;
}

export default CacheService;
