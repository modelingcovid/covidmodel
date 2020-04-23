import * as React from 'react';
import {CurrentScenario, useDistancingInfo, useLocationData} from '../modeling';
import {useDistancingId} from './DistancingGradient';
import {ClipPathX} from './ClipPathX';
import {Line} from './Line';
import {LinearGradient} from './LinearGradient';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {SimpleGraph} from './SimpleGraph';
import {formatScenario} from '../../lib/controls';
import {today} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useEffect, useRef} = React;

export function DistancingOverlay() {
  const {distancing} = useLocationData();
  const [scenario, distancingDate] = useDistancingInfo();
  const {distancingLevel} = scenario;
  const hasDistancing = distancingLevel !== 1;

  const {xScale, xMax, yMax} = useGraphData();
  const todayX = xScale(today);
  const distancingX = xScale(distancingDate);
  const width = Math.min(distancingX, xMax) - todayX;
  const scenarioLines = formatScenario(scenario).split('\n');
  const lastIndex = scenarioLines.length - 1;
  const hasVisibleEnd = hasDistancing && distancingX < xMax;

  const height = 20;
  const offset = 8;
  const distancingId = useDistancingId(xMax);

  return (
    <>
      <g transform={`translate(0, ${-1 * height - offset})`}>
        <SimpleGraph
          domain={1.02}
          nice={false}
          height={height}
          width={xMax}
          frameless
        >
          {({id, yMax}) => {
            const leftId = `${id}-distancingLeft`;
            const rightId = `${id}-distancingRight`;
            const gradientId = `${id}-distancingFade`;

            return (
              <>
                <rect
                  x="0"
                  y="0"
                  width={xMax}
                  height={yMax}
                  fill={theme.color.blue.bg}
                  stroke={theme.color.focus[0]}
                  strokeWidth={1}
                />
                <rect
                  x="0"
                  y="0"
                  width={xMax}
                  height={yMax}
                  fill={`url(#${distancingId})`}
                />
                <ClipPathX left={leftId} right={rightId} value={today} />
                {/* <defs>
                  <clipPath id={leftId}>
                    <rect x="0" y="0" width={todayX} height={yMax} />
                  </clipPath>
                  <clipPath id={rightId}>
                    <rect
                      x={todayX}
                      y="0"
                      width={xMax - todayX}
                      height={yMax}
                    />
                  </clipPath>
                </defs> */}
                <VMarker
                  value={today}
                  strokeDasharray="4,2"
                  stroke={theme.color.focus[1]}
                  // opacity="0.8"
                />
                {hasVisibleEnd && (
                  <VMarker
                    value={distancingDate}
                    strokeDasharray="4,2"
                    stroke={theme.color.focus[1]}
                    // opacity="0.8"
                  />
                )}
                <Line
                  y={distancing.expected.get}
                  stroke={theme.color.focus[2]}
                  strokeWidth={1}
                  clipPath={`url(#${leftId})`}
                />
                <Line
                  y={distancing.expected.get}
                  stroke={theme.color.focus[2]}
                  strokeWidth={1.5}
                  strokeDasharray="3,1"
                  clipPath={`url(#${rightId})`}
                />
              </>
            );
          }}
        </SimpleGraph>
        <g transform={`translate(${todayX}, 0)`}>
          {scenarioLines.map((text, i) => (
            <text
              key={i}
              fill={theme.color.focus[2]}
              x={width / 2}
              y={-4 - 16 * (lastIndex - i)}
              textAnchor="middle"
              stroke={theme.color.background}
              strokeWidth={5}
              paintOrder="stroke"
            >
              {text}
            </text>
          ))}
        </g>
      </g>
      <VMarker
        value={today}
        strokeDasharray="4,2"
        stroke={theme.color.focus[2]}
        opacity="0.8"
      />
      {hasVisibleEnd && (
        <VMarker
          value={distancingDate}
          strokeDasharray="4,2"
          stroke={theme.color.focus[2]}
          opacity="0.8"
        />
      )}
    </>
  );
}
