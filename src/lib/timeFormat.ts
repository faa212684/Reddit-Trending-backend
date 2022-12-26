import moment from 'moment';
export default function timeFormat(date: number) {
    const duration = moment.duration(30, 'minutes');
    return moment(Math.round(+date / +duration) * +duration).valueOf() - 1000;
}
