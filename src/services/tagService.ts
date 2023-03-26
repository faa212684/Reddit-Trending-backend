import axios from 'axios';
import RedisCache from './redisCache';
import { Inject, Injectable } from '../lib/decorators';
import stockDict from '../variable/stock.json' assert { type: 'json' };
import cryptoDict from '../variable/crypto.json' assert { type: 'json' };
import Log from 'log4fns';

export interface Tag {
    adj: string[];
    noun: string[];
    verb: string[];
}

@Injectable
export default class TagService {
    @Inject(RedisCache)
    private readonly cacheService: RedisCache;
    private readonly stockDict: Record<string, string>;
    private readonly cryptoDict: Record<string, string>;

    constructor() {
        this.stockDict = stockDict;
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
        return (
            axios
                .get('http://nltk:5004', { params: { string: s } })
                //return fetch(`http://nltk_dev:5005?string=${s}`)
                //.then(response => response.json())
                .then(({ data }) => {
                    if (toString) {
                        return JSON.stringify(data);
                    } else {
                        return data;
                    }
                })
                .catch(err => {
                    Log('get tag fail');
                    return [];
                })
        );
    }

    /**
     * Returns a list of symbols for the given list of words.
     * @param {string[]} s - List of words to get symbols for.
     * @returns {Promise<string{}>} - List of symbols for the given words.
     */
    async extractSymbols(words: string[]): Promise<{ stock: string[]; crypto: string[]; other: string[] }> {
        const result = {
            stock: [],
            other: [],
            crypto: []
        };

        for (const w of words) {
            if (this.cryptoDict[w]) result.crypto.push(this.cryptoDict[w]);
            if (this.stockDict[w]) {
                result.stock.push(this.stockDict[w]);
            } else {
                result.other.push(w);
            }
        }
        return result;
    }

    // Useless, actually get the same result from nltk
    replaceSpecialChars(input: string): string {
        const specialChars = /[^a-zA-Z0-9]/g;
        return input.replace(specialChars, ' ').toLowerCase()//.split(' ');
    }
}
