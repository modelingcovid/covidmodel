import {timeFormat} from 'd3-time-format';

export const today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);

const dayInMs = 24 * 60 * 60 * 1000;
const dayZero = new Date('Dec 31, 2019').getTime();

export const dayToDate = (day) => new Date(dayZero + dayInMs * day);

export const getDate = ({day}) => dayToDate(day);

export const formatDate = timeFormat('%B %-d, %Y');
