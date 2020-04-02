import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

import {useNearestData} from './useNearestData';
import {getDate} from '../../lib/date';
import {formatShortDate, formatNumber} from '../../lib/format';

const legendStyles = css`
  td {
    padding-left: ${theme.spacing[1]};
    text-align: right;
    vertical-align: top;
  }
  td:first-child {
    text-align: left;
    padding-left: 0;
  }
`;
const entryStyles = css`
  .entry {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    font-size: ${theme.font.size.micro};
  }
  .entry-label {
    margin-right: ${theme.spacing[0]};
    color: ${theme.color.gray[2]};
  }
  .entry-symbol {
    flex-shrink: 0;
    height: 8px;
    width: 8px;
    border-radius: 999em;
    align-self: center;
    margin-right: ${theme.spacing[0]};
  }
  .entry-data {
    font-family: ${theme.font.family.mono};
    font-weight: 500;
    font-size: ${theme.font.size.micro};
  }
`;

export const LegendEntry = ({
  children,
  format = formatNumber,
  color,
  label,
  symbol = 'fill',
  y,
}) => {
  const d = useNearestData();
  if (!d) {
    return null;
  }

  const isStroke = symbol === 'stroke';
  const shadow = isStroke ? `2px ${color}` : `1px ${theme.color.background}`;

  return (
    <div className="entry">
      <style jsx>{entryStyles}</style>
      <style jsx>{`
        .entry-symbol {
          background-color: ${isStroke ? theme.color.background : color};
          box-shadow: inset 0 0 0 ${shadow};
        }
      `}</style>
      <div className="entry-label">{label}</div>
      <div className="entry-symbol" />
      <div className="entry-data">{format(y(d))}</div>
    </div>
  );
};

export const LegendRow = ({children, description, title}) => (
  <tr>
    <style jsx>{legendStyles}</style>
    <td>
      <div className="text-small text-gray-dark weight-600">{title}</div>
      {description && (
        <div
          style={{paddingBottom: theme.spacing[0]}}
          className="text-small text-gray-light"
        >
          {description}
        </div>
      )}
    </td>
    <td>{children}</td>
  </tr>
);

export const Legend = ({children}) => {
  const d = useNearestData();
  if (!d) {
    return null;
  }
  return (
    <div>
      <style jsx>{`
        div {
          margin-top: var(--spacing1);
        }
        @media (min-width: 600px) {
          div {
            padding-left: calc(var(--column-width) / 2);
            box-shadow: inset 1px 0 0 var(--color-gray0);
            max-width: calc(var(--column-width) * 9);
          }
        }
        table {
          table-layout: fixed;
          width: 100%;
        }
        th {
          padding-left: var(--spacing1);
          font-weight: 400;
          text-align: right;
          vertical-align: bottom;
        }
        th:first-child {
          text-align: left;
          padding-left: 0;
        }
      `}</style>
      <table>
        <thead className="text-small text-gray-light">
          <tr>
            <th>{formatShortDate(getDate(d))}</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
