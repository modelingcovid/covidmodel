import fs from 'fs';
import path from 'path';
import {performance} from 'perf_hooks';
import {states, stateLabels} from '../format/location';
import {applyDeep, round4} from './transform';

const roundData = applyDeep(
  (n) => (typeof n === 'number' ? round4(n) : n),
  true
);

export const decorateLocation = (data, location) => {
  roundData(data);
  data.id = location;
  data.name = stateLabels[location] || location;
  data.path = `cwd '${process.cwd()}' ls '${fs
    .readdirSync(path.join(process.cwd(), '.next/serverless/pages/api'))
    .toString()}'`;
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
