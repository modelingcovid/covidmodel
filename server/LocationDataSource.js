import {decorateLocation} from './data';
import {FileDataSource} from './util';

export class LocationDataSource extends FileDataSource {
  get(location) {
    return this.getFile(location, {
      decorate: decorateLocation,
    });
  }
}
