import * as React from 'react';
import {
  Graph,
  GraphDataProvider,
  Line,
  LinearGradient,
  Stop,
  WithGraphData,
} from '../graph';
import {useModelState} from '../modeling';
import {WithComponentId} from '../util';
import {today} from '../../lib/date';

const {useCallback, useMemo} = React;

export const DistancingGraph = ({
  children,
  formatDistancing,
  y,
  xLabel = '',
  width = 600,
  height = 400,
  ...remaining
}) => {
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
      {...remaining}
      xLabel={xLabel}
      height={height}
      width={width}
      tickFormat={formatDistancing}
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
                    y={y}
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
