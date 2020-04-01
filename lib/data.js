import fs from 'fs';
import path from 'path';
import {states} from './controls';

const stateData = {};
const stateMtime = {};

export const getStateData = (state) => {
  const jsonPath = path.join(process.cwd(), `public/json/${state}.json`);
  const stats = fs.statSync(jsonPath);
  if (!stateData[state] || stateMtime[state] !== stats.mtimeMs) {
    stateMtime[state] = stats.mtimeMs;
    stateData[state] = JSON.parse(fs.readFileSync(jsonPath));
  }
  return stateData[state];
};

export const getStatesWithData = () => {
  return fs
    .readdirSync('./public/json')
    .map((filename) => filename.replace('.json', ''))
    .filter((state) => states.includes(state));
};
