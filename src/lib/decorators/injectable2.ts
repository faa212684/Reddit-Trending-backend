type Constructor<T = any> = new (...args: any[]) => T;

export default function Injectable2<T extends { new (...args: any[]): {} }>(constructor: T): T | void {
    return class extends constructor {
        constructor(...args: any[]) {
            const injections = ((constructor as any).injections as any[]) || [];
            super(...injections.map(i => new i()));
        }
    };
}
