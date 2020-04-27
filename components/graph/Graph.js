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
  xLabel = '',
  domain = 1,
  initialScale = 'linear',
  width: propWidth = 600,
  height: propHeight = 400,
  tickFormat = formatLargeNumber,
  controls = false,
  decoration = true,
  distancing = true,
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
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            padding-top: ${margin.top}px;
            padding-left: ${margin.left}px;
            padding-bottom: ${margin.bottom}px;
            padding-right: ${margin.right}px;
            overflow: hidden;
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
          <Group left={margin.left} top={margin.top}>
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
                  {distancing && <DistancingOverlay />}
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
          <div style={{height: '100%', width: '100%', position: 'relative'}}>
            {controls && <GraphControls scale={scale} setScale={setScale} />}
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
                    <svg width="9" height="15" viewBox="0 0 9 15">
                      <path
                        d="M8.5 10.5509V1C8.5 0.723858 8.27614 0.5 8 0.5H1C0.723858 0.5 0.5 0.723858 0.5 1V10.5509C0.5 10.6938 0.561074 10.8298 0.667818 10.9246L4.16782 14.0357C4.35726 14.2041 4.64274 14.2041 4.83218 14.0357L8.33218 10.9246C8.43893 10.8298 8.5 10.6938 8.5 10.5509Z"
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
      </div>
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
