import axios from 'axios';
import RedisCache from './redisCache';
import { Inject, Injectable } from '../lib/decorators';
import stockName from '../variable/stockName.json' assert { type: 'json' };
import stockSymbol from '../variable/stockSymbol.json' assert { type: 'json' };
import cryptoDict from '../variable/crypto.json' assert { type: 'json' };
import Log from 'log4fns';

export interface Tag {
    noun: string[];
    verb: string[];
}

@Injectable
export default class TagService {
    @Inject(RedisCache)
    private readonly cacheService: RedisCache;
    private readonly stockName: Record<string, string>;
    private readonly cryptoDict: Record<string, string>;
    private readonly stockSymbol: Record<string, string>;

    constructor() {
        this.stockName = stockName;
        this.stockSymbol = stockSymbol;
        this.cryptoDict = cryptoDict;
    }

    /**
     * Gets an array of tags from a given string, or a string representation of the array.
     *
     * @param {string} s - The string to search for tags.
     * @param {boolean} [toString=false] - Whether to return the tags as a string or as an array.
     * @returns {(string[]|string)} An array of tags or a string representation of the array.
     * @throws {Error} If there is an issue with the request to the NLTK service.
     */
    async getTag(s: string, toString = false): Promise<Tag | string> {
        //const {[replacedWords, newSentence]} = processSentence(s);
        return axios
            .get('http://nltk_prod:5005', { params: { string: s } }) //nltk_dev_2
            //.get('http://nltk_dev:5004', { params: { string: s } }) //nltk_dev_2
            .then(({ data }) => {
                //data.noun = s; //data.noun.concat(replacedWords);
                if (toString) {
                    return JSON.stringify(data);
                } else {
                    return data;
                }
            })
            .catch(err => {
                console.log(err);
                Log('get tag fail');
                return [];
            });
    }

    /**
     * Returns a list of symbols for the given list of words.
     * @param {string[]} s - List of words to get symbols for.
     * @returns {Promise<string{}>} - List of symbols for the given words.
     */
    async extractSymbols(
        words: string[],
        symbols: string[],
        uppercaseWords: string[]
    ): Promise<{ stockArr: string[]; cryptoArr: string[]; otherArr: string[] }> {
        const result = {
            stockArr: [],
            otherArr: [],
            cryptoArr: []
        };
        for (let w of [...new Set([...uppercaseWords, ...words])]) {
            w = w.toLowerCase();
            if (this.cryptoDict[w]) result.cryptoArr.push(this.cryptoDict[w]);
            if (this.stockName[w]) {
                //Log(w);
                result.stockArr.push(this.stockName[w]);
            } else if (this.stockSymbol[w]) {
                result.stockArr.push(this.stockSymbol[w]);
            }
        }

        for (const w of symbols) {
            if (this.stockSymbol[w]) {
                //Log(w);
                result.stockArr.push(this.stockSymbol[w]);
            }
            if (this.cryptoDict[w]) result.cryptoArr.push(this.cryptoDict[w]);
        }
        return result;
    }

    // Useless, actually get the same result from nltk
}
