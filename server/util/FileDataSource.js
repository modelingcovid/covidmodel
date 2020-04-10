import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {DataSource} from 'apollo-datasource';
import {InMemoryLRUCache} from 'apollo-server-caching';

const {DEBUG} = process.env;

const log = (...args) =>
  DEBUG && console.log(`[ ${chalk.yellow('cache')} ]`, ...args);

export class FileDataSource extends DataSource {
  constructor() {
    super();

    this.context;
    this.cache;
  }

  initialize(config) {
    this.context = config.context;
    this.cache = config.cache || new InMemoryLRUCache();
    this.promises = {};
  }

  getFile(filename, {decorate, ttl = 360} = {}) {
    return this.cache.get(filename).then((entry) => {
      if (entry) {
        log('hit:', filename);
        return Promise.resolve(entry);
      }

      const inFlight = this.promises[filename];
      if (inFlight) {
        log('in flight:', filename);
        return inFlight;
      }

      log('miss:', filename);
      const jsonPath = path.join(process.cwd(), `public/json/${filename}.json`);
      const promise = new Promise((resolve, reject) => {
        fs.readFile(jsonPath, (err, str) => {
          delete this.promises[filename];

          if (err) {
            log('error:', filename);
            return reject(err);
          }
          const result = JSON.parse(str);
          if (decorate) {
            decorate(result, filename);
          }

          if (result) {
            log('set:', filename);
            this.cache.set(filename, result, {ttl});
          }

          return resolve(result);
        });
      });
      this.promises[filename] = promise;
      return promise;
    });
  }
}
