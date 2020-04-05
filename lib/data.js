import fs from 'fs';
import path from 'path';
import {states} from './controls';

export const readJson = (state) => {
  const jsonPath = path.join(process.cwd(), `public/json/${state}.json`);
  return JSON.parse(fs.readFileSync(jsonPath));
};

export const getStateData = readJson;

export const getStatesWithData = () => {
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
