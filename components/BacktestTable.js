import * as React from 'react';
import css from 'styled-jsx/css';
import classNames from 'classnames';
import {theme} from '../styles';
import {
  TableGrid,
  Heading,
  Title,
  Paragraph,
  createTextComponent,
} from './content';
import {LegendRow, LegendEntry} from './graph';
import {useLocationData} from './modeling';
import {Suspense} from './util';
import {formatPercent2, formatNumber} from '../lib/format';

export const Citation = createTextComponent('cite', 'citation');

const styles = css`
  .parameter-description {
    padding-top: ${theme.spacing[0]};
    color: ${theme.color.gray[3]};
    font-size: ${theme.font.size.micro};
  }
  .parameter-type {
    text-transform: uppercase;
  }
`;

const intervalLabels = {
  '3_days': '3 Days',
  '7_days': '7 Days',
  '11_days': '11 Days',
  '15_days': '15 Days',
  '19_days': '19 Days',
  '23_days': '23 Days',
};
const intervals = Object.keys(intervalLabels);

export function IntervalControls({interval, setInterval}) {
  return (
    <div>
      <style jsx>{`
        div {
          display: flex;
          width: 438px;
          justify-content: flex-end;
          background: ${theme.color.background};
          margin-left: ${theme.spacing[0]};
          border-radius: 3px;
          box-shadow: 0 0 0 1px ${theme.color.shadow[1]};
          overflow: hidden;
        }
        a {
          display: block;
          padding: 4px ${theme.spacing[0]};
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
    <div className="margin-top-5 flow-root">
      <style jsx>{styles}</style>
      <Heading>Backtest results</Heading>
      <Paragraph>
        The following is a summary of the model backtested at differing
        intervals. Numbers are all relative to the actual values for fatalities
        and PCR confirmations over the specified backtest interval.
      </Paragraph>
      <div className="controls-container">
        <IntervalControls interval={interval} setInterval={setInterval} />
      </div>
      <TableGrid mobile={5} desktop={5}>
        <LegendEntry label={<span className="text-gray">State</span>} />
        <LegendEntry
          label={<span className="text-gray">Deaths Difference</span>}
        />
        <LegendEntry
          label={
            <span className="text-gray">Deaths Percentage Difference</span>
          }
        />
        <LegendEntry
          label={<span className="text-gray">PCR Difference</span>}
        />
        <LegendEntry
          label={<span className="text-gray">PCR Percentage Difference</span>}
        />
        {currentIntervalData.map(
          ({
            state,
            deathAverage,
            deathAveragePercent,
            pcrAverage,
            pcrAveragePercent,
          }) => (
            <React.Fragment>
              <LegendEntry label={<span className="text-gray">{state}</span>} />
              <LegendEntry y={deathAverage} format={formatNumber} />
              <LegendEntry y={deathAveragePercent} format={formatPercent2} />
              <LegendEntry y={pcrAverage} format={formatNumber} />
              <LegendEntry y={pcrAveragePercent} format={formatPercent2} />
            </React.Fragment>
          )
        )}
      </TableGrid>
      <style jsx>{`
        .controls-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
}
