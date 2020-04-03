import * as React from 'react';
import {Definition} from '../content';
import {MethodLabel} from './MethodLabel';

export const MethodDefinition = ({method, ...remaining}) => (
  <Definition
    {...remaining}
    before={method && <MethodLabel method={method} />}
  />
);
