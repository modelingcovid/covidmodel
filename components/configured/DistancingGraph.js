import * as React from 'react';
import {
  Graph,
  GraphDataProvider,
  LinearGradient,
  Stop,
  WithGraphData,
  useXScale,
} from '../graph';
import {DistributionLine, useLocationData} from '../modeling';
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
  const xScale = useXScale();
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
      distancing={false}
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
                  <DistributionLine
                    y={distancing}
                    color={`url(#${gradientId})`}
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
