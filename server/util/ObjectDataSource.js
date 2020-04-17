import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {DataSource} from 'apollo-datasource';
import {InMemoryLRUCache} from 'apollo-server-caching';
import fetch from 'isomorphic-unfetch';

const {DEBUG} = process.env;

const log = (...args) =>
  DEBUG && console.log(`[ ${chalk.yellow('cache')} ]`, ...args);

export class ObjectDataSource extends DataSource {
  defaultTtl = null;

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

  fetch(path) {
    return fetch(path).then((resp) => resp.json());
  }

  query(key, options = {}) {
    const {decorate} = options;
    const ttl = options.ttl ?? this.defaultTtl;

    return this.cache.get(key).then((entry) => {
      if (entry) {
        log('hit:', key);
        return Promise.resolve(entry);
      }

      const inFlight = this.promises[key];
      if (inFlight) {
        log('in flight:', key);
        return inFlight;
      }

      log('miss:', key);

      const promise = this.fetch(key)
        .then((data) => {
          const result = decorate ? decorate(data, key) ?? data : data;

          if (result) {
            log('set:', key);
            this.cache.set(key, result, {ttl});
          }
          return result;
        })
        .finally(() => {
          delete this.promises[key];
        });

      this.promises[key] = promise;
      return promise;
    });
  }
}
