import * as React from 'react';
import {StateSelect} from './StateSelect';
import {Select} from '../Select';
import {scenarioLabels, scenarios} from '../../lib/controls';
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
  return (
    <div style={{display: 'flex'}} {...props}>
      {/* <StateSelect states={states} />
      <div style={{width: theme.spacing[3]}} /> */}
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
