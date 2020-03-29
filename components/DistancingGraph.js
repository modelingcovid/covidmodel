import * as React from 'react';
import {Group} from '@vx/group';
import {Marker} from '@vx/marker';
import {LinePath} from './LinePath';
import {Threshold} from '@vx/threshold';
import {scaleTime, scaleLinear} from '@vx/scale';
import {AxisLeft, AxisBottom, AxisRight} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {format as formatNumber} from 'd3-format';
import {timeFormat, timeParse} from 'd3-time-format';
import {TodayMarker} from './TodayMarker';
import {LinearGradient, Stop} from './LinearGradient';
import {GraphDataProvider, WithComponentId} from './util';

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
  cutoff = 0,
  cutoffLabel = '',
  leftLabel = '',
  rightLabel = '',
  width = 600,
  height = 400,
  margin = {top: 16, left: 64, right: 64, bottom: 32},
}) => {
  const scenarioData = data[scenario].timeSeriesData;
  const allPoints = useMemo(
    () =>
      Object.values(data).reduce(
        (a, v) => (v && v.timeSeriesData ? a.concat(v.timeSeriesData) : a),
        []
      ),
    [data]
  );

  const {R0} = data;
  const formatR0 = useCallback((n) => round2Format(n * R0), [R0]);

  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [
          Math.min(...scenarioData.map(x)),
          Math.max(...scenarioData.map(x)),
        ],
      }),
    [scenarioData, x]
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...allPoints.map((d) => Math.max(y(d), cutoff)))],
        nice: true,
      }),
    [allPoints, y, cutoff]
  );
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  const offset = (yMax - yScale(cutoff)) / yMax;

  return (
    <GraphDataProvider
      data={scenarioData}
      x={x}
      xScale={xScale}
      yScale={yScale}
      xMax={xMax}
      yMax={yMax}
    >
      <div className="graph">
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            <GridRows
              scale={yScale}
              width={xMax}
              height={yMax}
              stroke="#e0e0e0"
            />
            <GridColumns
              scale={xScale}
              width={xMax}
              height={yMax}
              stroke="#e0e0e0"
            />
            <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
            <AxisBottom
              top={yMax}
              scale={xScale}
              numTicks={width > 300 ? 10 : 5}
              tickFormat={dateAxisFormat}
              tickLabelProps={dateTickLabelProps}
            />
            <AxisLeft
              scale={yScale}
              numTicks={5}
              tickFormat={invertPercentFormat}
              tickLabelProps={startTickLabelProps}
            />
            <AxisRight
              left={xMax}
              scale={yScale}
              numTicks={5}
              tickFormat={formatR0}
              tickLabelProps={endTickLabelProps}
            />
            <TodayMarker anchor="end" />
            {children}
            <LinePath
              data={scenarioData}
              x={(d) => xScale(x(d))}
              y={(d) => yScale(y(d))}
              stroke="#0670de"
              strokeWidth={1.5}
            />
            <text
              x="-5"
              y="15"
              textAnchor="end"
              transform="rotate(-90)"
              fontSize={13}
              stroke="#fff"
              strokeWidth="5"
              fill="#000"
              paintOrder="stroke"
            >
              {leftLabel}
            </text>
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
          </Group>
        </svg>
      </div>
    </GraphDataProvider>
  );
};
