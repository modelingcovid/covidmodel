import * as React from 'react';
import {Graph, HMarker, NearestMarker} from './graph';
import {DistancingGradient} from './DistancingGradient';
import {formatLargeNumber} from '../lib/format';

const {createContext, useCallback, useMemo} = React;

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
        label={`Population ${formatLargeNumber(population)}`}
        labelStroke="#fff"
        labelAnchor="end"
        labelStrokeWidth="5"
        strokeDasharray="4,2"
        strokeWidth={1.5}
        labelDx={-20}
        labelDy={15}
      />
      {children}
    </Graph>
  );
};
