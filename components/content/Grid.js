import * as React from 'react';
import {theme} from '../../styles';

export const Grid = ({children, ...remaining}) => (
  <div {...remaining}>
    <style jsx>{`
      div {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: ${theme.spacing[1]};
        align-items: start;
      }
      @media (min-width: 600px) {
        div {
          grid-template-columns: repeat(3, 1fr);
          grid-gap: ${theme.spacing[2]};
        }
      }
    `}</style>
    {children}
  </div>
);
