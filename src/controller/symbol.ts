import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Symbol } from '../services/symbol';
import SymbolService from '../services/symbol';
import symbolDict from '../variable/symbolDict.json' assert { type: 'json' };
import { ThreadController } from '../services';
import type { ThreadState } from '../services';
import ThreadStateController from './threadState';
import { parseToMidnight, getDaysDifference } from '../lib/timeFormat';
import TagController from './tag';
import Chart from 'chart.js/auto';
import { createCanvas } from 'canvas';
import ChartJsImage from 'chartjs-to-image';

const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

function combineStrings(s1, s2) {
    if (!s1) return s2;
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
        const today = parseToMidnight(new Date());
        const monthsAgo = new Date();
        monthsAgo.setDate(today.getDate() - 2);
        return this.symbolService.get(monthsAgo);
    }

    @GET('/symbol')
    async getAllSymbol(req: Request) {
        try {
            const page = parseInt(req.query.page as string) || 0;
            const sort = (req.query.sort as string) || 'vote';
            let result = await this.cache.get(CACHE.SYMBOL);
            let end = page + 25;
            if (result) {
                Log('return from cache');
                end = Math.min(page + 25, result.length);
                return {
                    data: result.sort((a, b) => b.change[sort] - a.change[sort]).slice(page, end),
                    total: result.length
                };
            }

            result = {};
            let today = parseToMidnight(new Date());
            const monthsAgo = new Date();
            monthsAgo.setDate(today.getDate() - 30);
            const symbols = await this.symbolService.get(monthsAgo);

            for (const _symbol of symbols) {
                const { symbol, created, threads, verb, vote, comment } = _symbol;
                if (!result[symbol])
                    result[symbol] = {
                        symbol,
                        threads: null,
                        verb: '',
                        counter: {
                            vote: 0,
                            comment: 0
                        },
                        date: Array(30).fill(0),
                        daily: Array(30).fill(0)
                    };

                const diff = 29 - getDaysDifference(today, new Date(created));
                result[symbol].daily[diff] = vote;
                result[symbol].date[diff] = created;
                result[symbol].threads = combineStrings(result[symbol].threads, threads);
                result[symbol].verb = combineStrings(result[symbol].verb, verb);
                result[symbol].counter.vote += vote;
                result[symbol].counter.comment += comment;
            }

            result = (
                await Promise.all(
                    Object.values(result)
                        //.slice(0,10)
                        .map(async (x: any) => ({
                            ...x,
                            change: {
                                daily: x.daily.at(-1) - x.daily.at(-2),
                                dailyPercentage:
                                    x.daily.at(-1) == 0 ? 0 : (x.daily.at(-1) - x.daily.at(-2)) / x.daily.at(-1),
                                month: x.daily.at(-1) - x.daily[0],
                                monthPercentage: x.daily[0] == 0 ? 0 : (x.daily.at(-1) - x.daily[0]) / x.daily[0]
                            },
                            threads: [...new Set(x.threads.split(','))],
                            chart: await this.generateChart(x.daily, `${x.symbol}${x.type}`)
                        }))
                )
            ).sort((a: any, b: any) => b.change.daily - a.change.daily);

            await this.cache.set(CACHE.SYMBOL, result);
            end = Math.min(page + 25, result.length);
            return { data: result.slice(page, end), total: result.length };
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
    async getDailySymbol(req: Request): Promise<Symbol[]> {
        const date = req.query.date as string;
        const start = parseToMidnight(date);

        const stockMap = {};
        const cryptoMap: Record<string, Symbol> = {};
        const threadStates = await this.threadStateController.getDailybyDateRange(start);
        const titleMap = {};
        //Log(threadStates.length)
        for (const threadState of threadStates) {
            const { id, title, vote, comment } = threadState;
            if (!titleMap[id]) {
                const [stockArr, cryptoArr, otherArr, verbArr] = await this.tagController.getSymbol(
                    title.replace('&amp;', '&')
                );
                //Log(stockArr.length,cryptoArr.length)
                for (const stock of stockArr) {
                    if (!stockMap[stock])
                        stockMap[stock] = {
                            symbol: stock,
                            created: start,
                            threads: [],
                            verb: [],
                            type: 'stock',
                            vote,
                            comment
                        };
                    stockMap[stock].threads = [...new Set([...stockMap[stock].threads, id])];
                    stockMap[stock].verb = [...new Set([...stockMap[stock].verb, ...verbArr])];
                }
                for (const crypto of cryptoArr) {
                    if (!cryptoMap[crypto])
                        cryptoMap[crypto] = {
                            symbol: crypto,
                            created: start,
                            threads: [],
                            verb: [],
                            type: 'crypto',
                            vote,
                            comment
                        };
                    cryptoMap[crypto].threads = [...new Set([...cryptoMap[crypto].threads, id])];
                    cryptoMap[crypto].verb = [...new Set([...cryptoMap[crypto].verb, ...verbArr])];
                }
                titleMap[id] = true;
            }
        }

        return [...(Object.values(stockMap) as Symbol[]), ...(Object.values(cryptoMap) as Symbol[])]; //.filter(x=>x.threads.length>3).map(x=>x.symbol)
    }

    @GET('/symbol/day/insert')
    async handleDailySymbol(req: Request) {
        const symbols = await this.getDailySymbol(req);
        Log(symbols.length);
        return this.symbolService.insert(symbols);
    }

    async generateChart(data, key) {
        //Log(data)
        const cashedChart = await this.cache.get(key);
        if (cashedChart) return cashedChart;

        //const data = (req.query.date as string).split(',').map(x => parseInt(x));
        const canvas = createCanvas(150, 40) as any as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        var gradient = ctx.createLinearGradient(0, 0, 0, 40);
        gradient.addColorStop(0, 'rgb(49, 56, 96)');
        gradient.addColorStop(1, 'rgba(49, 56, 96,0.7)');

        const options = {
            responsive: false,
            bezierCurve: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
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
                        fill: true,
                        backgroundColor: gradient
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
