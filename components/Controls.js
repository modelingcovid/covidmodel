import * as React from 'react';
import {useRouter} from 'next/router';
import {Select} from './Select';
import {stateLabels, scenarioLabels, scenarios} from '../lib/controls';

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
  // const onScenarioChange = useCallback((e) => setScenario(e.target.value), [
  //   setScenario,
  // ]);
  return (
    <div className="controls" {...props}>
      <style jsx>{`
        .controls {
          display: flex;
        }
        .spacer {
          width: var(--spacing-02);
        }
      `}</style>
      <Select
        label="Location"
        placeholder="Choose a location…"
        value={state}
        values={states}
        valueToString={stateLabels}
        onChange={onStateChange}
      />
      <div className="spacer" />
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
