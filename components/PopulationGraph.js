import * as React from 'react';
import {Group} from '@vx/group';
import {Graph} from './Graph';
import {HMarker} from './Marker';
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
  const population = data.Population;
  return (
    <Graph
      data={scenarioData}
      domain={population}
      initialScale="log"
      height={height}
      width={width}
      x={x}
      xLabel={xLabel}
      controls
    >
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
    </Graph>
  );
};
