import * as React from 'react';
import {Graph, HMarker, NearestMarker} from '../graph';
import {useModelState, usePopulation} from '../modeling';
import {formatLargeNumber} from '../../lib/format';

export const PopulationGraph = ({
  children,
  xLabel = '',
  width = 600,
  height = 400,
  initialScale = 'log',
  ...remaining
}) => {
  const {indices, x} = useModelState();
  const [population = 9000000] = usePopulation();
  return (
    <Graph
      {...remaining}
      data={indices}
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
