import * as React from 'react';
import css from 'styled-jsx/css';
import {AxisBottom} from './Axis';
import {useGraphData} from './useGraphData';
import {useDistancingDate} from '../modeling';
import {today} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useEffect, useRef} = React;

const styles = css`
  text {
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 500;
  }
`;

function DateLabel({x, label, anchor = 'middle'}) {
  let offset = 0;
  if (anchor === 'start') {
    offset = 4;
  } else if (anchor === 'end') {
    offset = -4;
  }
  return (
    <g transform={`translate(${x}, 0)`}>
      <style jsx>{styles}</style>
      <line
        x1={0}
        x2={0}
        y1={1}
        y2={44}
        stroke={theme.color.focus[1]}
        shapeRendering="crispEdges"
      />
      <text
        fill={theme.color.focus[2]}
        textAnchor={anchor}
        alignmentBaseline="hanging"
        y={36}
        x={offset}
        stroke={theme.color.background}
        strokeWidth={4}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  );
}

export function DateOverlay({scrubber}) {
  const {xScale, xMax, yMax} = useGraphData();
  const todayX = xScale(today);
  const distancingDate = useDistancingDate()();
  const distancingX = xScale(distancingDate);
  let todayAnchor = 'middle';
  let distancingAnchor = 'middle';
  if (xMax - distancingX < 100) {
    distancingAnchor = 'end';
  }
  if (distancingX - todayX < 100) {
    todayAnchor = 'end';
    distancingAnchor = 'start';
  }
  const showDistancingLabel = distancingDate !== today && distancingX !== xMax;
  return (
    <>
      <g transform={`translate(0, ${yMax})`}>
        <DateLabel x={todayX} label="Today" anchor={todayAnchor} />
        {showDistancingLabel && (
          <DateLabel
            x={distancingX}
            label="Distancing ends"
            anchor={distancingAnchor}
          />
        )}
        <AxisBottom top={2} />
      </g>
    </>
  );
}
