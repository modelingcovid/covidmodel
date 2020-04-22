import * as React from 'react';
import {Group} from '@vx/group';
import {scaleLinear, scaleSymlog} from '@vx/scale';
import {AxisLeft, AxisBottom} from './Axis';
import {GridRows, GridColumns} from '@vx/grid';
import {withTooltip, Tooltip} from '@vx/tooltip';
import {useDistancingId} from './DistancingGradient';
import {DistancingOverlay} from './DistancingOverlay';
import {GraphControls} from './GraphControls';
import {NearestMarker} from './NearestMarker';
import {Scrubber} from './Scrubber';
import {useGraphConfig} from './useGraphConfig';
import {GraphDataProvider, useGraphData} from './useGraphData';
import {Suspense, useComponentId} from '../util';
import {useModelState} from '../modeling';
import {maybe} from '../../lib/fn';
import {formatLargeNumber, formatShortDate} from '../../lib/format';
import {theme} from '../../styles';

const {createContext, useCallback, useMemo, useState} = React;

export const GraphContents = React.memo(function Graph({
  children,
  overlay,
  after,
  before,
  xLabel = '',
  domain = 1,
  initialScale = 'linear',
  width: propWidth = 600,
  height: propHeight = 400,
  tickFormat = formatLargeNumber,
  controls = false,
  decoration = true,
  frameless = false,
  scrubber = true,
  nice = true,
}) {
  const [scale, setScale] = useState(initialScale);
  const context = useGraphConfig({
    domain,
    height: propHeight,
    scale,
    width: propWidth,
    decoration,
    frameless,
    scrubber,
    nice,
  });
  const {
    data,
    clipPath,
    clipPathId,
    height,
    id,
    margin,
    width,
    x,
    xScale,
    yScale,
    xMax,
    yMax,
  } = context;

  const yTicks = yScale.ticks(yMax > 180 ? 5 : 3);
  const yTickCount = yTicks.length;
  const tickFormatWithLabel = useCallback(
    (v, i) => {
      const value = tickFormat(v, i);
      return xLabel && i === yTickCount - 1 ? `${value} ${xLabel}` : value;
    },
    [tickFormat, xLabel, yTickCount]
  );

  const distancingId = useDistancingId(xMax);

  return (
    <GraphDataProvider context={context}>
      {before}
      {controls && <GraphControls scale={scale} setScale={setScale} />}
      <div className="graph no-select">
        <style jsx>{`
          .graph {
            position: relative;
            margin-left: ${-1 * margin.left}px;
            margin-right: ${-1 * margin.right}px;
          }
          .graph-overlay {
            pointer-events: none;
            position: absolute;
            top: ${margin.top}px;
            left: ${margin.left}px;
            bottom: ${margin.bottom}px;
            right: ${margin.right}px;
          }
          @keyframes fade-in {
            from {
              transform: translateY(-3px);
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
        <svg className="block" width={width} height={height}>
          <Group
            // Add 0.5 to snap centered strokes onto the pixel grid
            left={margin.left + 0.5}
            top={margin.top + 0.5}
          >
            <defs>
              <clipPath id={clipPathId}>
                <rect x="0" y="0" width={xMax} height={yMax} />
              </clipPath>
            </defs>
            {/* {decoration && (
              <rect
                x="0"
                y="0"
                width={xMax}
                height={yMax}
                fill={`url(#${distancingId})`}
              />
            )} */}
            <g>{children(context)}</g>
            <g pointerEvents="none">
              {decoration && (
                <>
                  {scrubber && <NearestMarker />}
                  <DistancingOverlay />
                  <GridRows
                    scale={yScale}
                    width={xMax}
                    height={yMax}
                    stroke={theme.color.shadow[0]}
                  />
                  <GridColumns
                    scale={xScale}
                    width={xMax}
                    height={yMax}
                    stroke={theme.color.shadow[0]}
                  />
                  <line
                    x1={xMax}
                    x2={xMax}
                    y1={0}
                    y2={yMax}
                    stroke={theme.color.shadow[0]}
                  />
                  <AxisBottom />
                  <AxisLeft
                    tickFormat={tickFormatWithLabel}
                    tickValues={yTicks}
                  />
                </>
              )}
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
        <div className="graph-overlay">
          {scrubber && (
            <Scrubber>
              {(nearest, active) => formatShortDate(x(nearest()))}
            </Scrubber>
          )}
          {overlay}
        </div>
      </div>
      {after}
    </GraphDataProvider>
  );
});

export const Graph = ({decoration = true, frameless = false, ...props}) => {
  return (
    <figure
      className={decoration ? 'clear margin-top-3 margin-bottom-2' : 'clear'}
    >
      <Suspense
        fallback={
          <div
            style={{
              height: `${props.height}px`,
              width: `${props.width}px`,
            }}
          />
        }
      >
        <GraphContents
          decoration={decoration}
          frameless={frameless}
          {...props}
        />
      </Suspense>
    </figure>
  );
};
