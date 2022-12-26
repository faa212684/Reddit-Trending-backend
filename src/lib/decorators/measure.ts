import Log from 'log4fns';
export default function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const start = Date.now();
        const result = await fn.apply(this, args);

        const finish = Date.now();
        Log('Time usage', propertyKey, finish - start, 'ms');
        return result;
    };
}
