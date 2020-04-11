import * as React from 'react';
import {useRouter} from 'next/router';
import {useNavigateToLocation} from './useNavigateToLocation';
import {Select} from '../Select';
import {useCurrentLocation} from './useCurrentLocation';
import {useModelState} from '../modeling';
import {getScenarioLabel} from '../../lib/controls';

const {useMemo} = React;

export function ScenarioSelect({
  label = 'Scenario',
  placeholder = 'Select a scenario…',
  ...props
}) {
  const {scenario, scenarios, setScenario} = useModelState();
  const scenarioIds = scenarios.map(({id}) => id);

  const currentScenario = useMemo(
    () => scenarios.find(({name}) => name === 'Current'),
    [scenarios]
  );

  const ids = useMemo(() => scenarios.map(({id}) => id), [scenarios]);
  const nameMap = useMemo(() => {
    const result = {};
    const currentDistancingLevel = currentScenario?.distancingLevel;
    scenarios.forEach((scenario) => {
      result[scenario.id] = getScenarioLabel(scenario, currentDistancingLevel);
    });
    return result;
  }, [currentScenario, scenarios]);

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={scenario.id}
      values={ids}
      valueToString={nameMap}
      onChange={setScenario}
      {...props}
    />
  );
}
