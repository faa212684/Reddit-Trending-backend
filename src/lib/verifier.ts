import { KeyMissingError, KeyNotMatchError } from './errors';
interface VerifyTarget {
    [key: string]: any;
}
export default class Verifier {
    /**
     * @description Check if a object have the exact keys. Any object keys different with the @param keys will throw a error
     * @throws new KeyNotMatchError
     */
    exact(keys: string[], obj: VerifyTarget): void {
        if (keys.length != Object.keys(obj).length) throw new KeyNotMatchError(keys);
        keys.forEach(key => {
            if (!obj[key]) throw new KeyNotMatchError(keys);
        });
    }

    atLeast(keys: string[], obj: VerifyTarget): void {
        const rest = keys.filter(key => !obj[key]);
        if (rest.length) throw new KeyMissingError(rest);
    }

    /**
     * @description Check if a object have any unspecified keys. Without any unspecified keys will throw a error
     * @throws new KeyNotSupportError
     */
    atMost(keys: string[], obj: VerifyTarget): void {
        const rest = Object.keys(obj).filter(key => !keys.includes(key));
        if (rest.length) throw new KeyMissingError(rest);
    }
}
