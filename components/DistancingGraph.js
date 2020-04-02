import * as React from 'react';
import {AxisRight} from '@vx/axis';
import {
  Graph,
  GraphDataProvider,
  Line,
  LinearGradient,
  Stop,
  WithGraphData,
} from './graph';
import {DistancingGradient} from './model';
import {WithComponentId} from './util';
import {today} from '../lib/date';
import {formatNumber2, formatPercent} from '../lib/format';

const formatPercentInverted = (n) => formatPercent(1 - n);

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
  ...remaining
}) => {
  const scenarioData = data.scenarios[scenario].timeSeriesData;

  const {r0} = data;
  const formatR0 = useCallback((n) => formatNumber2(n * r0), [r0]);

  const endTickLabelProps = () => ({
    dx: '-4px',
    dy: '-4px',
    textAnchor: 'end',
    fill: 'var(--color-gray2)',
  });

  return (
    <Graph
      {...remaining}
      data={scenarioData}
      x={x}
      xLabel={leftLabel}
      height={height}
      width={width}
      tickFormat={formatPercentInverted}
    >
      <WithGraphData>
        {({xMax, yScale}) => {
          const yTicks = yScale.ticks(4);
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
              {children}
              <WithComponentId prefix="linearGradient">
                {(gradientId) => (
                  <>
                    <LinearGradient direction="right" id={gradientId}>
                      <Stop offset={today} stopColor="var(--color-blue2)" />
                      <Stop offset={today} stopColor="var(--color-yellow2)" />
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
                stroke="var(--color-gray1)"
                strokeWidth={1}
              />
            </>
          );
        }}
      </WithGraphData>
    </Graph>
  );
};
