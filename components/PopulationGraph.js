import * as React from 'react';
import {format as formatNumber} from 'd3-format';
import {Graph, HMarker, NearestMarker, TodayMarker} from './graph';
import {DistancingGradient} from './DistancingGradient';

const {createContext, useCallback, useMemo} = React;

const addCommas = formatNumber(',');
const valueFormat = (value) =>
  value >= 1000000
    ? `${addCommas(Math.round(value / 100000) / 10)}M`
    : addCommas(value);

export const PopulationGraph = ({
  children,
  data,
  scenario,
  x,
  xLabel = '',
  width = 600,
  height = 400,
  margin,
  ...remaining
}) => {
  const scenarioData = data[scenario].timeSeriesData;
  const population = data.Population;
  return (
    <Graph
      {...remaining}
      data={scenarioData}
      domain={population}
      initialScale="log"
      height={height}
      width={width}
      x={x}
      xLabel={xLabel}
    >
      <DistancingGradient />
      <HMarker
        value={population}
        anchor="end"
        stroke="#515a70"
        label={`Population ${valueFormat(population)}`}
        labelStroke="#fff"
        labelAnchor="end"
        labelStrokeWidth="5"
        strokeDasharray="4,2"
        strokeWidth={1.5}
        labelDx={-20}
        labelDy={15}
      />
      {children}
      <TodayMarker />
    </Graph>
  );
};
