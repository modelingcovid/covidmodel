import {format} from 'd3-format';
import {utcFormat} from 'd3-time-format';
import {isYear} from './date';

export const formatNumber = format(',.0f');
export const formatNumber2 = format(',.2f');
export const formatPercent = format(',.0%');
export const formatPercent1 = format(',.1%');
export const formatPercent2 = format(',.2%');

// Includes a non-breaking space between the day and year.
export const formatDate = utcFormat('%B %-d, %Y');
export const formatFixedDate = utcFormat('%b %d, %Y');
export const formatShortDate = utcFormat('%b %-d, %Y');
export const formatYear = utcFormat('%Y');
export const formatShortMonth = utcFormat('%b');
export const formatDateAxis = (date) =>
  isYear(date) ? formatYear(date) : formatShortMonth(date);

export const formatLargeNumber = (value) =>
  value >= 1000000
    ? `${formatNumber(Math.round(value / 100000) / 10)}M`
    : formatNumber(value);

export const formatWhenEmpty = (format, empty) => (value) => {
  if (value) {
    return format(value);
  }
  return typeof empty === 'function' ? empty(value) : empty;
};

export const formatNA = (format) => formatWhenEmpty(format, 'N/A');

export function splitFirstWord(children, edge = 'start') {
  const isStart = edge === 'start';
  if (typeof children !== 'string') {
    return [null, children];
  }
  const index = isStart ? children.indexOf(' ') : children.lastIndexOf(' ');
  if (index === -1) {
    return [null, children];
  }
  const start = children.slice(0, index);
  const end = children.slice(index);
  return isStart ? [start, end] : [end, start];
}
