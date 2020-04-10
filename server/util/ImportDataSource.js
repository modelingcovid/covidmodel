import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {DataSource} from 'apollo-datasource';
import {InMemoryLRUCache} from 'apollo-server-caching';

const {DEBUG} = process.env;

const log = (...args) =>
  DEBUG && console.log(`[ ${chalk.yellow('cache')} ]`, ...args);

export class ImportDataSource extends DataSource {
  constructor() {
    super();

    this.context;
    this.cache;
  }

  initialize(config) {
    this.context = config.context;
    this.cache = config.cache || new InMemoryLRUCache();
    this.import = config.import || this.import;
    this.promises = {};
    this.decorated = new WeakMap();
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

      const promise = this.import(filename).then((result) => {
        delete this.promises[filename];
        if (decorate) {
          const isObject = result instanceof Object;
          if (!isObject || !this.decorated.has(result)) {
            decorate(result, filename);

            if (isObject) {
              this.decorated.set(result, true);
            }
          }
        }

        if (result) {
          log('set:', filename);
          this.cache.set(filename, result, {ttl});
        }
        return result;
      });

      this.promises[filename] = promise;
      return promise;
    });
  }
}
