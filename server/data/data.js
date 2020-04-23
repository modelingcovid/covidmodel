import {states, stateLabels} from '../format/location';
import {applyDeep, round4} from './transform';

const roundData = applyDeep(
  (n) => (typeof n === 'number' ? round4(n) : n),
  false
);

const series = (data) => {
  const rounded = roundData(data);
  return {
    raw: data,
    data: rounded,
    empty: rounded.every((n) => !n),
    min: Math.min(...rounded),
    max: Math.max(...rounded),
    length: rounded.length,
  };
};

export const decorateLocationSummary = (data, locationId) => {
  data.id = locationId;
  data.name = stateLabels[locationId] || locationId;
};

export const decorateScenarioSummary = (data, locationId) => {
  data.locationId = locationId;
};

export const decorateSeries = (data) => {
  return series(data);
};

export const decorateDistribution = (data) => {
  const result = {};
  Object.keys(data[0]).forEach((key) => {
    result[key] = series(data.map((d) => d[key]));
  });
  return result;
};

export function cumulativeToDailySeries(cumulative) {
  return series(
    cumulative.raw.map((value, i) => {
      const prev = cumulative.raw[i - 1] || 0;
      return Math.max(0, value - prev);
    })
  );
}

export function cumulativeToDailyDistribution(cumulative) {
  const daily = {};
  Object.entries(cumulative).forEach(([key, value]) => {
    daily[key] = cumulativeToDailySeries(value);
  });
  return daily;
}
