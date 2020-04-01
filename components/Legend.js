import * as React from 'react';
import {useNearestData} from './graph';
import {getDate} from '../lib/date';
import {formatShortDate, formatNumber} from '../lib/format';

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
    <>
      <tr>
        <style jsx>{`
          td {
            padding-left: var(--spacing-01);
            text-align: right;
            vertical-align: top;
          }
          td:first-child {
            text-align: left;
            padding-left: 0;
          }
          .with-dot {
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
          .projected-dot,
          .confirmed-dot {
            height: 8px;
            width: 8px;
            border-radius: 999em;
            margin-top: 1px;
            margin-right: 8px;
          }
          .legend-description {
            padding-bottom: var(--spacing-00);
          }
          .legend-label {
            margin-right: var(--spacing-00);
          }
        `}</style>
        <style jsx>{`
          .projected-dot {
            background-color: ${fill};
            box-shadow: inset 0 0 0 1px white;
          }
          .confirmed-dot {
            box-shadow: inset 0 0 0 2px ${fill};
          }
        `}</style>
        <td>
          <div className="text-small text-gray-dark weight-600">{label}</div>
          {children && (
            <div className="legend-description text-small text-gray-light">
              {children}
            </div>
          )}
        </td>
        <td>
          <div className="text-micro with-dot">
            <span className="legend-label text-gray-light">Projected </span>
            <div className="projected-dot" />
            <span className="text-micro text-mono">{format(percentile50)}</span>
          </div>
          {hasConfirmed && (
            <div className="text-micro with-dot">
              <span className="legend-label text-gray-light">Confirmed </span>
              <div className="confirmed-dot" />
              <span className="text-micro text-mono">
                {confirmed ? format(confirmed) : 'N/A'}
              </span>
            </div>
          )}
        </td>
      </tr>
    </>
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
