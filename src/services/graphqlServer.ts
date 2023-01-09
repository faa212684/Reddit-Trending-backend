import { ApolloServer } from '@apollo/server';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import Log from 'log4fns';
import ThreadController from '../controller/thread';
import ThreadStateController from '../controller/threadState';
import { Inject, Injectable } from '../lib/decorators';
import type { GraphQLReq } from '../lib/reqParser';

/**
 * A class for managing a GraphQL server.
 */
@Injectable
export default class GraphqlServer {
    @Inject(ThreadController)
    private threadController: ThreadController;
    @Inject(ThreadStateController)
    private threadStateController: ThreadStateController;
    private _server: ApolloServer;

    constructor() {
        this.initdGraphQLServer();
    }

    initdGraphQLServer() {
        const typeDefs = loadSchemaSync('src/schema.graphql', {
            loaders: [new GraphQLFileLoader()]
        });
        const resolvers = {
            Query: {
                hello: () => 'world',
                thread: () => ({}),
                state: () => ({}),
                count: () => ({})
            },
            GetThread: {
                all: (_, args: GraphQLReq) => this.threadController.getAllThread(args),
                one: (_, args: GraphQLReq) => this.threadStateController.getThreadsStatBySymbol(args)
            },
            GetState: {
                all: (_, args: GraphQLReq) => this.threadStateController.getStateByDateRange(args),
                vote: (_, args: GraphQLReq) => this.threadStateController.getStateOnVote(args),
                comment: (_, args: GraphQLReq) => this.threadStateController.getStateOnComment(args),
                distribution: (_, args: GraphQLReq) => this.threadController.getSymbolDistribution(args)
                //lastest: async (_,args) => threadStateController.getLastestStateOfAll(obj),
            },
            GetCount: {
                thread: () => this.threadController.getCount(),
                threadState: () => this.threadStateController.getCount(),
                forum: () => this.threadController.getForums(),
                latest: () => this.threadStateController.getLastestUpdated()
            }
        };
        this._server = new ApolloServer({
            typeDefs,
            resolvers,
            formatError: (formattedError, error) => {
                // Return a different error message
                Log(formattedError);
                if (formattedError.extensions.code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED) {
                    return {
                        ...formattedError,
                        message: "Your query doesn't match the schema. Try double-checking it!"
                    };
                }

                // Otherwise return the formatted error. This error can also
                // be manipulated in other ways, as long as it's returned.
                return formattedError;
            }
        });
    }

    async startServer() {
        await this._server.start();
    }

    get server() {
        return this._server;
    }
}
