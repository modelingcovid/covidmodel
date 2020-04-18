import {formatMonths, formatPercent} from './format';

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

export function getRelativeDistancing(distancingLevel, currentDistancingLevel) {
  if (distancingLevel === 1) {
    return 'none';
  }
  if (distancingLevel === currentDistancingLevel) {
    return 'current';
  }
  if (distancingLevel < currentDistancingLevel) {
    // I know this looks weird, distancing level is inverted.
    return 'increase';
  }
  if (distancingLevel > currentDistancingLevel) {
    // I know this looks weird, distancing level is inverted.
    return 'decrease';
  }
  return 'unknown';
}

export function formatDistancingDuration(distancingDays) {
  return distancingDays > 365
    ? 'indefinitely'
    : `for ${formatMonths(distancingDays)} months`;
}

export function getScenarioLabel(
  {distancingDays, distancingLevel, name},
  currentDistancingLevel
) {
  const duration = formatDistancingDuration(distancingDays);

  switch (getRelativeDistancing(distancingLevel, currentDistancingLevel)) {
    case 'none':
      return 'Return to normal with no distancing';
    case 'current':
      return `Continue the current distancing level ${duration}`;
    case 'increase':
      return `Increase distancing to ${name} levels ${duration}`;
    case 'decrease':
      return `Decrease distancing to ${name} levels ${duration}`;
    default:
      return '';
  }
}

export function formatLongScenario(
  {distancingDays, distancingLevel},
  currentDistancingLevel
) {
  const duration = formatDistancingDuration(distancingDays);
  const amount = formatPercent(1 - distancingLevel);

  switch (getRelativeDistancing(distancingLevel, currentDistancingLevel)) {
    case 'none':
      return 'the distancing level returns to normal';
    case 'current':
      return `the current distancing level continues ${duration}`;
    case 'increase':
      return `the distancing level increases to ${amount} ${duration}`;
    case 'decrease':
      return `the distancing level decreases to ${amount} ${duration}`;
    default:
      return '';
  }
}

export function formatScenario({distancingDays, distancingLevel}) {
  const duration = formatDistancingDuration(distancingDays);
  const amount = formatPercent(1 - distancingLevel);
  return `${amount} distancing ${duration}`;
}

export function formatShortScenario({distancingDays, distancingLevel}) {
  const duration = formatDistancingDuration(distancingDays);
  const amount = formatPercent(1 - distancingLevel);
  return `${amount} ${duration}`;
}
