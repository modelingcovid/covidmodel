import * as React from 'react';
import {AxisRight} from '@vx/axis';
import {format as formatNumber} from 'd3-format';
import {
  Graph,
  GraphDataProvider,
  Line,
  LinearGradient,
  Stop,
  TodayMarker,
  WithGraphData,
} from './graph';
import {DistancingGradient} from './DistancingGradient';
import {WithComponentId} from './util';
import {today} from '../lib/date';

const round2Format = formatNumber('.3');
const invertPercentFormat = (n) => formatNumber('.0%')(1 - n);

const {useCallback, useMemo} = React;

export const DistancingGraph = ({
  children,
  data,
  scenario,
  x,
  y,
  leftLabel = '',
  rightLabel = '',
  width = 600,
  height = 400,
  margin,
}) => {
  const scenarioData = data[scenario].timeSeriesData;

  const {R0} = data;
  const formatR0 = useCallback((n) => round2Format(n * R0), [R0]);

  const endTickLabelProps = () => ({
    dx: '-4px',
    dy: '-4px',
    textAnchor: 'end',
    fill: 'var(--color-gray-02)',
  });

  return (
    <Graph
      data={scenarioData}
      x={x}
      xLabel={leftLabel}
      height={height}
      width={width}
      tickFormat={invertPercentFormat}
    >
      <WithGraphData>
        {({xMax, yScale}) => {
          const yTicks = yScale.ticks(5);
          const yTickCount = yTicks.length;
          const tickFormatWithLabel = (v, i) => {
            const value = formatR0(v, i);
            return rightLabel && i === yTickCount - 1
              ? `${rightLabel} = ${value}`
              : value;
          };
          return (
            <>
              <DistancingGradient />
              <TodayMarker anchor="end" />
              {children}
              <WithComponentId prefix="linearGradient">
                {(gradientId) => (
                  <>
                    <LinearGradient direction="right" id={gradientId}>
                      <Stop offset={today} stopColor="var(--color-blue-02)" />
                      <Stop offset={today} stopColor="var(--color-yellow-02)" />
                    </LinearGradient>
                    <Line
                      y={y}
                      stroke={`url(#${gradientId})`}
                      strokeWidth={1.5}
                    />
                  </>
                )}
              </WithComponentId>
              <AxisRight
                left={xMax}
                scale={yScale}
                tickValues={yTicks}
                tickFormat={tickFormatWithLabel}
                tickLabelProps={endTickLabelProps}
                tickLength={0} // positions text at the axis
                hideTicks
                stroke="var(--color-gray-01)"
                strokeWidth={1}
              />
            </>
          );
        }}
      </WithGraphData>
    </Graph>
  );
};
