import {utcFormat} from 'd3-time-format';
import {scaleUtc} from '@vx/scale';

export const today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);

export const initialTargetDate = new Date('Aug 01, 2020').getTime();

const dayInMs = 24 * 60 * 60 * 1000;
const dayZero = new Date('Dec 31, 2019').getTime();

export const addDays = (date, days) =>
  new Date(date.getTime() + dayInMs * days);

export const dayToDate = (day) => new Date(dayZero + dayInMs * day);

export const getDate = ({day}) => dayToDate(day);

export const getFirstDate = (list) => getDate(list[0]);
export const getLastDate = (list) => getDate(list[list.length - 1]);

export const isYear = (date) => date.getUTCMonth() === 0;

const averageMonthLength = 365 / 12;
export const daysToMonths = (days) => days / averageMonthLength;

export const createDateScale = (range = 1) =>
  scaleUtc({
    domain: [
      new Date('2020-01-01').getTime(),
      new Date('2021-01-01').getTime(),
    ],
    range: [0, range],
  });

export const dateScale = createDateScale();
