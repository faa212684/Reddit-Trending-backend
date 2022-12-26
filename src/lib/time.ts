import moment from 'moment';

export default function format(date: number): Date {
    const duration = moment.duration(30, 'minutes');
    return new Date(Math.ceil(+date / +duration) * +duration);
}
