import * as React from 'react';
import {StateSelect} from './StateSelect';
import {ScenarioSelect} from './ScenarioSelect';
import {theme} from '../../styles';

export function Controls(props) {
  return (
    <div style={{display: 'flex'}} {...props}>
      <StateSelect />
      <div style={{width: theme.spacing[3]}} />
      <ScenarioSelect />
    </div>
  );
}
