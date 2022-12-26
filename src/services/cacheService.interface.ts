export default interface CacheService {
    set(key: string, value: any): void;
    get(key: string): Promise<any>;
    //has(key: string): Promise<boolean>;
    delete(key: string): Promise<any>;
}
