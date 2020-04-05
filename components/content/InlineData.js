import * as React from 'react';
import css from 'styled-jsx/css';

const styles = css`
  .inline-data {
    transition: ease background-color 300ms;
  }
  .inline-data-label {
    transition: ease background-color 300ms, ease color 300ms;
    background-image: linear-gradient(
      to right,
      var(--color-gray0) 0%,
      var(--color-gray0) 60%,
      transparent 60%,
      transparent 100%
    );
    background-size: 8px 1px;
    background-repeat: repeat-x;
    background-position: 0 100%;
  }
  .inline-data-value {
    transition: ease color 300ms;
    color: var(--color-gray2);
    font-family: var(--font-family-mono);
    font-weight: 500;
    font-size: 0.9em;
    padding: 0 2px;
  }
`;

export const InlineData = ({label, value}) => (
  <span className="inline-data">
    <style jsx>{styles}</style>
    <span className="inline-data-label">{label}</span>
    &nbsp;
    <span className="inline-data-value">{value}</span>
  </span>
);
