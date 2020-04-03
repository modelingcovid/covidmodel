import * as React from 'react';
import {Label} from '../content';

export const MethodLabel = ({method}) => {
  switch (method) {
    case 'modeled':
      return <Label>Projection</Label>;
    case 'fit':
      return <Label color="purple">Fit to model</Label>;
    case 'input':
      return (
        <Label className="text-gray-light" color="gray">
          Model input
        </Label>
      );
    default:
      return null;
  }
};
