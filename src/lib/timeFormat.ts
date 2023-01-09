import moment from 'moment';

/**
 * Formats the given timestamp to the nearest 30 minute interval.
 * @param {number} date - The timestamp to format.
 * @returns {number} The formatted timestamp.
 */
export default function timeFormat(date: number) {
    const duration = moment.duration(30, 'minutes');
    return moment(Math.round(+date / +duration) * +duration).valueOf() - 1000;
}
