import fs from 'fs';
import path from 'path';
import {performance} from 'perf_hooks';
import {states, stateLabels} from '../format/location';
import {applyDeep, round4} from './transform';

const roundData = applyDeep(
  (n) => (typeof n === 'number' ? round4(n) : n),
  true
);

const series = (data) => ({
  data,
  empty: data.every((n) => !n),
  min: Math.min(...data),
  max: Math.max(...data),
});

export const decorateLocation = (data, location) => {
  data.id = location;
  data.name = stateLabels[location] || location;

  const scenarios = Object.values(data.scenarios);
  data.domain = {};

  scenarios.forEach((scenario) => {
    const {timeSeriesData} = scenario;

    // Derive data from existing data.
    timeSeriesData.forEach((d) => {
      d.cumulativeExposed = {};
      Object.keys(d.currentlyInfected).forEach((key) => {
        d.cumulativeExposed[key] =
          d.currentlyInfected[key] +
          d.currentlyInfectious[key] +
          d.cumulativeRecoveries[key] +
          d.cumulativeDeaths[key];
      });
      d.cumulativeExposed.confirmed = 0;
    });
  });

  ['day', 'distancing'].forEach((key) => {
    scenarios.forEach((scenario) => {
      scenario[key] = series(scenario.timeSeriesData.map((d) => d[key]));
    });
    const min = Math.min(...scenarios.map((s) => s[key].min));
    const max = Math.max(...scenarios.map((s) => s[key].max));
    data.domain[key] = {min, max};
  });
  [
    'cumulativeCritical',
    'cumulativeDeaths',
    'cumulativeExposed',
    'cumulativeHospitalized',
    'cumulativePcr',
    'cumulativeRecoveries',
    'cumulativeReportedHospitalized',
    'currentlyCritical',
    'currentlyHospitalized',
    'currentlyInfected',
    'currentlyInfectious',
    'currentlyReportedHospitalized',
    'dailyPcr',
    'dailyTestsRequiredForContainment',
    'susceptible',
  ].forEach((key) => {
    const percentiles = Object.keys(scenarios[0].timeSeriesData[0][key]);
    percentiles.forEach((percentile) => {
      scenarios.forEach((scenario) => {
        scenario[key] = scenario[key] ?? {};
        scenario[key][percentile] = series(
          scenario.timeSeriesData.map((d) => d[key][percentile])
        );
      });

      const min = Math.min(...scenarios.map((s) => s[key][percentile].min));
      const max = Math.max(...scenarios.map((s) => s[key][percentile].max));
      data.domain[key] = data.domain[key] ?? {};
      data.domain[key][percentile] = {min, max};
    });
  });

  roundData(data);
  return data;
};

export const getLocations = () => {
  return fs
    .readdirSync('./public/json')
    .map((filename) => filename.replace('.json', ''))
    .filter((state) => states.includes(state));
};

export const getTopoJsonUS = () => {
  return readJson('states-albers-10m');
};
