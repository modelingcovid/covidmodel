import * as React from 'react';
import {CurrentScenario, useDistancingInfo} from '../modeling';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {formatScenario} from '../../lib/controls';
import {today} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useEffect, useRef} = React;

export function DistancingOverlay() {
  const scenario = useDistancingInfo();
  const {distancingDate, distancingLevel} = scenario;
  const hasDistancing = distancingLevel !== 1;

  const {xScale, xMax, yMax} = useGraphData();
  const todayX = xScale(today);
  const distancingX = Math.min(xScale(distancingDate), xMax);
  const width = distancingX - todayX;

  return (
    <>
      <VMarker value={today} strokeDasharray="4,2" />
      {hasDistancing && (
        <VMarker value={distancingDate} strokeDasharray="4,2" />
      )}
      <g transform={`translate(${todayX}, -12)`}>
        <text
          fill={theme.color.gray[2]}
          x={width / 2}
          y="-4"
          textAnchor="middle"
        >
          {formatScenario(scenario)}
        </text>
        <rect x="0" y="0" width="1" height="7" fill={theme.color.shadow[2]} />
        {hasDistancing && (
          <>
            <rect
              x="1"
              y="3"
              width={Math.max(0, width - 2)}
              height="1"
              fill={theme.color.shadow[2]}
            />
            <rect
              x={Math.max(0, width - 1)}
              y="0"
              width="1"
              height="7"
              fill={theme.color.shadow[2]}
            />
          </>
        )}
      </g>
    </>
  );
}
