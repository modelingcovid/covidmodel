import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

import {useNearestData} from './useNearestData';
import {getDate} from '../../lib/date';
import {formatShortDate, formatNumber} from '../../lib/format';

const legendStyles = css`
  tr {
    box-shadow: inset 0 1px var(--color-shadow0);
  }
  td {
    color: ${theme.color.gray[4]};
    margin-top: 4px;
    padding-top: 4px;
    padding-left: ${theme.spacing[1]};
    text-align: right;
    vertical-align: top;
  }
  td:first-child {
    text-align: left;
    padding-left: 0;
    width: 60%;
    line-height: 1.4;
  }
`;
const entryStyles = css`
  .entry {
    color: ${theme.color.gray[5]};
    display: flex;
    flex-wrap: wrap-reverse;
    align-items: baseline;
    justify-content: flex-end;
    font-size: ${theme.font.size.micro};
    line-height: 1.2;
    margin-top: 3px;
  }
  .entry-info {
    display: flex;
    margin-left: ${theme.spacing[0]};
  }
  .entry-label {
    color: ${theme.color.gray[3]};
  }
  .entry-symbol {
    flex-shrink: 0;
    border: 2px solid rgb(255, 0, 0, 0.5);
    height: 8px;
    width: 8px;
    border-radius: 999em;
    align-self: center;
    margin-right: ${theme.spacing[0]};
  }
  .entry-data {
    font-family: ${theme.font.family.mono};
    font-weight: 500;
    font-size: ${theme.font.size.tiny};
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
  const borderColor = isStroke ? color : 'transparent';

  return (
    <div className="entry">
      <style jsx>{entryStyles}</style>
      <style jsx>{`
        .entry-symbol {
          background-color: ${isStroke ? 'transparent' : color};
          border-color: ${borderColor};
        }
      `}</style>
      <div className="entry-label">{label}</div>
      <div className="entry-info">
        {color && <div className="entry-symbol" />}
        <div className="entry-data">{format(y(d))}</div>
      </div>
    </div>
  );
};

export const LegendRow = ({children, description, title}) => (
  <tr>
    <style jsx>{legendStyles}</style>
    <td>
      <div className="text-micro text-gray weight-500">{title}</div>
      {description && (
        <div
          style={{paddingBottom: theme.spacing[1]}}
          className="text-micro text-gray-light"
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
          margin-bottom: var(--spacing2);
          float: right;
          user-select: none;
        }
        @media (min-width: 600px) {
          div {
            padding-left: var(--spacing1);
            max-width: calc(var(--column-width) * 3);
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
          width: 60%;
        }
        th:first-child {
          text-align: left;
          padding-left: 0;
        }
      `}</style>
      <table>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
