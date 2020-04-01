import * as React from 'react';
import {breakpoint, theme} from '../styles';

export const Definition = ({children, value}) => (
  <div>
    <div
      style={{
        fontSize: theme.font.size.body,
        color: theme.color.gray[3],
      }}
      className="text-mono"
    >
      {value}
    </div>
    <div
      style={{
        fontSize: theme.font.size.small,
        color: theme.color.gray[2],
      }}
    >
      {children}
    </div>
  </div>
);

export const Definitions = ({children}) => (
  <div>
    <style jsx>{`
      div {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: ${theme.spacing[1]};
      }
      ${breakpoint.tabletUp} {
        grid-template-columns: repeat(3, 1fr);
        grid-gap: ${theme.spacing[2]};
      }
    `}</style>
    {children}
  </div>
);
