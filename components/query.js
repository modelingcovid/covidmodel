import {wrap} from 'optimism';
import {useModelState, DistributionSeriesFullFragment} from './modeling';
import {fetchSuspendable} from '../lib/fetch';

const toQueryString = (
  location,
  scenario,
  [type, query, transforms, fragments = []]
) => {
  let body = query;
  switch (type) {
    case 'Location':
      body = `{
        location(id: "${location}") ${query}
      }`;
      break;
    case 'Scenario':
      body = `{
        location(id: "${location}") {
          scenario(id: "${scenario}") ${query}
        }
      }`;
      break;
  }
  return Array.from(new Set([...fragments, body])).join('\n');
};

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

export const SeriesFull = [
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

export const DistributionSeriesFull = [
  ...SeriesFull,
  `fragment DistributionSeriesFull on DistributionSeries {
    ${mapBlock(fullDistributionProps, '...SeriesFull')}
  }`,
];

const queries = [
  [
    'Query',
    `{
      locations {
        id
        name
      }
    }`,
    {locations: ({locations}) => locations},
  ],
  [
    'Location',
    `{
      importtime
      r0
      scenarios {
        id
        name
        distancingLevel
        distancingDays
      }
    }`,
    {
      r0: (location) => location.r0,
      importtime: (location) => location.importtime,
      scenarios: (location) => location.scenarios,
    },
  ],
  [
    'Scenario',
    `{
      day { data }
      distancing { data }
    }`,
    {
      days: ({day}) => day.data,
      distancing: ({distancing}, i) => distancing.data[i],
    },
  ],
  [
    'Scenario',
    `{
      cumulativeDeaths { ...DistributionSeriesFull }
      cumulativeRecoveries { ...DistributionSeriesFull }
      currentlyInfected { ...DistributionSeriesFull }
      currentlyInfectious { ...DistributionSeriesFull }
      susceptible { ...DistributionSeriesFull }
    }`,
    {},
    DistributionSeriesFull,
  ],
  [
    'Location',
    `{
      domain {
        cumulativeDeaths { expected { max } }
        currentlyInfected { expected { max } }
        currentlyInfectious { expected { max } }
      }
    }`,
    {
      seirDomain: ({
        domain: {cumulativeDeaths, currentlyInfected, currentlyInfectious},
      }) =>
        cumulativeDeaths.expected.max +
        currentlyInfected.expected.max +
        currentlyInfectious.expected.max,
    },
  ],
];

const getTypeAccessor = (type, request) => {
  switch (type) {
    case 'Location':
      return () => request().location;
    case 'Scenario':
      return () => request().location.scenario;
    case 'Query':
    default:
      return request;
  }
};

export const fetchLocationData = wrap(function fetchLocationData(
  location,
  scenario
) {
  const requests = {};
  for (let query of queries) {
    const [type, queryString, transforms] = query;
    const request = fetchSuspendable(toQueryString(location, scenario, query));
    const typeAccessor = getTypeAccessor(type, request);

    for (let [key, transform] of Object.entries(transforms)) {
      requests[key] = (...args) => transform(typeAccessor(), ...args);
    }
  }
  return requests;
});
