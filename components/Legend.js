import * as React from 'react';
import {useNearestData} from './graph';
import {getDate} from '../lib/date';
import {formatShortDate, formatNumber} from '../lib/format';

export const LegendRow = ({
  children,
  format = formatNumber,
  fill,
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
            height: 6px;
            width: 6px;
            border-radius: 999em;
            margin-top: 1px;
            margin-right: 12px;
          }
        `}</style>
        <style jsx>{`
          .projected-dot {
            background-color: ${fill};
          }
          .confirmed-dot {
            box-shadow: 0 0 0 2px ${fill};
          }
        `}</style>
        <td rowSpan="2">{label}</td>
        <td className="text-mono with-dot">
          <div className="confirmed-dot" />
          {confirmed ? format(confirmed) : 'N/A'}
        </td>
        <td className="text-mono">
          <div className="with-dot">
            <div className="projected-dot" />
            {format(percentile50)}
          </div>
        </td>
      </tr>
      <tr>
        <style jsx>{`
          td {
            padding-left: var(--spacing-01);
            padding-bottom: var(--spacing-01);
            text-align: right;
            vertical-align: top;
          }
        `}</style>
        <td className="text-mono text-micro text-gray-faint" colSpan="2">
          {format(percentile10)} to {format(percentile90)}
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
    <div style={{paddingTop: 'var(--spacing-01)'}}>
      <style jsx>{`
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
            <th>Confirmed</th>
            <th>Projected</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
