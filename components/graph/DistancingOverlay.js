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
import {Area} from './Area';
import {Line} from './Line';
import {LinearGradient, Stop} from './LinearGradient';
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
  const hasVisibleEnd = hasDistancing && distancingX < xMax;

  const strategy = useContainmentStrategy();
  const containmentDate = new Date(dateContained());
  const containmentX = strategy === 'none' ? Infinity : xScale(containmentDate);
  const showContainment = containmentX < xMax;

  const height = 20;
  const offset = 48;
  const distancingId = useDistancingId(xMax);

  return (
    <>
      <g transform={`translate(0, ${yMax + offset})`}>
        <SimpleGraph
          domain={1.02}
          nice={false}
          height={height}
          width={xMax}
          frameless
        >
          {({id, yMax}) => {
            const gradientId = `${id}-distancingAmount`;
            const distancingLeft = `${id}-distancingLeft`;
            const distancingRight = `${id}-distancingRight`;
            const containmentLeft = `${id}-containmentLeft`;
            const containmentRight = `${id}-containmentRight`;

            return (
              <>
                <LinearGradient id={gradientId} direction="down" size={height}>
                  <Stop
                    offset={0}
                    stopColor={theme.color.focus[1]}
                    stopOpacity="0"
                  />
                  <Stop
                    offset={1}
                    stopColor={theme.color.focus[1]}
                    stopOpacity="0.5"
                  />
                </LinearGradient>
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
                <rect
                  x={todayX}
                  y="0"
                  width={width}
                  height={yMax}
                  fill="transparent"
                  stroke={theme.color.focus[1]}
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                  opacity="0.5"
                />
                {showContainment && (
                  <>
                    <rect
                      x={containmentX}
                      y="0"
                      width={xMax - containmentX}
                      height={yMax}
                      fill={theme.color.magenta[0]}
                      stroke={theme.color.magenta[0]}
                      shapeRendering="crispEdges"
                      fillOpacity="0.1"
                      strokeOpacity="0.3"
                    />
                  </>
                )}
                <Area
                  y0={expected(distancing).get}
                  y1={() => yMax}
                  fill={`url(#${gradientId})`}
                />
                <Line
                  y={expected(distancing).get}
                  stroke={theme.color.focus[2]}
                  strokeWidth={1.5}
                  shapeRendering="geometricPrecision"
                  clipPath={`url(#${distancingLeft})`}
                />
                <Line
                  y={expected(distancing).get}
                  stroke={theme.color.focus[2]}
                  strokeWidth={1.5}
                  shapeRendering="geometricPrecision"
                  strokeDasharray="4,2"
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
              y={32 + 16 * i}
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
    </>
  );
}
