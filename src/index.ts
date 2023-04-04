import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import Log from 'log4fns';
import 'reflect-metadata';
import { Inject } from './lib/decorators';
import Router from './route';
//import GraphqlServer from './services/graphqlServer';
import injectManager from "./services/injectManager"

Log.setTimeZone('America/Vancouver');
//Log.setShowDetailInProduction(true)

class App {
    /* @Inject(GraphqlServer)
    private readonly graphqlServer: GraphqlServer; */
    private readonly instance: Express;

    constructor() {
        this.instance = express();
    }

    async init() {
        //await this.graphqlServer.startServer();
        this.initExpressServer();
    }

    initExpressServer() {
        const PORT = process.env.NODE_ENV == 'production' ? 3000 : 3001;
        const router = new Router();
        this.instance.use(cors());
        this.instance.use(express.json());
        this.instance.use(express.urlencoded({ extended: true }));
        this.instance.use(function (req: Request, res: Response, next: Function) {
            Log(req.path, req.query);
            next();
        });
        this.instance.use('/api', router.route);
        //this.instance.use('/graphql', expressMiddleware(this.graphqlServer.server));
        this.instance.listen(PORT);
        router.log();
        Log(`🚀  Server ready on port ${PORT}`);
        //console.log(injectManager.test())
    }
}

const app = new App();
app.init();
