import {formatMonths} from './format';

export const stateLabels = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District Of Columbia',
  FM: 'Federated States Of Micronesia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MH: 'Marshall Islands',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PW: 'Palau',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Islands',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

export const stateCodes = {};
for (let [code, name] of Object.entries(stateLabels)) {
  stateCodes[name] = code;
}

export const states = Object.keys(stateLabels);

export function getScenarioLabel(
  {distancingDays, distancingLevel, name},
  currentDistancingLevel
) {
  const months = `${formatMonths(distancingDays)} months`;
  if (distancingLevel === 1) {
    return 'Return to normal with no distancing';
  }
  if (distancingLevel === currentDistancingLevel) {
    return `Continue the current distancing level for ${months}`;
  }
  if (distancingLevel < currentDistancingLevel) {
    // I know this looks weird, distancing level is inverted.
    return `Increase distancing to ${name} levels for ${months}`;
  }
  if (distancingLevel > currentDistancingLevel) {
    // I know this looks weird, distancing level is inverted.
    return `Decrease distancing to ${name} levels for ${months}`;
  }
  return 'Unknown distancing';
}

