import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

import {InlineData} from '../content';
import {useNearestData} from './useNearestData';
import {formatShortDate, formatNumber} from '../../lib/format';

const legendStyles = css`
  .legend-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    box-shadow: inset 0 1px var(--color-shadow0);
    padding: 4px 0;
  }
`;

const entryStyles = css`
  .entry {
    color: ${theme.color.gray[5]};
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    font-size: ${theme.font.size.micro};
    line-height: 1.2;
    margin-top: 3px;
    width: 100%;
  }
  .entry-info {
    display: flex;
    justify-content: flex-end;
    flex-grow: 4;
    margin-left: ${theme.spacing[0]};
  }
  .entry-label {
    justify-self: flex-start;
    flex-grow: 6;
    text-align: left;
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
  hide,
  kind = 'minor',
  symbol = 'fill',
  y,
  className,
  width = '60%',
  ...remaining
}) => {
  const d = useNearestData();
  if (!d) {
    return null;
  }

  const isStroke = symbol === 'stroke';
  const borderColor = isStroke ? color : 'transparent';

  return (
    <div
      {...remaining}
      className={['entry', className].filter(Boolean).join(' ')}
    >
      <style jsx>{entryStyles}</style>
      <style jsx>{`
        .entry-label {
          font-weight: ${kind === 'minor' ? 400 : 500};
          color: ${theme.color.gray[kind === 'minor' ? 3 : 5]};
          max-width: ${y ? width : '100%'};
        }
        .entry-symbol {
          background-color: ${isStroke ? 'transparent' : color};
          border-color: ${borderColor};
        }
      `}</style>
      <div className="entry-label">{label}</div>
      {y && (
        <div className="entry-info">
          {color && <div className="entry-symbol" />}
          <div className="entry-data">
            <InlineData>
              {() => {
                const value = y ? y(...d) : null;
                return format ? format(value) : value.toString();
              }}
            </InlineData>
          </div>
        </div>
      )}
    </div>
  );
};

export const LegendRow = ({children, ...remaining}) => (
  <div className="legend-row">
    <style jsx>{legendStyles}</style>
    <LegendEntry {...remaining} kind="major" />
    {children}
  </div>
);
