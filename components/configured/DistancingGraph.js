import * as React from 'react';
import {
  Graph,
  GraphDataProvider,
  Line,
  LinearGradient,
  Stop,
  WithGraphData,
} from '../graph';
import {useModelState, useLocationData} from '../modeling';
import {WithComponentId} from '../util';
import {today} from '../../lib/date';
import {formatPercent} from '../../lib/format';

const {useCallback, useMemo} = React;

export const formatDistancing = (n) => formatPercent(1 - n);

export const DistancingGraph = ({
  children,
  width = 600,
  height = 400,
  ...remaining
}) => {
  const {distancing} = useLocationData();
  const {xScale} = useModelState();
  const todayOffset = xScale(today);

  const endTickLabelProps = () => ({
    dx: '-4px',
    dy: '-4px',
    textAnchor: 'end',
    fill: 'var(--color-gray4)',
  });

  return (
    <Graph
      xLabel="distancing"
      tickFormat={formatDistancing}
      {...remaining}
      height={height}
      width={width}
    >
      {({xMax}) => {
        return (
          <>
            {children}
            <WithComponentId prefix="linearGradient">
              {(gradientId) => (
                <>
                  <LinearGradient size={xMax} direction="right" id={gradientId}>
                    <Stop offset={todayOffset} stopColor="var(--color-blue2)" />
                    <Stop
                      offset={todayOffset}
                      stopColor="var(--color-yellow3)"
                    />
                  </LinearGradient>
                  <Line
                    y={distancing.expected.get}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={1.5}
                  />
                </>
              )}
            </WithComponentId>
          </>
        );
      }}
    </Graph>
  );
};
