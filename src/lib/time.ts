import moment from 'moment';

export default function format(date: number): Date {
    const duration = moment.duration(30, 'minutes');
    return new Date(Math.ceil(+date / +duration) * +duration);
}

export function timeAdjust(date, getMS = false) {
    const duration = moment.duration(30, 'minutes');
    const result = moment(Math.round(+date / +duration) * +duration).valueOf();
    //Log(result)
    if (getMS) return result;
    return new Date(result);
}

export function formatDate(s) {
    return new Date(s).toLocaleString('en-US', {
        timeZone: 'America/Vancouver'
    });
}
