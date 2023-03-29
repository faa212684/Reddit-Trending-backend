import moment from 'moment';
import { Request } from 'express';
/**
 * Formats the given timestamp to the nearest 30 minute interval.
 * @param {number} date - The timestamp to format.
 * @returns {number} The formatted timestamp.
 */
export default function timeFormat(date: number) {
    const duration = moment.duration(30, 'minutes');
    return moment(Math.round(+date / +duration) * +duration).valueOf() - 1000;
}

export function parseToMidnight(date: Date | string): Date {
    if (!date) date = new Date();
    if (typeof date == 'string') date = new Date(date);
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

/**
 * Get start and end dates from a request object, with default values set to 30 days ago and today, respectively.
 * @param {Request} req - The request object containing start and end query parameters.
 * @param {number} day - The number of days to go back if no start date is provided.
 * @returns {Date[]} An array containing the start and end dates.
 */
export function getStartEndDate(req: Request, day = 7): Date[] {
    // Extract start and end parameters from the request query string
    const start = req.query.start as string;
    const end = req.query.end as string;

    // Set default values for start and end if they are not provided
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - day);

    const startDate = start ? new Date(start) : thirtyDaysAgo;
    const endDate = end ? new Date(end) : today;

    // Return an array containing the start and end dates
    return [parseToMidnight(startDate), parseToMidnight(endDate)];
}
