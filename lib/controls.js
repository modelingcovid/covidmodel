import {addDays, daysToMonths, today} from './date';
import {formatNumber, formatPercent, formatShortCalendarDate} from './format';

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

export function getDistancingDate(distancingDays) {
  return addDays(today, distancingDays);
}

export function formatDistancingDuration(distancingDays, id, verbosity) {
  if (id === 'scenario7') {
    const endDate = formatShortCalendarDate(getDistancingDate(distancingDays));
    switch (verbosity) {
      case 'verbose':
        return `until May 1, gradually decrease until ${endDate}`;
      case 'terse':
      default:
        return `until May 1,\ndecreasing until ${endDate}`;
    }
  }
  if (distancingDays > 365) {
    return 'indefinitely';
  }
  const months = daysToMonths(distancingDays);
  if (months >= 2) {
    return `for ${formatNumber(months)} months`;
  }
  const distancingDate = addDays(today, distancingDays);
  return `until ${formatShortCalendarDate(distancingDate)}`;
}

export function getScenarioLabel(
  {id, distancingDays, distancingLevel, name},
  currentDistancingLevel
) {
  const duration = formatDistancingDuration(distancingDays, id, 'verbose');

  switch (getRelativeDistancing(distancingLevel, currentDistancingLevel)) {
    case 'none':
      return 'Return to normal with no distancing';
    case 'current':
      return `Continue distancing at current levels ${duration}`;
    case 'increase':
      return `Increase distancing to ${name} levels ${duration}`;
    case 'decrease':
      return `Decrease distancing to ${name} levels ${duration}`;
    default:
      return '';
  }
}

export function formatLongScenario(
  {id, distancingDays, distancingLevel},
  currentDistancingLevel
) {
  const duration = formatDistancingDuration(distancingDays, id, 'verbose');
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

export function formatScenario({id, distancingDays, distancingLevel}) {
  if (distancingLevel === 1) {
    return 'No distancing';
  }
  const duration = formatDistancingDuration(distancingDays, id, 'terse');
  const amount = formatPercent(1 - distancingLevel);
  return `${amount} distancing ${duration}`;
}
