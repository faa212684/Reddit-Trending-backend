export class KeyMissingError extends Error {
    constructor(keys: string[]) {
        super();
        this.message = `[${keys.join(', ')}] is requied in request`;
    }
}

export class KeyNotMatchError extends Error {
    constructor(keys: string[]) {
        super();
        this.message = `[${keys.join(', ')}] must exact contain in request`;
    }
}

export class KeyNotSupportError extends Error {
    constructor(keys: string[]) {
        super();
        this.message = `invalid parameter [${keys.join(', ')}] found in request`;
    }
}
