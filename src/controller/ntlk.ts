import axios from 'axios';
import { GET, Injectable } from '../lib/decorators';

@Injectable
export default class NtlkController {
    @GET('/ntlk/dev')
    getMemoryUsage() {
        return axios
            .get('http://nltk_dev2_2:5004/memory_usage') //nltk_dev_2
            .then(({ data }) => {
                return data;
            })
            .catch(err => {
                console.log(err);
                return [];
            });
    }

    @GET('/ntlk/prod')
    getMemoryUsageProd() {
        return axios
            .get('http://nltk_prod:5005/memory_usage') //nltk_dev_2
            .then(({ data }) => {
                return data;
            })
            .catch(err => {
                console.log(err);
                return [];
            });
    }
}
