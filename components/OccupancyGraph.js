import * as React from 'react';
import {Group} from '@vx/group';
import {curveBasis} from '@vx/curve';
import {LinearGradient} from '@vx/gradient';
import {Marker} from '@vx/marker';
import {LinePath} from './LinePath';
import {Threshold} from '@vx/threshold';
import {scaleTime, scaleLinear} from '@vx/scale';
import {AxisLeft, AxisBottom} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {timeFormat, timeParse} from 'd3-time-format';
import {TodayMarker} from './TodayMarker';
import {GraphDataProvider} from './useGraphData';
import {useComponentId} from '../lib/useComponentId';

const parseDate = timeParse('%Y%m%d');

const yearFormat = timeFormat('%Y');
const shortMonthFormat = timeFormat('%b');
const isYear = (date) => date.getMonth() === 0;

const dateAxisFormat = (date) =>
  isYear(date) ? yearFormat(date) : shortMonthFormat(date);

const valueTickLabelProps = () => ({
  dx: '-0.25em',
  dy: '0.25em',
  textAnchor: 'end',
});
const dateTickLabelProps = (date) => ({
  textAnchor: 'middle',
});

const {useMemo} = React;

const identity = (n) => n;

export const OccupancyGraph = ({
  data,
  scenario,
  x = identity,
  y = identity,
  cutoff = 0,
  xLabel = '',
  width = 600,
  height = 400,
  margin = {top: 10, left: 80, right: 0, bottom: 50},
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

  const gradientId = useComponentId('thresholdGradient');

  return (
    <GraphDataProvider
      data={scenarioData}
      x={x}
      xScale={xScale}
      yScale={yScale}
      xMax={xMax}
      yMax={yMax}
    >
      <div>
        <svg width={width} height={height}>
          <LinearGradient
            id={gradientId}
            x1="0"
            x2="0"
            y1={yMax}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset={0} stopColor="#222" />
            <stop offset={offset} stopColor="#222" />
            <stop offset={offset} stopColor="#f00" />
            <stop offset={1} stopColor="#f00" />
          </LinearGradient>
          {/* <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#f3f3f3"
          rx={14}
        /> */}
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
              tickLabelProps={valueTickLabelProps}
            />
            {/* <Threshold
            data={data}
            x={(d) => xScale(x(d))}
            y0={(d) => yScale(ny(d))}
            y1={(d) => yScale(cutoff)}
            clipAboveTo={0}
            clipBelowTo={yMax}
            curve={curveBasis}
            belowAreaProps={{
              fill: 'transparent',
            }}
            aboveAreaProps={{
              fill: 'rgba(255, 0, 0, 0.2)',
            }}
          /> */}
            <LinePath
              data={scenarioData}
              x={(d) => xScale(x(d))}
              y={(d) => yScale(cutoff)}
              stroke="#ed6804"
              strokeWidth={1.5}
              strokeDasharray="2,1"
            />
            <LinePath
              data={scenarioData}
              x={(d) => xScale(x(d))}
              y={(d) => yScale(y(d))}
              stroke={`url(#${gradientId})`}
              strokeWidth={1.5}
            />
            <TodayMarker />
            <text
              x="0"
              y="15"
              textAnchor="end"
              transform="rotate(-90)"
              fontSize={13}
              stroke="#fff"
              strokeWidth="5"
              fill="#000"
              paintOrder="stroke"
            >
              {xLabel}
            </text>
          </Group>
        </svg>
      </div>
    </GraphDataProvider>
  );
};
