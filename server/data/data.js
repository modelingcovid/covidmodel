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

  Object.values(data.scenarios).forEach((scenario) => {
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

    ['day', 'distancing'].forEach((key) => {
      scenario[key] = series(timeSeriesData.map((d) => d[key]));
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
    ].forEach((distribution) => {
      scenario[distribution] = {};
      for (let [key, value] of Object.entries(
        timeSeriesData[0][distribution]
      )) {
        scenario[distribution][key] = series(
          timeSeriesData.map((d) => d[distribution][key])
        );
      }
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
