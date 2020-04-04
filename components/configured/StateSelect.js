import * as React from 'react';
import {useRouter} from 'next/router';
import {Select} from '../Select';
import {stateLabels} from '../../lib/controls';

const {useCallback} = React;

export function StateSelect({state, states, ...props}) {
  const {push} = useRouter();
  const onStateChange = useCallback(
    (state) => push('/state/[state]', `/state/${state}`),
    [push]
  );
  return (
    <Select
      label="Location"
      placeholder="Choose a location…"
      value={state}
      values={states}
      valueToString={stateLabels}
      onChange={onStateChange}
      {...props}
    />
  );
}
