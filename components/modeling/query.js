import {useMemo} from 'react';
import useSWR from 'swr';
import {useFetch} from '../util';
import {useModelState} from './useModelState';

export const createLocationQuery = (location, query) =>
  `{ location(id: "${location}") ${query} }`;

export const createScenarioQuery = (scenario, query) =>
  `{ scenario(id: "${scenario}") ${query} }`;

export function useLocations(input = '') {
  const query = `{
    locations {
      id
      name
      ${input}
    }
  }`;
  const {data, error} = useSWR(query);
  const accessor = useFetch(query);
  return [data?.locations || [], error, accessor];
}

export function useLocationQuery(input, fragments = []) {
  const {location} = useModelState();
  const query = Array.from(
    new Set([...fragments, createLocationQuery(location.id, input)])
  ).join('\n');
  const {data, error} = useSWR(query);
  const accessor = useFetch(query);
  return [data?.location, error, accessor];
}

export function useScenarioQuery(query, fragments = []) {
  const {scenario} = useModelState();
  const [data, error, accessor] = useLocationQuery(
    createScenarioQuery(scenario.id, query),
    fragments
  );
  return [data?.scenario, error, accessor];
}

export const compactDistributionProps = [
  'expected',
  'confirmed',
  'percentile10',
  'percentile50',
  'percentile90',
];

export const fullDistributionProps = [
  ...compactDistributionProps,
  'percentile20',
  'percentile30',
  'percentile40',
  'percentile60',
  'percentile70',
  'percentile80',
];

export function createSeries(series) {
  if (!series) {
    return () => null;
  }
  const result = (i) => series.data[i];
  Object.assign(result, series);
  return result;
}

export function createDistributionSeries(distribution) {
  const result = {};
  fullDistributionProps.forEach((propName) => {
    result[propName] = createSeries(distribution && distribution[propName]);
  });
  return result;
}

export const SeriesFullFragment = [
  `fragment SeriesFull on Series {
    data
    empty
    max
    min
  }`,
];

export function mapBlock(propNames, block) {
  return propNames
    .map(
      (propName) => `${propName} {
        ${block}
      }`
    )
    .join('\n');
}

export const DistributionSeriesFullFragment = [
  ...SeriesFullFragment,
  `fragment DistributionSeriesFull on DistributionSeries {
    ${mapBlock(fullDistributionProps, '...SeriesFull')}
  }`,
];

export const PopulationFragment = [
  `fragment Population on Location {
    population
  }`,
];

export function usePopulation() {
  const [data, error, accessor] = useLocationQuery(`{ population }`);
  return [data?.population, error, accessor];
}

export function useDistancing() {
  const [scenario, error, accessor] = useScenarioQuery(`{
    distancing {
      data
    }
  }`);

  return [createSeries(scenario?.distancing), error, accessor];
}
