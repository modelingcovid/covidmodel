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

export function getDistancingDate(distancingDays, offset = 0) {
  return addDays(today, distancingDays + offset);
}

export function createFormatDistancingDuration(verbosity) {
  return function formatDistancingDuration({distancingDays, id}) {
    const isTerse = verbosity === 'terse';
    if (id === 'scenario7') {
      const endDate = formatShortCalendarDate(
        getDistancingDate(distancingDays)
      );
      switch (verbosity) {
        case 'verbose':
          return `until May 10, gradually decrease until ${endDate}`;
        case 'terse':
          return endDate;
        default:
          return `until May 10,\ndecreasing until ${endDate}`;
      }
    }
    if (distancingDays > 365) {
      return 'indefinitely';
    }
    const months = daysToMonths(distancingDays);
    if (months >= 2) {
      const monthStr = `${formatNumber(months)} months`;
      return isTerse ? monthStr : `for ${monthStr}`;
    }
    const dateStr = formatShortCalendarDate(addDays(today, distancingDays));
    return isTerse ? dateStr : `until ${dateStr}`;
  };
}

export const formatDistancingDuration = createFormatDistancingDuration(
  'regular'
);
export const formatDistancingDurationTerse = createFormatDistancingDuration(
  'terse'
);
export const formatDistancingDurationVerbose = createFormatDistancingDuration(
  'verbose'
);

export function getScenarioLabel(
  {id, distancingDays, distancingLevel, name},
  currentDistancingLevel
) {
  const duration = formatDistancingDurationVerbose({distancingDays, id});

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
  const duration = formatDistancingDurationVerbose({distancingDays, id});
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

export function formatDistancingLevel({distancingLevel}) {
  return formatPercent(1 - distancingLevel);
}

export function formatScenarioName({name}) {
  return name;
}

export function formatScenario(scenario) {
  const {id, distancingDays, distancingLevel} = scenario;
  if (distancingLevel === 1) {
    return 'Return to normal';
  }
  const duration = formatDistancingDuration(scenario);
  const amount = formatDistancingLevel(scenario);
  return `${amount} distancing ${duration}`;
}
