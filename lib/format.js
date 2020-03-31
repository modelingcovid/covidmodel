import {format} from 'd3-format';
import {utcFormat} from 'd3-time-format';

export const formatNumber = format(',.0f');
export const formatNumber2 = format(',.0f');
export const formatPercent = format(',.0%');
export const formatPercent1 = format(',.1%');
export const formatPercent2 = format(',.2%');

export const formatDate = utcFormat('%B %-d, %Y');
export const formatShortDate = utcFormat('%b %-d, %Y');
export const formatYear = utcFormat('%Y');
export const formatShortMonth = utcFormat('%b');

export const formatLargeNumber = (value) =>
  value >= 1000000
    ? `${formatNumber(Math.round(value / 100000) / 10)}M`
    : formatNumber(value);
