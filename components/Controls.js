import * as React from 'react';
import {useRouter} from 'next/router';
import {Select} from './Select';
import {stateLabels, scenarioLabels, scenarios} from '../lib/controls';

const {useCallback} = React;

export const Controls = ({
  children,
  state,
  states,
  scenario,
  setScenario,
  ...props
}) => {
  const {push} = useRouter();
  const onStateChange = useCallback((e) => push(`/state/${e.target.value}`), [
    push,
  ]);
  const onScenarioChange = useCallback((e) => setScenario(e.target.value), [
    setScenario,
  ]);
  return (
    <div {...props}>
      <div>
        <Select
          value={state}
          values={states}
          label={stateLabels}
          onChange={onStateChange}
        >
          {(current) => (
            <>
              If <span className="underline-blue">{current}</span>
            </>
          )}
        </Select>
      </div>
      <div>
        <Select
          value={scenario}
          values={scenarios}
          label={scenarioLabels}
          onChange={onScenarioChange}
        >
          {(current) => (
            <>
              <span className="underline-yellow">{current}</span>
            </>
          )}
        </Select>
      </div>
    </div>
  );
};
