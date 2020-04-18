import * as React from 'react';
import css from 'styled-jsx/css';
import {CurrentScenario, useDistancingInfo} from '../modeling';
import {useGraphData} from './useGraphData';
import {formatShortScenario} from '../../lib/controls';
import {today} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useEffect, useRef} = React;

const styles = css`
  div {
    position: absolute;
    bottom: 100%;
    margin-bottom: 8px;
    text-align: center;
    font-size: ${theme.font.size.micro};
    color: ${theme.color.gray[2]};
  }
  span {
    display: inline-block;
    background: ${theme.color.background};
    padding: 0 4px;
  }
`;

export function DistancingOverlay() {
  const {distancingDate, distancingLevel} = useDistancingInfo();

  const {xScale, xMax, yMax} = useGraphData();
  const todayX = xScale(today);
  const distancingX = Math.min(xScale(distancingDate), xMax);
  const hasDistancing = distancingLevel !== 1;
  const width = distancingX - todayX;

  return (
    <div
      style={{
        left: `${todayX}px`,
        width: hasDistancing ? `${width}px` : undefined,
      }}
    >
      <style jsx>{styles}</style>
      {hasDistancing || (
        <span>
          <CurrentScenario />
        </span>
      )}
      {hasDistancing && (
        <>
          <span>
            <CurrentScenario />
          </span>
          <svg width={width} height={7}>
            <rect
              x="1"
              y="3"
              width={width - 2}
              height="1"
              fill={theme.color.shadow[2]}
            />
            <rect
              x="0"
              y="0"
              width="1"
              height="7"
              fill={theme.color.shadow[2]}
            />
            <rect
              x={width - 1}
              y="0"
              width="1"
              height="7"
              fill={theme.color.shadow[2]}
            />
          </svg>
        </>
      )}
    </div>
  );
}
