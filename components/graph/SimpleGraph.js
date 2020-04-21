import * as React from 'react';
import {Group} from '@vx/group';
import {useGraphConfig} from './useGraphConfig';
import {GraphDataProvider, useGraphData} from './useGraphData';
import {theme} from '../../styles';

export const SimpleGraph = React.memo(function SimpleGraph({
  children,
  ...props
}) {
  const hasGraphData = !!useGraphData();
  const context = useGraphConfig(props);
  const {
    clipPathId,
    decoration,
    frameless,
    height,
    margin,
    width,
    xMax,
    yMax,
  } = context;

  const shiftProps = hasGraphData
    ? {x: -1 * margin.left}
    : {
        style: {
          marginLeft: `${-1 * margin.left}px`,
          marginRight: `${-1 * margin.right}px`,
        },
      };
  // Add 0.5 to snap centered strokes onto the pixel grid, but only when we’re
  // not already nested within another graph.
  const snapOffset = hasGraphData ? 0 : 0.5;

  return (
    <GraphDataProvider context={context}>
      <svg
        {...shiftProps}
        className="block no-select"
        width={width}
        height={height}
      >
        <Group left={margin.left + snapOffset} top={margin.top + snapOffset}>
          <defs>
            <clipPath id={clipPathId}>
              <rect x="0" y="0" width={xMax} height={yMax} />
            </clipPath>
          </defs>
          {children(context)}
          <g pointerEvents="none">
            {!decoration && !frameless && (
              <>
                <rect
                  x={0}
                  y={0}
                  width={xMax - 1}
                  height={yMax - 1}
                  stroke={theme.color.shadow[0]}
                  fill="transparent"
                />
              </>
            )}
          </g>
        </Group>
      </svg>
    </GraphDataProvider>
  );
});
