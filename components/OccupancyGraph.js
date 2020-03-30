import * as React from 'react';
import {
  Graph,
  GraphDataProvider,
  HMarker,
  Line,
  LinearGradient,
  Stop,
  TodayMarker,
} from './graph';
import {WithComponentId} from './util';

const {useMemo} = React;

export const OccupancyGraph = ({
  children,
  data,
  scenario,
  x,
  y,
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
