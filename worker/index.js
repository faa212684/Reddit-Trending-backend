const LOG = require('log4fns');
const Worker = require('./worker');
const dotenv = require('dotenv');
dotenv.config();

const worker = new Worker([
    'SPACs',
    'stocks',
    'wallstreetbets',
    'CryptoCurrency',
    'investing',
    'robinhood',
    'SatoshiStreetBets',
    'pennystocks',
    'robinhood',
    'Wallstreetbetsnew',
    'WallStreetbetsELITE',
    'StockMarket',
    'options',
    'Daytrading',
    'Shortsqueeze',
    'Bitcoin'
]);

worker.start();
