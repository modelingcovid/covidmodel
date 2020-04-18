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
    margin-bottom: ${theme.spacing[1]};
    text-align: center;
    font-size: ${theme.font.size.micro};
    line-height: 1.4;
    color: ${theme.color.gray[3]};
    box-shadow: 0 1px ${theme.color.gray[1]};
  }
  span {
    display: inline-block;
    background: ${theme.color.background};
    padding: 0 4px;
    transform: translateY(50%);
  }
`;

export function DistancingOverlay() {
  const {distancingDate, distancingLevel} = useDistancingInfo();

  const {xScale, xMax, yMax} = useGraphData();
  const todayX = xScale(today);
  const distancingX = Math.min(xScale(distancingDate), xMax);
  const hasDistancing = distancingLevel !== 1;
  const width = hasDistancing ? `${distancingX - todayX}px` : undefined;

  return (
    <div
      style={{
        left: `${todayX}px`,
        width,
      }}
    >
      <style jsx>{styles}</style>
      <span>
        {hasDistancing ? 'Distancing period' : 'No distancing period'}
      </span>
    </div>
  );
}
