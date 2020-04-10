import {decorateLocation} from './data';
import {ImportDataSource} from './util';

export class LocationDataSource extends ImportDataSource {
  import(filename) {
    return import(`./json/${filename}.json`).then((json) => json.default);
  }

  get(location) {
    return this.getFile(location, {
      decorate: decorateLocation,
    });
  }
}
