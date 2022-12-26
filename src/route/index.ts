import express from 'express';
import * as Controllers from '../controller';
import apiWrapper from '../lib/apiWrapper';

const METHOD_METADATA = 'method';
const PATH_METADATA = 'path';

export default class Router {
    private routeMap: any;
    private router: any;
    constructor() {
        this.router = express.Router();
        this.routeMap = this.buildRoute();
    }

    buildRoute() {
        return Object.values(Controllers)
            .map(Controller => {
                const controllerInstance = new Controller();
                const routes = Reflect.getMetadata('ROUTERS', Controller);
                return routes.map(({ method, path, handler }) => {
                    const resolver = apiWrapper(controllerInstance[handler].bind(controllerInstance));
                    this.router[method](path, resolver);
                    return {
                        method,
                        path,
                        handler,
                        controller: Controller.name
                    };
                });
            })
            .flat();
    }

    log() {
        console.table(this.routeMap);
    }

    get route() {
        return this.router;
    }
}
