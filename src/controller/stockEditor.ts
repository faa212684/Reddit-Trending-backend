import stockDict from '../variable/stockName.json' assert { type: 'json' };
import Log from 'log4fns';
import { Request } from 'express';
import { Cache, DELETE, GET, Inject, Injectable, ParseQueryParams, POST, PUT, RequestAuth } from '../lib/decorators';
import type { QueryParams } from '../lib/reqParser';
import RedisCache from '../services/redisCache';
import type { Tag } from '../services/tagService';
import TagService from '../services/tagService';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Injectable
export default class stockEditor {
    @GET('/stockjson')
    async getStockJson(req: Request) {
        return stockDict;
    }

    @DELETE('/stockjson')
    async deleteKey(req: Request) {
        const key = req.query.key as string;
        Log(key);
        if (key && stockDict.hasOwnProperty(key)) {
            delete stockDict[key];
            // Save the updated data object to a JSON file
            fs.writeFile(__dirname + '/../variable/stock2.json', JSON.stringify(stockDict), err => {
                if (err) {
                    console.error(err);
                    return 'Error saving data to file';
                } else {
                    return `Deleted key "${key}" and saved updated data to file`;
                }
            });
        }
    }
}
