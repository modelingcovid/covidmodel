import * as React from 'react';
import {Group} from '@vx/group';
import {scaleLinear, scaleSymlog} from '@vx/scale';
import {AxisLeft, AxisBottom} from './Axis';
import {GridRows, GridColumns} from '@vx/grid';
import {withTooltip, Tooltip} from '@vx/tooltip';
import {DateOverlay} from './DateOverlay';
import {DistancingOverlay} from './DistancingOverlay';
import {GraphControls} from './GraphControls';
import {ContainmentMarker} from './ContainmentMarker';
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

  return (
    <GraphDataProvider context={context}>
      {before}
      {controls && <GraphControls scale={scale} setScale={setScale} />}
      <div className="graph-contents no-select">
        <style jsx>{`
          .graph-contents {
            position: relative;
            margin-left: ${-1 * margin.left}px;
            margin-right: ${-1 * margin.right}px;
          }
          .graph-contents-overlay {
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
            <g>
              <defs>
                <clipPath id={clipPathId}>
                  <rect x="0" y="0" width={xMax} height={yMax} />
                </clipPath>
              </defs>
              {decoration && scrubber && <NearestMarker />}
            </g>
            <g>{children(context)}</g>
            <g pointerEvents="none">
              {decoration && (
                <>
                  <DistancingOverlay />
                  <GridRows
                    scale={yScale}
                    width={xMax}
                    height={yMax}
                    stroke={theme.color.shadow[1]}
                    strokeDasharray="3,2"
                    shapeRendering="crispEdges"
                    tickValues={yTicks}
                  />
                  <DateOverlay scrubber={scrubber} />
                  {/* <GridColumns
                    scale={xScale}
                    width={xMax}
                    height={yMax}
                    stroke={theme.color.shadow[0]}
                  /> */}
                  {/* <line
                    x1={xMax}
                    x2={xMax}
                    y1={0}
                    y2={yMax}
                    stroke={theme.color.shadow[0]}
                  /> */}
                  {/* {!scrubber && <AxisBottom />} */}
                  <AxisLeft
                    tickFormat={tickFormatWithLabel}
                    tickValues={yTicks}
                  />
                  <ContainmentMarker />
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
        <div className="graph-contents-overlay">
          {scrubber && (
            <Scrubber>
              {(nearest, active) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    marginTop: '-10px',
                    paddingBottom: theme.spacing[2],
                  }}
                >
                  <svg
                    width="8"
                    height="16"
                    viewBox="0 0 8 16"
                    transform="rotate(180)"
                  >
                    <path
                      d="M7.5 4.82843V14C7.5 14.8284 6.82843 15.5 6 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14V4.82843C0.5 4.4306 0.658035 4.04907 0.93934 3.76777L2.93934 1.76777C3.52513 1.18198 4.47487 1.18198 5.06066 1.76777L7.06066 3.76777C7.34197 4.04907 7.5 4.4306 7.5 4.82843Z"
                      fill={theme.color.background}
                      stroke={theme.color.gray[2]}
                      strokeWidth={1.5}
                    />
                  </svg>
                  <div
                    className="nowrap"
                    style={{
                      padding: `0px ${theme.spacing[3]} 4px`,
                      textAlign: 'center',
                      color: theme.color.gray[4],
                      fontSize: theme.font.size.micro,
                      fontWeight: 500,
                      background: `linear-gradient(
                        to right,
                        rgba(${theme.color.backgroundRgb}, 0%) 0%,
                        rgba(${theme.color.backgroundRgb}, 100%) 20%,
                        rgba(${theme.color.backgroundRgb}, 100%) 80%,
                        rgba(${theme.color.backgroundRgb}, 0%) 100%
                      )`,
                    }}
                  >
                    {formatShortDate(x(nearest()))}
                  </div>
                </div>
              )}
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
    <figure className={decoration ? 'graph graph-decoration' : 'graph'}>
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
