import * as React from 'react';
import {Graph, HMarker, NearestMarker} from '../graph';
import {DistancingGradient, useModelData} from '../modeling';
import {formatLargeNumber} from '../../lib/format';

export const PopulationGraph = ({
  children,
  xLabel = '',
  width = 600,
  height = 400,
  initialScale = 'log',
  ...remaining
}) => {
  const {
    model: {population},
    timeSeriesData,
    x,
  } = useModelData();
  return (
    <Graph
      {...remaining}
      data={timeSeriesData}
      domain={population}
      initialScale={initialScale}
      height={height}
      width={width}
      x={x}
      xLabel={xLabel}
    >
      <DistancingGradient />
      {children}
      <HMarker
        value={population}
        anchor="end"
        stroke="var(--color-gray4)"
        label={`Population ${formatLargeNumber(population)}`}
        labelStroke="var(--color-background)"
        labelAnchor="end"
        labelStrokeWidth="5"
        strokeDasharray="4,2"
        strokeWidth={1.5}
        labelDx={-20}
        labelDy={15}
      />
    </Graph>
  );
};
