import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Symbol } from '../services/symbol';
import SymbolService from '../services/symbol';
import { ThreadController } from '../services';
import type { ThreadState, ThreadStateMaxMin } from '../services';
import ThreadStateController from './threadState';
import { parseToMidnight, getDaysDifference, getStartEndDate } from '../lib/timeFormat';
import TagController from './tag';
import Chart from 'chart.js/auto';
import { createCanvas } from 'canvas';
import ChartJsImage from 'chartjs-to-image';
import stockDict from '../variable/stockDict.json' assert { type: 'json' };
import { convertArrayToObject } from '../lib/dataStructure';
import cryptoDict from '../variable/cryptoDict.json' assert { type: 'json' };

const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

function combineStrings(s1, s2) {
    if (!s1 && !s2) return '';
    if (!s1) return s2;
    if (!s2) return s1;
    return [s1, s2].join(',');
}

enum CACHE {
    SYMBOL = 'SYMBOL'
}

@Injectable
export default class SymbolController {
    @Inject(SymbolService)
    private readonly symbolService: SymbolService;

    @Inject(TagController)
    private readonly tagController: TagController;

    @Inject(ThreadStateController)
    private readonly threadStateController: ThreadStateController;

    @Inject(RedisCache)
    private readonly cache: RedisCache;

    @GET('/symbol/raw')
    getSymbolRaw(req: Request) {
        const type = (req.query.type as string) || 'stock';
        const [startDay, endDay] = getStartEndDate(req);
        return this.symbolService.get(startDay, endDay, type);
    }

    @GET('/symbol/one')
    getSymbolOne(req: Request) {
        const id = req.query.id as string;
        return this.symbolService.getOne(id);
    }

