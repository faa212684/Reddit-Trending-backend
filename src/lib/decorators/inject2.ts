export default function Inject2(key: any) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const existingInjections = (target as any).injections || [];

        Object.defineProperty(target, 'injections', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: [...existingInjections, key]
        });
    };
}
