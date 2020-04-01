import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../styles';

import {useNearestData} from './graph';
import {getDate} from '../lib/date';
import {formatShortDate, formatNumber} from '../lib/format';

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

export const LegendRow = ({
  children,
  format = formatNumber,
  fill,
  hasConfirmed = false,
  label,
  y,
}) => {
  const d = useNearestData();
  if (!d) {
    return null;
  }
  const {confirmed, percentile10, percentile50, percentile90} = y(d);
  return (
    <tr>
      <style jsx>{legendStyles}</style>
      <td>
        <div className="text-small text-gray-dark weight-600">{label}</div>
        {children && (
          <div
            style={{paddingBottom: theme.spacing[0]}}
            className="text-small text-gray-light"
          >
            {children}
          </div>
        )}
      </td>
      <td>
        <div className="entry">
          <div className="entry-label">Projected </div>
          <div
            className="entry-symbol"
            style={{
              backgroundColor: fill,
              boxShadow: 'inset 0 0 0 1px white',
            }}
          />
          <div className="entry-data">{format(percentile50)}</div>
        </div>
        {hasConfirmed && (
          <div className="entry">
            <div className="entry-label">Confirmed </div>
            <div
              className="entry-symbol"
              style={{
                backgroundColor: theme.color.background,
                boxShadow: `inset 0 0 0 2px ${fill}`,
              }}
            />
            <div className="entry-data">
              {confirmed ? format(confirmed) : 'N/A'}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

export const Legend = ({children}) => {
  const d = useNearestData();
  if (!d) {
    return null;
  }
  return (
    <div>
      <style jsx>{`
        div {
          margin-top: var(--spacing-01);
        }
        @media (min-width: 600px) {
          div {
            padding-left: calc(var(--column) / 2);
            box-shadow: inset 1px 0 0 var(--color-gray-00);
            max-width: calc(var(--column) * 9);
          }
        }
        table {
          table-layout: fixed;
          width: 100%;
        }
        th {
          padding-left: var(--spacing-01);
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
