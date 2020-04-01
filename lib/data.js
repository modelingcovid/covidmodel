import fs from 'fs';
import path from 'path';
import {states} from './controls';

export const getStateData = (state) => {
  const jsonPath = path.join(process.cwd(), `public/json/${state}.json`);
  return JSON.parse(fs.readFileSync(jsonPath));
};

export const getStatesWithData = () => {
  return fs
    .readdirSync('./public/json')
    .map((filename) => filename.replace('.json', ''))
    .filter((state) => states.includes(state));
};
