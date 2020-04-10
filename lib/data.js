import fs from 'fs';
import path from 'path';
import {states} from './controls';

export const readJson = (filename) => {
  const jsonPath = path.join(process.cwd(), `public/json/${filename}.json`);
  return JSON.parse(fs.readFileSync(jsonPath));
};

const applyDeep = (fn) => {
  const applyFn = (input) => {
    if (Array.isArray(input)) {
      return input.map(applyFn);
    } else if (input && typeof input === 'object') {
      const result = {};
      for (let [key, value] of Object.entries(input)) {
        result[key] = applyFn(value);
      }
      return result;
    } else {
      return fn(input);
    }
  };
  return applyFn;
};

const roundTo = (precision) => {
  const multiplier = Math.pow(10, precision);
  return (n) => Math.round(n * multiplier) / multiplier;
};

const round4 = roundTo(4);

const roundStateData = applyDeep((n) =>
  typeof n === 'number' ? round4(n) : n
);

export const getStateData = (state) => {
  return roundStateData(readJson(state));
};

export const getStatesWithData = () => {
  return ['CA', 'NY'];
  return fs
    .readdirSync('./public/json')
    .map((filename) => filename.replace('.json', ''))
    .filter((state) => states.includes(state));
};

export const getStateOverviewData = (state) => {
  const stateData = getStateData(state);
  const overview = {...stateData, scenarios: {}};
  const {scenarios} = stateData;
  for (let [name, scenarioData] of Object.entries(scenarios)) {
    overview.scenarios[name] = {...scenarioData};
    delete overview.scenarios[name].timeSeriesData;
  }
  return overview;
};

export const getOverviewData = () => {
  const overview = {};
  getStatesWithData().forEach((state) => {
    overview[state] = getStateOverviewData(state);
  });
  return overview;
};

export const getTopoJsonUS = () => {
  return readJson('states-albers-10m');
};
