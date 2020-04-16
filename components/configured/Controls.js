import * as React from 'react';
import {StateSelect} from './StateSelect';
import {ScenarioSelect} from './ScenarioSelect';
import {Suspense} from '../util';
import {theme} from '../../styles';

export function Controls(props) {
  return (
    <div style={{display: 'flex', height: '34px'}} {...props}>
      <Suspense fallback={<div />}>
        <StateSelect />
        <div style={{width: theme.spacing[3]}} />
        <ScenarioSelect />
      </Suspense>
    </div>
  );
}
