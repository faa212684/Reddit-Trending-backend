import Log from 'log4fns';
import InjectManager from '../../services/injectManager';

/**
 * A decorator function that injects an instance of the specified injectable class into the decorated property.
 * 
 * The Inject decorator is a higher-order function that takes an InjectableClass parameter (which is a constructor 
 * function for an injectable class) and an optional s parameter (which appears to have no purpose) and returns a 
 * decorator that can be applied to a class property. When applied to a class property, the decorator defines a getter 
 * function for the property that returns an instance of the injectable class, obtained using the InjectManager.get 
 * function and passing the name of the injectable class as an argument. The getter function is marked as enumerable 
 * and configurable. This allows the decorated property to act as a transparent proxy for the injected instance of 
 * the injectable class.
 * 
 * @param {new () => any} InjectableClass - A constructor function for the injectable class.
 * @param {string} [s=''] - A string parameter with no apparent purpose.
 * @returns {(target: any, propertyName: string) => void} A decorator that can be applied to a class property.
 */
export default function Inject(InjectableClass: { new () }, s = '') {
    return (target: any, propertyName: string) => {
        Object.defineProperty(target, propertyName, {
            get: () => InjectManager.get(InjectableClass.name),
            enumerable: true,
            configurable: true
        });
    };
}
