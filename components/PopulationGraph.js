import * as React from 'react';
import {Group} from '@vx/group';
import {HMarker} from './Marker';
import {LinePath} from './LinePath';
import {Threshold} from '@vx/threshold';
import {scaleTime, scaleSymlog} from '@vx/scale';
import {AxisLeft, AxisBottom} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {format as formatNumber} from 'd3-format';
import {timeFormat, timeParse} from 'd3-time-format';
import {TodayMarker} from './TodayMarker';
import {GraphDataProvider} from './util';

const {createContext, useCallback, useMemo} = React;

const parseDate = timeParse('%Y%m%d');

const yearFormat = timeFormat('%Y');
const shortMonthFormat = timeFormat('%b');
const isYear = (date) => date.getMonth() === 0;

const dateAxisFormat = (date) =>
  isYear(date) ? yearFormat(date) : shortMonthFormat(date);

const addCommas = formatNumber(',');
const valueFormat = (value) =>
  value >= 1000000
    ? `${addCommas(Math.round(value / 100000) / 10)}M`
    : addCommas(value);

const valueTickLabelProps = () => ({
  dx: '-0.25em',
  dy: '0.25em',
  textAnchor: 'end',
});
const dateTickLabelProps = (date) => ({
  textAnchor: 'middle',
});

const identity = (n) => n;

export const PopulationGraph = ({
  children,
  data,
  scenario,
  x = identity,
  xLabel = '',
  width = 600,
  height = 400,
  margin = {top: 16, left: 64, right: 64, bottom: 32},
}) => {
  const scenarioData = data[scenario].timeSeriesData;
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

  const population = data.Population;
  const yScale = useMemo(
    () =>
      scaleSymlog({
        domain: [0, population],
        nice: true,
      }),
    [population]
  );

  // scaleSymlog allows us to define a log scale that includes 0, but d3
  // doesn’t have useful default ticks... so we define our own.
  yScale.ticks = (count) => [
    0,
    10,
    100,
    1000,
    10000,
    100000,
    1000000,
    10000000,
  ];

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

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
              tickFormat={valueFormat}
              tickLabelProps={valueTickLabelProps}
            />
            <HMarker
              value={population}
              anchor="end"
              stroke="#515a70"
              label={`Population ${valueFormat(population)}`}
              labelStroke="#fff"
              labelAnchor="end"
              labelStrokeWidth="5"
              strokeDasharray="2,1"
              strokeWidth={1.5}
              labelDx={-20}
              labelDy={15}
            />
            {children}
            <TodayMarker />
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
              {xLabel}
            </text>
          </Group>
        </svg>
      </div>
    </GraphDataProvider>
  );
};
