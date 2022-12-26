import Log from 'log4fns';

class InjectManager {
    private _providers: Map<string, any>;

    constructor() {
        this._providers = new Map();
    }

    get(key: string) {
        //Log("Getting",key)
        if (this._providers.has(key)) {
            return this._providers.get(key);
        } else {
            Log(`No provider found for ${key}!`);
        }
    }

    test() {
        console.log(this._providers);
    }

    set(key: string, provider: any) {
        if (!this._providers.has(key)) {
            //Log("Setting ",key)
            this._providers.set(key, new provider());
        }
    }
}

export default new InjectManager();
