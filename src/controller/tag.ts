import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Tag } from '../services/tagService';
import TagService from '../services/tagService';

@Injectable
export default class TagController {
    @Inject(TagService)
    private readonly tagService: TagService;

    @GET('/tag')
    async getSymbolFromRequest(req: Request) {
        const title = req.query.title as string;
        return this.getSymbol(title);
    }

    async getSymbol(title: string /* req: Request */) {
        //const title = req.query.title as string;
        const { symbols, uppercaseWords, newSentence } = processSentence(replaceSpecialChars(title));
        //Log({ symbols, uppercaseWords, newSentence });
        const tags = (await this.tagService.getTag(newSentence)) as Tag;
        //Log(tags);
        const { stockArr, cryptoArr, otherArr } = await this.tagService.extractSymbols(tags.noun, symbols, uppercaseWords);
        return {stockArr, cryptoArr, otherArr, verbArr:tags.verb};
    }
}

function processSentence(sentence) {
    // Split the sentence into an array of words
    const words = sentence.split(' ');

    // Initialize arrays for the three results
    const symbols = [];
    const uppercaseWords = [];
    const remainingWords = [];

    for (const word of words) {
        if (word.startsWith('$')) {
            symbols.push(word.toLowerCase().replace(/^\$/, ''));
        } else if (word === word.toUpperCase() && word.length>1 && /^[^0-9]*$/.test(word)) {
            uppercaseWords.push(word.toLowerCase());
        } else {
            remainingWords.push(word);
        }
    }
    return {
        symbols,
        uppercaseWords,
        newSentence: remainingWords.join(' ')
    };
}

function replaceSpecialChars(input: string): string {
    const specialChars = /[^a-zA-Z0-9$,]/g;
    return input.replace(specialChars, ' '); //.split(' ');
}
