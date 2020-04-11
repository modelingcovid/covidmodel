import * as React from 'react';
import {Graph, HMarker, NearestMarker} from '../graph';
import {useModelState, useLocationQuery} from '../modeling';
import {formatLargeNumber} from '../../lib/format';

export const PopulationGraph = ({
  children,
  xLabel = '',
  width = 600,
  height = 400,
  initialScale = 'log',
  ...remaining
}) => {
  const {days, x} = useModelState();
  const [data] = useLocationQuery(`{ population }`);
  const population = data?.population || 0;
  return (
    <Graph
      {...remaining}
      data={days}
      domain={population}
      initialScale={initialScale}
      height={height}
      width={width}
      x={x}
      xLabel={xLabel}
    >
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
