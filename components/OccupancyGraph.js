import * as React from 'react';
import {Group} from '@vx/group';
import {HMarker} from './Marker';
import {Graph} from './Graph';
import {Line} from './Line';
import {Threshold} from '@vx/threshold';
import {scaleTime, scaleLinear} from '@vx/scale';
import {AxisLeft, AxisBottom} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {timeFormat, timeParse} from 'd3-time-format';
import {TodayMarker} from './TodayMarker';
import {LinearGradient, Stop} from './LinearGradient';
import {GraphDataProvider, WithComponentId} from './util';

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
  children,
  data,
  scenario,
  x = identity,
  y = identity,
  cutoff = 0,
  cutoffLabel = '',
  xLabel = '',
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
  const population = data.Population;
  const domain = useMemo(
    () =>
      Math.min(
        // Sometimes, excess data in the models rockets off into the distance.
        // This cap prevents the axis from being too distorted.
        cutoff * 10,
        Math.max(...allPoints.map((d) => Math.max(y(d), cutoff)))
      ),
    [allPoints, y, cutoff, population]
  );

  return (
    <Graph
      data={scenarioData}
      domain={domain}
      height={height}
      width={width}
      x={x}
      xLabel={xLabel}
      controls
    >
      <TodayMarker />
      <HMarker
        value={cutoff}
        stroke="#f00"
        label={cutoffLabel}
        labelStroke="#fff"
        labelStrokeWidth="5"
        strokeDasharray="2,1"
        strokeWidth={1.5}
        labelDx={20}
        labelDy={-6}
      />
      <WithComponentId prefix="linearGradient">
        {(gradientId) => (
          <>
            <LinearGradient
              direction="up"
              id={gradientId}
              from="#0670de"
              to="#f00"
            >
              <Stop offset={cutoff} stopColor="#0670de" />
              <Stop offset={cutoff} stopColor="#f00" />
            </LinearGradient>
            <Line y={y} stroke={`url(#${gradientId})`} strokeWidth={1.5} />
          </>
        )}
      </WithComponentId>
      {children}
    </Graph>
  );
};
