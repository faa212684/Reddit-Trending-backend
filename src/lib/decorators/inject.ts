import Log from 'log4fns';
import InjectManager from '../../services/injectManager';

export default function Inject(InjectableClass: { new () }, s = '') {
    return (target: any, propertyName: string) => {
        Object.defineProperty(target, propertyName, {
            get: () => InjectManager.get(InjectableClass.name),
            enumerable: true,
            configurable: true
        });
    };
}
