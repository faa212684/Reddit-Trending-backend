import 'reflect-metadata';
enum Methods {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}
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
