import * as React from 'react';
import {theme} from '../../styles';

export function Gutter({children, ...remaining}) {
  return (
    <div {...remaining}>
      <style jsx>{`
        div {
          margin-bottom: ${theme.spacing[2]};
          float: right;
          width: 100%;
        }
        @media (min-width: 600px) {
          div {
            padding-left: ${theme.spacing[2]};
            max-width: calc(${theme.column.width} * 4);
          }
        }
      `}</style>
      {children}
    </div>
  );
}

export function WithGutter({
  children,
  gutter,
  alignItems = 'flex-start',
  ...remaining
}) {
  return (
    <div className="gutter" {...remaining}>
      <style jsx>{`
        .gutter {
          display: flex;
          flex-direction: column;
          margin-top: calc(-1 * ${theme.spacing[1]});
        }
        @media (min-width: 600px) {
          .gutter {
            flex-direction: row;
            align-items: ${alignItems};
          }
        }
      `}</style>
      <div>{children}</div>
      <Gutter>{gutter}</Gutter>
    </div>
  );
}
