import fs from 'fs';
import path from 'path';

// The data is a big file, we memoize reading it.
let data = null;
let mtime = null;

export const getAllData = () => {
  const jsonPath = path.join(process.cwd(), 'public/json/model.json');
  const stats = fs.statSync(jsonPath);
  if (!data || mtime !== stats.mtimeMs) {
    mtime = stats.mtimeMs;
    data = JSON.parse(fs.readFileSync(jsonPath));
    console.log('got data', Object.keys(data));
  }
  return data;
};

export const getStateData = (state) => getAllData()[state] || null;
