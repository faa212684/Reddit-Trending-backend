const axios = require('axios');
const fs = require('fs');
const Log = require('log4fns').default;
const path = require('path');
const moment = require('moment');

const THREADS = 'threads';
const THREADSTAT = 'threadsStat';
const ENDPOINT = 'https://api.rtrend.site/api';

function timeAdjust(date, getMS = false) {
    const duration = moment.duration(30, 'minutes');
    const result = moment(Math.round(+date / +duration) * +duration).valueOf();
    //Log(result)
    if (getMS) return result;
    return new Date(result);
}

function containsDailyAndDiscussion(str) {
    str=str.toLowerCase()
    return str.includes('daily') && str.includes('discussion');
  }

class Worker {
    constructor(forums, insertDBInterval = 1800, scrapeInterval = 600) {
        //this.createFile()
        this.token = '';
        this.forums = forums || [];
        this.insertDBInterval = insertDBInterval; // insertDBInterval in second
        this.scrapeInterval = scrapeInterval;
        this.insertTimeStamp = 0;
        this.last = {
            scrape: 0,
            insertDB: 0
        };
        this.counter = {
            success: 0,
            fail: 0
        };
        this.data = {
            threads: {},
            threadsStat: {}
        };
    }

    createFile() {
        fs.mkdirSync('./store/cache', { recursive: true });
        fs.mkdirSync('./store/fail', { recursive: true });
        fs.mkdirSync('./store/finish', { recursive: true });

        fs.writeFile(`./store/cache/${THREADSTAT}.json`, '[]', { flag: 'wx' }, function (err) {
            if (err) return console.log(`cache/${THREADSTAT}.json created`);
            console.log(`cache/${THREADSTAT}.json exist`);
        });
        fs.writeFile(`./store/cache/${THREADS}.json`, '[]', { flag: 'wx' }, function (err) {
            if (err) return console.log(`cache/${THREADS}.json created`);
            console.log(`cache/${THREADS}.json exist`);
        });
    }

    start() {
        this.data.threadsStat = require(`./store/cache/${THREADSTAT}.json`);
        this.data.threads = require(`./store/cache/${THREADS}.json`);

        this.getLatest();
        this.updateTimeStamp();
        this.handleInsertDB();
        this.handleScrape();
    }

    async handleInsertDB() {
        Log(timeAdjust(this.last.insertDB + this.insertDBInterval * 1000, true) - Date.now());

        //const timeOffset = this.insertDBInterval * 1000 - (Date.now() - this.last.insertDB);

        const timeOffset = timeAdjust(this.last.insertDB + this.insertDBInterval * 1000, true) - Date.now();
        if (timeOffset <= 0) {
            Log('start insert into DB');
            this.backup()
            setTimeout(() => this.handleInsertDB(), this.insertDBInterval * 1000);
            await this.insertDB(THREADSTAT);
            await this.insertDB(THREADS);
            this.last.insertDB = Date.now();
            this.updateLatest();
            this.updateTimeStamp();
            
            Log('Insert DB at ', this.formatDate(timeAdjust(Date.now() + this.insertDBInterval * 1000)));
        } else {
            Log('Insert DB after ', timeOffset / 1000, 's, at ', this.formatDate(Date.now() + timeOffset));
            setTimeout(() => this.handleInsertDB(), timeOffset);
        }
    }

    updateTimeStamp() {
        //this.insertTimeStamp = new Date((this.last.insertDB || new Date()) + this.insertDBInterval * 1000);
        this.insertTimeStamp = timeAdjust((this.last.insertDB || new Date()) + this.insertDBInterval * 1000);
        Log('insertTimeStamp', this.formatDate(this.insertTimeStamp));
    }

    async handleScrape() {
        if (!this.last) this.getLatest();
        const timeOffset = this.scrapeInterval * 1000 - (Date.now() - this.last.scrape);
        if (timeOffset <= 0) {
            this.last.scrape = Date.now();
            this.updateLatest();
            setTimeout(() => this.handleScrape(), this.scrapeInterval * 1000);
            for (const forum of this.forums) {
                await this.getByForum(forum);
            }
            //this.forums.forEach(forum => this.getByForum(forum));
            Log('Scraping at ', this.formatDate(Date.now() + this.scrapeInterval * 1000));
        } else {
            setTimeout(() => this.handleScrape(), timeOffset);
            Log('Scraping after ', timeOffset / 1000, 's, at ', this.formatDate(Date.now() + timeOffset));
        }
    }

