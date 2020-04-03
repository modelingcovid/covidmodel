import * as React from 'react';
import {Label} from '../content';

export const MethodLabel = ({method, ...props}) => {
  switch (method) {
    case 'modeled':
      return <Label {...props}>Projection</Label>;
    case 'fit':
      return <Label {...props}>Fit to model</Label>;
    case 'input':
      return <Label {...props}>Model input</Label>;
    default:
      return null;
  }
};
