import * as React from 'react';

export const Definition = ({children, value}) => (
  <div>
    <style jsx>{`
      .label {
        font-size: 14px;
        color: var(--color-gray-02);
      }
      .value {
        font-size: 16px;
        color: var(--color-gray-03);
      }
    `}</style>
    <div className="value text-mono">{value}</div>
    <div className="label">{children}</div>
  </div>
);

export const Definitions = ({children}) => (
  <div>
    <style jsx>{`
      div {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: var(--spacing-01);
      }
      @media (min-width: 600px) {
        div {
          grid-template-columns: repeat(3, 1fr);
          grid-gap: var(--spacing-02);
        }
      }
    `}</style>
    {children}
  </div>
);
