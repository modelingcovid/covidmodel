import * as React from 'react';
import css from 'styled-jsx/css';
import classNames from 'classnames';
import {theme} from '../styles';
import {Heading, Title, Paragraph} from './content';
import {formatPercent2, formatNumber} from '../lib/format';
import {stateLabels} from '../lib/controls';

const styles = css`
  table {
    table-layout: fixed;
    width: 100%;
  }
  thead {
    margin-bottom: ${theme.spacing[1]};
    padding-bottom: ${theme.spacing[0]};
  }
  tbody {
    font-family: ${theme.font.family.mono};
  }
  tr {
    box-shadow: inset 0 1px ${theme.color.gray[0]};
  }
  th,
  td {
    vertical-align: bottom;
    text-align: right;
    padding: ${theme.spacing[0]} 0;
    padding-left: ${theme.spacing[1]};
  }
  th:first-child,
  td:first-child {
    text-align: left;
    padding-left: 0;
  }
  .parameter-description {
    padding-top: ${theme.spacing[0]};
    color: ${theme.color.gray[3]};
    font-size: ${theme.font.size.micro};
  }
  .parameter-type {
    text-transform: uppercase;
  }
  .controls-container {
    display: flex;
    justify-content: flex-start;
    margin-bottom: ${theme.spacing[1]};
  }
`;

const intervalLabels = {
  '3_days': '3 days',
  '7_days': '7 days',
  '11_days': '11 days',
  '15_days': '15 days',
  '19_days': '19 days',
  '23_days': '23 days',
};
const intervals = Object.keys(intervalLabels);

export function IntervalControls({interval, setInterval}) {
  return (
    <div>
      <style jsx>{`
        div {
          display: flex;
          justify-content: flex-start;
          background: ${theme.color.background};
          border-radius: 3px;
          box-shadow: 0 0 0 1px ${theme.color.shadow[1]};
          overflow: hidden;
        }
        a {
          display: block;
          padding: ${theme.spacing[0]} ${theme.spacing[1]};
          color: ${theme.color.gray[3]};
          transition: 200ms;
          cursor: pointer;
          background: ${theme.color.gray.bg};
          box-shadow: inset 1px 0 ${theme.color.shadow[1]};
        }
        a:first-child {
          box-shadow: none;
        }
        a.active {
          background: ${theme.color.background};
          color: ${theme.color.gray[4]};
        }
        a:hover {
          color: ${theme.color.gray[6]};
        }
      `}</style>
      {intervals.map((s) => (
        <a
          key={s}
          className={classNames({active: interval === s})}
          role="button"
          onClick={() => setInterval(s)}
        >
          {intervalLabels[s]}
        </a>
      ))}
    </div>
  );
}

export function BacktestTable({data}) {
  const [interval, setInterval] = React.useState('3_days');
  const currentIntervalData = data[interval];

  return (
    <div className="margin-top-4 flow-root">
      <style jsx>{styles}</style>
      <Title>Backtest results</Title>
      <Paragraph>
        The following is a summary of the model backtested at differing
        intervals. Numbers are all relative to the actual values for fatalities
        and PCR confirmations over the specified backtest interval.
      </Paragraph>
      <div className="controls-container">
        <IntervalControls interval={interval} setInterval={setInterval} />
      </div>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Deaths difference</th>
            <th>Deaths percentage difference</th>
            <th>PCR difference</th>
            <th>PCR percentage difference</th>
          </tr>
        </thead>
        <tbody>
          {currentIntervalData.map(
            (
              {
                state,
                deathAverage,
                deathAveragePercent,
                pcrAverage,
                pcrAveragePercent,
              },
              i
            ) => (
              <tr key={i}>
                <td>{stateLabels[state] || state}</td>
                <td>{formatNumber(deathAverage)}</td>
                <td>{formatPercent2(deathAveragePercent)}</td>
                <td>{formatNumber(pcrAverage)}</td>
                <td>{formatPercent2(pcrAveragePercent)}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