    @GET('/symbol')
    async getAllSymbol(req: Request) {
        try {
            const page = parseInt(req.query.page as string) || 0;
            const per_page = parseInt(req.query.per_page as string) || 25;
            const type = (req.query.type as string) || 'stock';

            const cache = await this.cache.get(`${CACHE.SYMBOL}${type}`);
            let end = page + per_page;

            /* if (cache) {
                Log('return from cache');
                end = Math.min(page + per_page, cache.length);
                return cache;
                return {
                    //data: cache.sort((a, b) => b.change[sort] - a.change[sort]).slice(page, end),
                    //total: cache.length
                };
            } */

            const symbolMap = {};
            const [startDay, endDay] = getStartEndDate(req);
            const daySpan = getDaysDifference(startDay, endDay);
            const symbols: Symbol[] = await this.symbolService.get(startDay, endDay, type);
            Log(symbols.length);

            for (const _symbol of symbols) {
                const { symbol, created, threads, verb, vote, comment,type } = _symbol;
                if (!symbolMap[symbol])
                    symbolMap[symbol] = {
                        symbol,
                        type,
                        threads: null,
                        verb: null,
                        daily:{
                            vote:Array(daySpan).fill(0),
                            comment:Array(daySpan).fill(0),
                            threads:Array(daySpan).fill(0)
                        }
                    };

                const diff = daySpan - getDaysDifference(endDay, new Date(created));
                symbolMap[symbol].daily.vote[diff] = vote; //(threads as string).split(',').length;
                symbolMap[symbol].daily.comment[diff] = comment;
                symbolMap[symbol].daily.threads[diff] = (threads as string).split(',').length;
                symbolMap[symbol].threads = combineStrings(symbolMap[symbol].threads, threads);
                symbolMap[symbol].verb = combineStrings(symbolMap[symbol].verb, verb);
            }

            /* const threadState = await this.threadStateController.getMaxVoteAndComment(req);
            Log(threadState.length);
            Log(threadState[0]);
            const threadStateMap: Record<string, ThreadStateMaxMin> = convertArrayToObject(threadState);
 */
            const result = (
                await Promise.all(
                    Object.values(symbolMap)
                        //.slice(0,10)
                        .map(async (x: any) => {
                            //console.log(x.type)
                            const { daily} = x;
                            const name = x.type == 'stock' ? stockDict[x.symbol] : cryptoDict[x.symbol];
                            const threads = [...new Set(x.threads.split(','))];
                            const verb = [...new Set(x.verb.split(','))];
                            const change = {
                                vote: {
                                    day: 0,
                                    week: 0,
                                    month: 0
                                },
                                comment: {
                                    day: 0,
                                    week: 0,
                                    month: 0
                                }
                            };
                            const quantity = {
                                vote: {
                                    day: daily.vote.at(-1),
                                    week: daily.vote.at(-7),
                                    month: daily.vote[0]
                                },
                                comment: {
                                    day: daily.comment.at(-1),
                                    week: daily.comment.at(-7),
                                    month: daily.comment[0]
                                }
                            };
                            /* threads.forEach((thread: string) => {
                                change.vote.min += threadStateMap[thread].MIN_VOTE || 0;
                                change.vote.max += threadStateMap[thread].MAX_VOTE || 0;
                                change.comment.min += threadStateMap[thread].MIN_COMMENT || 0;
                                change.comment.max += threadStateMap[thread].MAX_COMMENT || 0;
                            }); */

                            change.comment.day =
                                (daily.comment.at(-1) - daily.comment.at(-2)) /
                                (daily.comment.at(-2) == 0 ? 1 : daily.comment.at(-2));
                            change.vote.day =
                                (daily.vote.at(-1) - daily.vote.at(-2)) / (daily.vote.at(-2) == 0 ? 1 : daily.vote.at(-2));

                            change.comment.week =
                                (daily.comment.at(-1) - daily.comment.at(-7)) /
                                (daily.comment.at(-7) == 0 ? 1 : daily.comment.at(-7));
                            change.vote.week =
                                (daily.vote.at(-1) - daily.vote.at(-7)) / (daily.vote.at(-7) == 0 ? 1 : daily.vote.at(-7));

                            change.comment.month =
                                (daily.comment.at(-1) - daily.comment[0]) / (daily.comment[0] == 0 ? 1 : daily.comment[0]);
                            change.vote.month =
                                (daily.vote.at(-1) - daily.vote[0]) / (daily.vote[0] == 0 ? 1 : daily.vote[0]);

                            return {
                                symbol: x.symbol,
                                daily,
                                name,
                                change,
                                quantity,
                                threads,
                                verb,
                                type,
                                chart: await this.generateChart(x.daily.vote, `${x.symbol}${x.type}`)
                            };
                        })
                )
            ).filter(
                x =>
                    x.quantity.vote.day > 20 ||
                    x.quantity.comment.day > 20 ||
                    x.quantity.vote.week > 20 ||
                    (x.quantity.comment.week > 20 && x.type == type)
            );
            /* .map(x => {
                    const { daily, ...key } = x;
                    return {
                        ...key,
                        name: stockDict[x.symbol]
                    };
                }); */
            //.sort((a: any, b: any) => b.change.vote.max - a.change..vote.max);

            await this.cache.set(`${CACHE.SYMBOL}${type}`, result);
            end = Math.min(page + per_page, result.length);
            //return { data: result.slice(page, end), total: result.length };
            return result;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    //@RequestAuth
    @POST('/symbol')
    saveSymbols(req: Request) {
        let symbols = req.body;
        return this.symbolService.insert(symbols);
    }

    //@RequestAuth
    @PUT('/symbol')
    updateSymbols(req: Request) {
        let symbol = { ...req.body };
        return this.symbolService.update(symbol);
    }

    //@RequestAuth
    @DELETE('/symbol')
    deleteSymbol(req: Request) {
        let symbol = { ...req.body };
        //Log(symbol)
        return this.symbolService.delete(symbol);
    }

    @GET('/symbol/day')
    // Define the function with a Request parameter and a Promise that resolves to an array of Symbol objects
    async getDailySymbol(req: Request): Promise<Symbol[]> {
        // Extract the date parameter from the request query string
        const date = req.query.date as string;
        // Parse the date parameter to a Date object set to midnight
        const start = parseToMidnight(date);

        // Initialize empty maps to store symbols of each type
        const otherMap = {};
        const stockMap = {};
        const cryptoMap: Record<string, Symbol> = {};
        const titleMap = {};

        // Query the threadStateController for daily thread states within the specified date range
        const threadStates = await this.threadStateController.getDailybyDateRange(start);

        Log(threadStates[0]);
        // Iterate over each thread state and extract symbols from the title
        for (const threadState of threadStates) {
            const { id, title, vote, comment } = threadState;

            // Only process each thread id once
            if (!titleMap[id]) {
                // Query the tagController to get arrays of stock, crypto, other, and verb symbols from the thread title
                const { stockArr, cryptoArr, otherArr, verbArr } = await this.tagController.getSymbol(
                    title.replace('&amp;', '&')
                );

                // Process each stock symbol
                for (const stock of stockArr) {
                    if (!stockMap[stock])
                        stockMap[stock] = {
                            symbol: stock,
                            created: start,
                            threads: [],
                            verb: [],
                            type: 'stock',
                            vote: vote,
                            comment: comment
                        };
                    stockMap[stock].threads = [...new Set([...stockMap[stock].threads, id])];
                    stockMap[stock].verb = [...new Set([...stockMap[stock].verb, ...verbArr])];
                }

                // Process each other symbol
                for (const other of otherArr) {
                    if (!otherMap[other])
                        otherMap[other] = {
                            symbol: other,
                            created: start,
                            threads: [],
                            verb: [],
                            type: 'other',
                            vote: vote,
                            comment: comment
                        };
                    otherMap[other].threads = [...new Set([...otherMap[other].threads, id])];
                    otherMap[other].verb = [...new Set([...otherMap[other].verb, ...verbArr])];
                }

                // Process each crypto symbol
                for (const crypto of cryptoArr) {
                    if (!cryptoMap[crypto])
                        cryptoMap[crypto] = {
                            symbol: crypto,
                            created: start,
                            threads: [],
                            verb: [],
                            type: 'crypto',
                            vote: vote,
                            comment: comment
                        };
                    cryptoMap[crypto].threads = [...new Set([...cryptoMap[crypto].threads, id])];
                    cryptoMap[crypto].verb = [...new Set([...cryptoMap[crypto].verb, ...verbArr])];
                }

                // Mark this thread id as processed
                titleMap[id] = true;
            }
        }

        // Combine all the symbol maps into a single array of Symbol objects
        return [
            ...(Object.values(stockMap) as Symbol[]),
            ...(Object.values(cryptoMap) as Symbol[]),
            ...(Object.values(otherMap) as Symbol[])
        ];
    }

    @GET('/symbol/day/insert')
    async handleDailySymbol(req: Request) {
        const symbols = await this.getDailySymbol(req);
        Log(symbols.length);
        return this.symbolService.insert(symbols);
    }

    @GET('/symbol/test')
    async test(req: Request) {
        return this.symbolService.test();
    }

    async generateChart(data, key) {
        //Log(data)
        const cashedChart = await this.cache.get(key);
        if (cashedChart) return cashedChart;

        //const data = (req.query.date as string).split(',').map(x => parseInt(x));
        const canvas = createCanvas(150, 60) as any as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        /* var gradient = ctx.createLinearGradient(0, 0, 0, 40);
        gradient.addColorStop(0, 'rgb(49, 56, 96)');
        gradient.addColorStop(1, 'rgba(49, 56, 96,0.7)'); */

        const options = {
            responsive: false,
            bezierCurve: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: 3
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        };
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, index) => index),
                datasets: [
                    {
                        data: data,
                        pointRadius: 0,
                        tension: 0.3,
                        borderWidth: 3,
                        borderColor: 'rgb(49, 56, 96)',
                        fill: false
                        //backgroundColor: gradient
                    }
                ]
            },
            options
        });
        const dataUrl = canvas.toDataURL();
        this.cache.set(key, dataUrl);
        return dataUrl;
    }
}
