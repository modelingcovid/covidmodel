import {decorateLocation} from './data';
import {ObjectDataSource} from './util';

export class CoreDataSource extends ObjectDataSource {
  defaultTtl = 3600;

  _get(filename, options) {
    const origin = this.context.origin;
    const url = `${origin}/json/${filename}.json`;
    return this.query(url, options);
  }

  json(filename) {
    return this._get(filename);
  }

  location(location) {
    return this._get(location, {decorate: decorateLocation});
  }
}
