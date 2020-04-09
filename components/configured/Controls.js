import * as React from 'react';
import {StateSelect} from './StateSelect';
import {Select} from '../Select';
import {useModelData} from '../modeling';
import {getScenarioLabel} from '../../lib/controls';
import {theme} from '../../styles';

const {useMemo} = React;

export function Controls({children, ...props}) {
  const {model, scenario, setScenario, state, states} = useModelData();

  const scenarioIds = Object.keys(model.scenarios);
  const scenarios = Object.values(model.scenarios);

  const currentScenario = useMemo(
    () => scenarios.find(({name}) => name === 'Current'),
    [scenarios]
  );
  const currentDistancingLevel = currentScenario.distancingLevel;

  const scenarioLabels = useMemo(() => {
    const result = {};
    scenarios.forEach((scenario) => {
      result[scenario.id] = getScenarioLabel(scenario, currentDistancingLevel);
    });
    return result;
  }, [currentDistancingLevel, scenarios]);

  return (
    <div style={{display: 'flex'}} {...props}>
      <StateSelect states={states} />
      <div style={{width: theme.spacing[3]}} />
      <Select
        label="Scenario"
        placeholder="Select a scenario…"
        value={scenario}
        values={scenarioIds}
        valueToString={scenarioLabels}
        onChange={setScenario}
      />
    </div>
  );
}
