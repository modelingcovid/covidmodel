import {wrap} from 'optimism';
import {useModelState} from './modeling';
import {fetchMap} from '../lib/fetch';
// import {CaseProgressionScenarioFragment} from './CaseProgressionCurve';
// import {SEIRScenarioFragment} from './SEIR';

const toQueryString = (location, scenario, [type, query, fragments = []]) => {
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

// const getScenarioQueries = wrap((location, scenario) => {
//   const onScenario = withScenario(location, scenario);
//   return {
//     // SEIR: toQuery(SEIRScenarioFragment, onScenario('{ ...SEIRScenario }')),
//     // CaseProgression: toQuery(
//     //   CaseProgressionScenarioFragment,
//     //   onScenario('{ ...CaseProgressionScenario }')
//     // ),
//   };
// });

const queries = {
  locations: [
    'Query',
    `{
      locations {
        id
        name
      }
    }`,
  ],
  summary: [
    'Location',
    `{
      importtime
      r0
      scenarios {
        id
        name
        day {
          data
        }
        distancingLevel
        distancingDays
      }
    }`,
  ],
  distancing: [
    'Scenario',
    `{
      distancing {
        data
      }
    }`,
  ],
};

const getQueryStrings = wrap(function getQueryStrings(location, scenario) {
  const result = {};
  for (let [key, query] of Object.entries(queries)) {
    result[key] = toQueryString(location, scenario, query);
  }
  return result;
});

export const fetchLocationData = wrap(function fetchLocationData(
  location,
  scenario
) {
  const requests = fetchMap(getQueryStrings(location, scenario));
  return {
    // locations
    locations: () => requests.locations.locations,
    // summary
    r0: () => requests.summary.location.r0,
    importtime: () => requests.summary.location.importtime,
    scenarios: () => requests.summary.location.scenarios,
    days: () => {
      const scenarios = requests.summary.location.scenarios;
      return scenarios.find(({id}) => id === scenario).day.data;
    },
    // distancing
    distancing: (i) => requests.distancing.location.scenario.distancing.data[i],
  };
});
