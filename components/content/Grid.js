import * as React from 'react';
import {theme} from '../../styles';

export const Grid = ({children, mobile = 2, desktop = 3, ...remaining}) => (
  <div {...remaining}>
    <style jsx>{`
      div {
        display: grid;
        grid-template-columns: repeat(${mobile}, minmax(0, 1fr));
        grid-gap: ${theme.spacing[1]};
        align-items: start;
      }
      @media (min-width: 600px) {
        div {
          grid-template-columns: repeat(${desktop}, minmax(0, 1fr));
          grid-gap: ${theme.spacing[3]};
        }
      }
    `}</style>
    {children}
  </div>
);
