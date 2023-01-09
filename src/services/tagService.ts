import axios from 'axios';
import RedisCache from './redisCache';
import { Inject, Injectable } from '../lib/decorators';
import symbolDict from '../variable/symbolDict.json' assert { type: 'json' };
import tagWithoutSpace from '../variable/tagWithoutSpace.json' assert { type: 'json' };
import tagWithSpace from '../variable/tagWithSpace.json' assert { type: 'json' };

@Injectable
export default class TagService {
    @Inject(RedisCache)
    private readonly cacheService: RedisCache;
    private readonly tagWithSpace: Set<string>;
    private readonly tagWithoutSpace: Set<string>;
    private symbolDict: Map<string, string>;
    readonly maxSpace = 4;

    constructor() {
        this.tagWithSpace = new Set(tagWithSpace);
        this.tagWithoutSpace = new Set(tagWithoutSpace);
        this.cacheService.set('symbolDict', symbolDict);
        this.cacheService.get('symbolDict').then(cache => {
            this.symbolDict = new Map(Object.entries(cache || {}));
        });
    }

    /**
     * Gets an array of strings that are tags that contain spaces.
     *
     * @param {string} s - The string to search for tags.
     * @returns {string[]} An array of strings that are tags that contain spaces.
     */
    getTagWithSpace(s: string): string[] {
        let result = [];
        let left = 0;
        let right = 2;
        let newS = s.split(' ');
        while (left != right) {
            const subString = newS.slice(left, right).join(' ');
            if (this.tagWithSpace.has(subString)) result.push(subString);
            if (right < newS.length) {
                if (right - left == this.maxSpace) {
                    left++;
                    right = left + 2;
                } else {
                    right++;
                }
            } else {
                left++;
            }
        }
        return result;
    }

    /**
     * Gets an array of strings that are tags that do not contain spaces.
     *
     * @param {string} s - The string to search for tags.
     * @returns {string[]} An array of strings that are tags that do not contain spaces.
     */
    getTagWithoutSpace(s: string): string[] {
        let result = [];
        let newS = s.split(' ');
        newS.forEach(_s => {
            if (this.tagWithoutSpace.has(_s)) result.push(_s);
        });
        return result;
    }

    /* getTag(s: string, toString = true): string[] | string {
        s = s.toLowerCase();
        const tags = [...new Set([...this.getTagWithSpace(s), ...this.getTagWithoutSpace(s)]).values()];
        if (toString) return JSON.stringify(tags);
        return tags;
    }  */

    /**
     * Gets an array of tags from a given string, or a string representation of the array.
     *
     * @param {string} s - The string to search for tags.
     * @param {boolean} [toString=false] - Whether to return the tags as a string or as an array.
     * @returns {(string[]|string)} An array of tags or a string representation of the array.
     * @throws {Error} If there is an issue with the request to the NLTK service.
     */
    async getTag(s: string, toString = false): Promise<string[] | string> {
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
                    console.log(err);
                    return [];
                })
        );
    }

    /**
     * Returns a list of symbols for the given list of words.
     * @param {string[]} s - List of words to get symbols for.
     * @returns {Promise<string[]>} - List of symbols for the given words.
     */
    async getSymbols(s: string[]): Promise<string[]> {
        if (!this.symbolDict) {
            const cache = await this.cacheService.get('symbolDict');
            this.symbolDict = new Map(Object.entries(cache));
        }

        const result = [];
        for (const _s of s) {
            if (this.symbolDict.has(_s)) {
                result.push(this.symbolDict.get(_s));
            }
        }
        return result;
    }
}
