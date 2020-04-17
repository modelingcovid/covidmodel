import {
  decorateLocationSummary,
  decorateScenarioSummary,
  decorateSeries,
  decorateDistribution,
} from './data';
import {ObjectDataSource} from './util';

export class CoreDataSource extends ObjectDataSource {
  defaultTtl = 3600;

  _get(filepath, options) {
    const origin = this.context.origin;
    const url = `${origin}/json/${filepath}.json`;
    return this.query(url, options);
  }

  json(filepath) {
    return this._get(filepath);
  }

  location(locationId) {
    return this._get(`${locationId}/summary`, {
      decorate: (data) => decorateLocationSummary(data, locationId),
    });
  }

  days(locationId) {
    return this._get(`${locationId}/days`, {
      decorate: (data) => decorateSeries(data),
    });
  }

  scenario(locationId, scenarioId) {
    return this._get(`${locationId}/${scenarioId}/meta`, {
      decorate: (data) => decorateScenarioSummary(data, locationId),
    });
  }

  series(seriesName, scenario) {
    const {id, locationId} = scenario;
    return this._get(`${locationId}/${id}/${seriesName}`, {
      decorate: (data) => decorateSeries(data),
    });
  }

  distribution(distributionName, scenario) {
    const {id, locationId} = scenario;
    return this._get(`${locationId}/${id}/${distributionName}`, {
      decorate: (data) => decorateDistribution(data),
    });
  }
}
