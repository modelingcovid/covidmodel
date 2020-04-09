import * as React from 'react';
import {
  Area,
  Graph,
  GraphDataProvider,
  HMarker,
  LinearGradient,
  Stop,
} from '../graph';
import {DistancingGradient, PercentileLine, useModelData} from '../modeling';
import {WithComponentId} from '../util';

const {useMemo} = React;

export const OccupancyGraph = ({
  children,
  y,
  cutoff = 0,
  cutoffLabel = '',
  xLabel = '',
  width = 600,
  height = 400,
  ...remaining
}) => {
  const {allTimeSeriesData, model, timeSeriesData, x} = useModelData();
  const domain = useMemo(
    () =>
      Math.min(
        // Sometimes, excess data in the models rockets off into the distance.
        // This cap prevents the axis from being too distorted.
        cutoff * 20,
        Math.max(
          ...allTimeSeriesData.map((...d) =>
            Math.max(y(...d).percentile50, cutoff)
          )
        )
      ),
    [allTimeSeriesData, y, cutoff]
  );

  return (
    <Graph
      {...remaining}
      data={timeSeriesData}
      domain={domain}
      height={height}
      width={width}
      x={x}
      xLabel={xLabel}
      controls
    >
      <DistancingGradient />
      <HMarker
        anchor="end"
        value={cutoff}
        stroke="var(--color-red1)"
        label={cutoffLabel}
        labelStroke="var(--color-background)"
        labelStrokeWidth="5"
        strokeDasharray="4,2"
        strokeWidth={1.5}
        labelDx={-20}
        labelDy={-6}
      />
      <WithComponentId prefix="linearGradient">
        {(gradientId) => (
          <>
            <LinearGradient
              direction="up"
              id={gradientId}
              from="var(--color-blue2)"
              to="var(--color-red1)"
            >
              <Stop offset={cutoff} stopColor="var(--color-blue2)" />
              <Stop offset={cutoff} stopColor="var(--color-red1)" />
            </LinearGradient>
            <PercentileLine y={y} color={`url(#${gradientId})`} gradient />
          </>
        )}
      </WithComponentId>
      {children}
    </Graph>
  );
};
