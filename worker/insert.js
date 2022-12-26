const dotenv = require('dotenv').config();
const Worker = require('./worker');
const path = require('path');
const fs = require('fs');
const worker = new Worker([
    'SPACs',
    'stocks',
    'wallstreetbets',
    'CryptoCurrency',
    'investing',
    'robinhood',
    'SatoshiStreetBets',
    'pennystocks',
    'robinhood'
]);
worker.insertFail()

