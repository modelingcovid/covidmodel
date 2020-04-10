import {formatMonths, formatPercent} from './format';

export function getScenarioLabel(
  {distancingDays, distancingLevel, name},
  currentDistancingLevel
) {
  const duration =
    distancingDays > 365
      ? 'indefinitely'
      : `for ${formatMonths(distancingDays)} months`;

  if (distancingLevel === 1) {
    return 'Return to normal with no distancing';
  }
  if (distancingLevel === currentDistancingLevel) {
    return `Continue the current distancing level ${duration}`;
  }
  if (distancingLevel < currentDistancingLevel) {
    // I know this looks weird, distancing level is inverted.
    return `Increase distancing to ${name} levels ${duration}`;
  }
  if (distancingLevel > currentDistancingLevel) {
    // I know this looks weird, distancing level is inverted.
    return `Decrease distancing to ${name} levels ${duration}`;
  }
  return 'Unknown distancing';
}

export function getScenarioSummary({distancingDays, distancingLevel}) {
  const duration =
    distancingDays > 365
      ? 'indefinitely'
      : `for ${formatMonths(distancingDays)} months`;
  return distancingLevel === 1
    ? 'no distancing'
    : `${formatPercent(1 - distancingLevel)} distancing ${duration}`;
}