    async retrieveToken() {
        Log('Retrieving token from server');
        const option = {
            method: 'post',
            url: ENDPOINT + '/token',
            data: {
                username: process.env.USERNAME,
                password: process.env.PASSWORD
            }
        };
        await axios(option)
            .then(res => {
                this.token = res.data.token;
                Log('Retrieve token success');
            })
            .catch(err => {
                Log('Retrieve token fail');
                Log(err.message);
            });
    }

    getLatest() {
        const last = require('./last.json');
        if (!'scrape' in last) last.scrape = Date.now();
        if (!'insertDB' in last) last.insertDB = Date.now();
        Log('Last scrape:', this.formatDate(last.scrape), ', last DB insertion: ', this.formatDate(last.insertDB));
        this.last = last;
    }

    formatDate(s) {
        return new Date(s).toLocaleString('en-US', {
            timeZone: 'America/Vancouver'
        });
    }

    updateLatest() {
        fs.writeFileSync('last.json', JSON.stringify(this.last));
    }

    cache() {
        fs.writeFileSync(`./store/cache/${THREADSTAT}.json`, JSON.stringify(this.data.threadsStat));
        fs.writeFileSync(`./store/cache/${THREADS}.json`, JSON.stringify(this.data.threads));
    }

    backup() {
        fs.writeFileSync(`./store/backup/${this.insertTimeStamp}_${THREADSTAT}.json`, JSON.stringify(this.data.threadsStat));
        fs.writeFileSync(`./store/backup/${this.insertTimeStamp}_${THREADS}.json`, JSON.stringify(this.data.threads));
    }

    clearCache(target) {
        fs.writeFileSync(`store/cache/${target}.json`, '{}');
    }

    async getByForum(forum) {
        Log('Getting ', forum);
        const url = `https://reddit.com/r/${forum}.json`;
        await axios(url)
            .then(res => {
                const threads = res.data.data.children;
                threads.forEach(thread => {
                    const id = thread.data.id;

                    if (!this.data.threadsStat[id]) this.data.threadsStat[id] = {};
                    this.data.threadsStat[id] = {
                        id: thread.data.id,
                        vote: thread.data.score,
                        comment: thread.data.num_comments,
                        forum: thread.data.subreddit,
                        updated: this.insertTimeStamp
                    };

                    if (!this.data.threads[id]) this.data.threads[id] = {};
                    this.data.threads[id] = {
                        id: thread.data.id,
                        title: thread.data.title,
                        created: new Date(thread.data.created_utc * 1000),
                        forum: thread.data.subreddit,
                        author: thread.data.author
                    };
                    this.data.threads[id].isDailyDiscussion = containsDailyAndDiscussion(thread.data.title);
                });
                this.cache();
            })
            .catch(err => {
                Log(err.message);
            });
    }

    saveFail(target, data) {
        //fs.appendFileSync(`./store/fail/${target}.json`, JSON.stringify(data)+",\n");
        fs.writeFileSync(`./store/fail/${this.insertTimeStamp}_${target}.json`, JSON.stringify(data));
    }

    async insertFail() {
        const files = fs.readdirSync('store/fail');
        for (const file of files) {
            const [timeStamp, target] = file.replace('.json', '').split('_');
            const data = require(path.join(__dirname, 'store/fail', file));
            const statusCode = await this.insertDB(target, data, true);
            if (statusCode == 200) {
                Log('Insert : ', file, ' success');
                fs.renameSync(path.join(__dirname, 'store/fail', file), path.join(__dirname, 'store/finish', file));
            } else if (statusCode == 400) {
                Log('Insert : ', file, ' success');
            } else {
                Log('Insert : ', file, ' fail, status code:',statusCode);
                //return;
            }
        }
    }

    async insertDB(target, data = null, saveFromFail = false) {
        if (!data) {
            if (Object.keys(this.data[target]).length == 0) return Log(`Empty target ${target}`);
            data = Object.keys(this.data[target]).map(key => ({ ...this.data[target][key], id: key }));
        }
        if (!this.token) await this.retrieveToken();

        const url = ENDPOINT + `/${target}`;
        const option = {
            method: 'POST',
            url: url,
            headers: { Authorization: `Bearer ${this.token}` },
            data: {
                thread: data
            }
        };
        return axios(option)
            .then(res => {
                Log(`Save ${target}: ${res.data.slice(0, 4)}... success`);
                return 200;
            })
            .catch(async err => {
                if (err.response) {
                    if (err.response.status === 401) {
                        Log("Authentication fail, try again")
                        await this.retrieveToken();
                        await this.insertDB(target, data, saveFromFail);
                    }
                }
                Log(`Save ${target} fail`);
                //console.log(err)
                if (!saveFromFail) this.saveFail(target, data);                
                return false;
            })
            .finally(()=>{
                this.clearCache(target);
                this.data[target] = {};
            })
    }
}

module.exports = Worker;
