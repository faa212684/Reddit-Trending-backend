import { KeyMissingError, KeyNotMatchError } from './errors';
interface VerifyTarget {
    [key: string]: any;
}

/**
 * A utility class for verifying the keys of an object.
 */
export default class Verifier {
    /**
     * Verifies that the given object has exactly the same keys as the specified array.
     * Throws a `KeyNotMatchError` if the object does not have the same number of keys or if any of the keys are missing.
     * @param {string[]} keys - The expected keys.
     * @param {VerifyTarget} obj - The object to verify.
     * @throws {KeyNotMatchError} If the object does not have the same number of keys or if any of the keys are missing.
     */
    exact(keys: string[], obj: VerifyTarget): void {
        if (keys.length != Object.keys(obj).length) throw new KeyNotMatchError(keys);
        keys.forEach(key => {
            if (!obj[key]) throw new KeyNotMatchError(keys);
        });
    }

    /**
     * Verifies that the given object has at least the specified keys.
     * Throws a `KeyMissingError` if any of the specified keys are missing.
     * @param {string[]} keys - The expected keys.
     * @param {VerifyTarget} obj - The object to verify.
     * @throws {KeyMissingError} If any of the specified keys are missing.
     */
    atLeast(keys: string[], obj: VerifyTarget): void {
        const rest = keys.filter(key => !obj[key]);
        if (rest.length) throw new KeyMissingError(rest);
    }

    /**
     * Verifies that the given object has at most the specified keys.
     * @param {string[]} keys - The expected keys.
     * @param {VerifyTarget} obj - The object to verify.
     */
    atMost(keys: string[], obj: VerifyTarget): void {
        const rest = Object.keys(obj).filter(key => !keys.includes(key));
        if (rest.length) throw new KeyMissingError(rest);
    }
}
