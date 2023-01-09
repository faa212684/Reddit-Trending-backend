/**
 * An error class representing a missing required key in a request.
 */
export class KeyMissingError extends Error {
    /**
     * Creates an instance of KeyMissingError.
     * @param {string[]} keys - An array of keys that are missing in the request.
     */
    constructor(keys: string[]) {
        super();
        this.message = `[${keys.join(', ')}] is requied in request`;
    }
}

/**
 * An error class representing a key in a request that does not match an expected value.
 */
export class KeyNotMatchError extends Error {
    /**
     * Creates an instance of KeyNotMatchError.
     * @param {string[]} keys - An array of keys that do not match the expected value in the request.
     */
    constructor(keys: string[]) {
        super();
        this.message = `[${keys.join(', ')}] must exact contain in request`;
    }
}

/**
 * An error class representing an unsupported key in a request.
 */
export class KeyNotSupportError extends Error {
    /**
     * Creates an instance of KeyNotSupportError.
     * @param {string[]} keys - An array of unsupported keys found in the request.
     */
    constructor(keys: string[]) {
        super();
        this.message = `invalid parameter [${keys.join(', ')}] found in request`;
    }
}
