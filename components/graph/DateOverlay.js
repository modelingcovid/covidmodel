import * as React from 'react';
import {AxisBottom} from './Axis';
import {useGraphData} from './useGraphData';
import {today} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useEffect, useRef} = React;

export function DateOverlay({scrubber}) {
  const {xScale, yMax} = useGraphData();
  const todayX = xScale(today);
  return (
    <>
      <g transform={`translate(0, ${yMax})`}>
        <g transform={`translate(${todayX}, -8)`}>
          <line
            x1={0}
            x2={0}
            y1={0}
            y2={8}
            stroke={theme.color.shadow[2]}
            shapeRendering="crispEdges"
          />
          <text
            fill={theme.color.gray[2]}
            textAnchor="middle"
            y={-4}
            stroke={theme.color.background}
            strokeWidth={4}
            paintOrder="stroke"
          >
            Today
          </text>
        </g>
        <AxisBottom top={2} />
      </g>
    </>
  );
}
