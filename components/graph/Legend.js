import * as React from 'react';
import css from 'styled-jsx/css';
import {breakpoint, theme} from '../../styles';

import {Glyph, InlineData} from '../content';
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
    height: 12px;
    width: 12px;
    align-self: center;
    margin-right: 6px;
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
  mode = 'fill',
  y,
  className,
  width = '60%',
  ...remaining
}) => {
  const nearest = useNearestData();

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
      `}</style>
      <div className="entry-label">{label}</div>
      {y && (
        <div className="entry-info">
          {color && (
            <div className="entry-symbol">
              <Glyph fill={color} mode={mode} />
            </div>
          )}
          <div className="entry-data">
            <InlineData>
              {() => {
                if (y == null) {
                  return null;
                }
                let value;
                if (nearest) {
                  value = y(nearest());
                } else {
                  value = y;
                }
                if (value == null) {
                  return null;
                }
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
