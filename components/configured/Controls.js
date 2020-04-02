import * as React from 'react';
import {useRouter} from 'next/router';
import {Select} from '../Select';
import {stateLabels, scenarioLabels, scenarios} from '../../lib/controls';
import {theme} from '../../styles';

const {useCallback} = React;

export function Controls({
  children,
  state,
  states,
  scenario,
  setScenario,
  ...props
}) {
  const {push} = useRouter();
  const onStateChange = useCallback(
    (state) => push('/state/[state]', `/state/${state}`),
    [push]
  );
  return (
    <div style={{display: 'flex'}} {...props}>
      <Select
        label="Location"
        placeholder="Choose a location…"
        value={state}
        values={states}
        valueToString={stateLabels}
        onChange={onStateChange}
      />
      <div style={{width: theme.spacing[2]}} />
      <Select
        label="Scenario"
        placeholder="Select a scenario…"
        value={scenario}
        values={scenarios}
        valueToString={scenarioLabels}
        onChange={setScenario}
      />
    </div>
  );
}
