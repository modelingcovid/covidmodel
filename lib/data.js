import fs from 'fs';
import path from 'path';
import {states, stateLabels} from './controls';

export const readJson = (filename) => {
  const jsonPath = path.join(process.cwd(), `public/json/${filename}.json`);
  return JSON.parse(fs.readFileSync(jsonPath));
};

export const getStatesWithData = () => {
  return readJson('locations');
};

export const getTopoJsonUS = () => {
  return readJson('states-albers-10m');
};
