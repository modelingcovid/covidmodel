import * as React from 'react';
import {Group} from '@vx/group';
import {Marker} from '@vx/marker';
import {Graph} from './Graph';
import {Line} from './Line';
import {Threshold} from '@vx/threshold';
import {scaleTime, scaleLinear} from '@vx/scale';
import {AxisLeft, AxisBottom, AxisRight} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {format as formatNumber} from 'd3-format';
import {timeFormat, timeParse} from 'd3-time-format';
import {TodayMarker} from './TodayMarker';
import {LinearGradient, Stop} from './LinearGradient';
import {GraphDataProvider, WithComponentId, WithGraphData} from './util';
import {today} from '../lib/date';

const parseDate = timeParse('%Y%m%d');

const yearFormat = timeFormat('%Y');
const shortMonthFormat = timeFormat('%b');
const isYear = (date) => date.getMonth() === 0;

const round2Format = formatNumber('.3');
const invertPercentFormat = (n) => formatNumber('.0%')(1 - n);
const dateAxisFormat = (date) =>
  isYear(date) ? yearFormat(date) : shortMonthFormat(date);

const startTickLabelProps = () => ({
  dx: '-0.25em',
  dy: '0.25em',
  textAnchor: 'end',
});
const endTickLabelProps = () => ({
  dx: '0.25em',
  dy: '0.25em',
  textAnchor: 'start',
});
const dateTickLabelProps = (date) => ({
  textAnchor: 'middle',
});

const {useCallback, useMemo} = React;

const identity = (n) => n;

export const DistancingGraph = ({
  children,
  data,
  scenario,
  x = identity,
  y = identity,
  leftLabel = '',
  rightLabel = '',
  width = 600,
  height = 400,
  margin = {top: 16, left: 64, right: 64, bottom: 32},
}) => {
  const scenarioData = data[scenario].timeSeriesData;

  const {R0} = data;
  const formatR0 = useCallback((n) => round2Format(n * R0), [R0]);

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
        {({xMax, yScale}) => (
          <>
            <AxisRight
              left={xMax}
              scale={yScale}
              numTicks={5}
              tickFormat={formatR0}
              tickLabelProps={endTickLabelProps}
            />
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
            <text
              x="-5"
              y={xMax - 5}
              textAnchor="end"
              transform="rotate(-90)"
              fontSize={13}
              stroke="#fff"
              strokeWidth="5"
              fill="#000"
              paintOrder="stroke"
            >
              {rightLabel}
            </text>
          </>
        )}
      </WithGraphData>
    </Graph>
  );
};
