import fs from 'fs';
import path from 'path';
import csv from 'csvtojson';
import {states, stateLabels} from './controls';

export const readJson = (filename) => {
  const jsonPath = path.join(process.cwd(), `public/json/${filename}.json`);
  return JSON.parse(fs.readFileSync(jsonPath));
};

export const readCsv = async (filename) => {
  const csvPath = path.join(process.cwd(), `tests/${filename}.csv`);
  try {
    const data = await csv().fromFile(csvPath);
    return data;
  } catch (e) {
    console.error(e);
  }
};

export const getStatesWithData = () => {
  return readJson('locations');
};

export const getTopoJsonUS = () => {
  return readJson('states-albers-10m');
};

const backtestIntervals = [3, 7, 11, 15, 19, 23];

export const getBacktestResults = async () => {
  const resultsByInterval = await Promise.all(
    backtestIntervals.map(async (c) => {
      const data = await readCsv(`backtest_${c}_days`);
      return {[`${c}_days`]: data};
    })
  );
  return resultsByInterval.reduce((acc, c) => ({...acc, ...c}), {});
};
