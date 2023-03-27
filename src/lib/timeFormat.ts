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

export function parseToMidnight(date: Date|string): Date {
    if (typeof date=="string") date = new Date(date)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getNextDayWithSameTime(date: Date): Date {
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    return nextDay;
}

export function getDaysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.round(timeDiff / oneDay);
    return diffDays;
  }