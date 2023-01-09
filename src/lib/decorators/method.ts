import 'reflect-metadata';
enum Methods {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

/**
 * A higher-order function that returns a decorator for applying metadata to a class method.
 * 
 * The methodDecoratorFactory function is a higher-order function that takes an method parameter (which specifies 
 * the HTTP method for the decorated route handler) and returns a decorator function. When applied to a class method, 
 * the decorator function adds metadata about the route (i.e., the HTTP method and path) to the class using the 
 * Reflect API. The metadata is stored in the ROUTERS property of the class's metadata. The decorator function 
 * returns the original method descriptor.
 * 
 * This decorator function appears to be intended to be used in conjunction with other decorators (e.g., GET, POST, etc.) 
 * that are defined using the methodDecoratorFactory function and that can be applied to class methods to indicate that 
 * they are route handlers for specific HTTP methods.
 * 
 * @param {Methods} method - The HTTP method (e.g., "GET", "POST", etc.) for the decorated route handler.
 * @returns {(path: string) => (target: any, propertyKey: any, descriptor: PropertyDescriptor) => PropertyDescriptor} A decorator that can be applied to a class method.
 */
function methodDecoratorFactory(method: Methods) {
    return function (path: string) {
        return (target: any, propertyKey: any, descriptor: PropertyDescriptor) => {
            const controllerClass = target.constructor;
            const route = Reflect.hasMetadata('ROUTERS', controllerClass)
                ? Reflect.getMetadata('ROUTERS', controllerClass)
                : [];
            route.push({ method, path, handler: propertyKey });
            Reflect.defineMetadata('ROUTERS', route, controllerClass);
            return descriptor;
        };
    };
}

export const GET = methodDecoratorFactory(Methods.GET);
export const POST = methodDecoratorFactory(Methods.POST);
export const PUT = methodDecoratorFactory(Methods.PUT);
export const DELETE = methodDecoratorFactory(Methods.DELETE);
