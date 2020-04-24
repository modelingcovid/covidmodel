import * as React from 'react';
import {
  CurrentScenario,
  useContainmentStrategy,
  useDistancingInfo,
  useExpected,
  useLocationData,
} from '../modeling';
import {useDistancingId} from './DistancingGradient';
import {ClipPathX} from './ClipPathX';
import {Line} from './Line';
import {LinearGradient} from './LinearGradient';
import {ContainmentMarker} from './ContainmentMarker';
import {VMarker} from './Marker';
import {useGraphData} from './useGraphData';
import {SimpleGraph} from './SimpleGraph';
import {formatScenario} from '../../lib/controls';
import {today} from '../../lib/date';
import {theme} from '../../styles';

const {useCallback, useEffect, useRef} = React;

export function DistancingOverlay() {
  const {dateContained, distancing} = useLocationData();
  const expected = useExpected();
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

  const strategy = useContainmentStrategy();
  const containmentDate = new Date(dateContained());
  const containmentX = strategy === 'none' ? Infinity : xScale(containmentDate);
  const showContainment = containmentX < xMax;

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
            const distancingLeft = `${id}-distancingLeft`;
            const distancingRight = `${id}-distancingRight`;
            const containmentLeft = `${id}-containmentLeft`;
            const containmentRight = `${id}-containmentRight`;

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
                <ClipPathX
                  left={distancingLeft}
                  right={distancingRight}
                  value={today}
                />
                <ClipPathX
                  left={containmentLeft}
                  right={containmentRight}
                  value={today}
                />

                <VMarker value={today} stroke={theme.color.focus[1]} />
                {hasVisibleEnd && (
                  <VMarker
                    value={distancingDate}
                    stroke={theme.color.focus[1]}
                  />
                )}
                {showContainment && (
                  <>
                    <g opacity="0.3">
                      <VMarker
                        value={containmentDate}
                        stroke={theme.color.magenta[1]}
                      />
                    </g>
                    <rect
                      x={containmentX}
                      y="0"
                      width={xMax - containmentX}
                      height={yMax}
                      fill={theme.color.magenta[1]}
                      opacity="0.1"
                    />
                  </>
                )}

                <Line
                  y={expected(distancing).get}
                  stroke={theme.color.focus[2]}
                  strokeWidth={1}
                  clipPath={`url(#${distancingLeft})`}
                />
                <Line
                  y={expected(distancing).get}
                  stroke={theme.color.focus[2]}
                  strokeWidth={1.5}
                  strokeDasharray="3,1"
                  clipPath={`url(#${distancingRight})`}
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
