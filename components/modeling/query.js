import {useMemo} from 'react';
import useSWR from 'swr';
import {useModelState} from './useModelState';

export const createLocationQuery = (location, query) =>
  `{ location(id: "${location}") ${query} }`;

export const createScenarioQuery = (scenario, query) =>
  `{ scenario(id: "${scenario}") ${query} }`;

export function useLocations(query = '') {
  const {data, error} = useSWR(`{
      locations {
        id
        name
        ${query}
      }
    }`);
  return [data?.locations || [], error];
}

export function useLocationQuery(query) {
  const {location} = useModelState();
  const {data, error} = useSWR(createLocationQuery(location.id, query));
  return [data?.location, error];
}

export function useScenarioQuery(query) {
  const {scenario} = useModelState();
  const [data, error] = useLocationQuery(
    createScenarioQuery(scenario.id, query)
  );
  return [data?.scenario, error];
}

export function useDistributionQuery(distribution, query) {
  const [data, error] = useScenarioQuery(`{ ${distribution} ${query} }`);
  return [(data && data[distribution]) || null, error];
}

const compactSeries = [
  'expected',
  'confirmed',
  'percentile10',
  'percentile50',
  'percentile90',
];

const fullSeries = [
  ...compactSeries,
  'percentile20',
  'percentile30',
  'percentile40',
  'percentile60',
  'percentile70',
  'percentile80',
];

export function useDistribution(distribution, series = fullSeries) {
  const [data, error] = useDistributionQuery(
    distribution,
    `{ ${series
      .map(
        (s) => `${s} {
          max
          min
          data
          empty
        }`
      )
      .join('\n')} }`
  );
  const fns = useMemo(() => {
    if (!data) {
      return;
    }
    const result = {};
    for (let [key, series] of Object.entries(data)) {
      result[key] = (_, i) => series.data[i];
      Object.assign(result[key], series);
    }
    return result;
  }, [data]);
  return [fns, error];
}
