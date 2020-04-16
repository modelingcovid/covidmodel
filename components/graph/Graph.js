import * as React from 'react';
import {Group} from '@vx/group';
import {scaleLinear, scaleSymlog} from '@vx/scale';
import {AxisLeft, AxisBottom} from './Axis';
import {GridRows, GridColumns} from '@vx/grid';
import {withTooltip, Tooltip} from '@vx/tooltip';
import {useDistancingId} from './DistancingGradient';
import {DistancingMarker} from './DistancingMarker';
import {GraphControls} from './GraphControls';
import {NearestMarker} from './NearestMarker';
import {Scrubber} from './Scrubber';
import {TodayMarker} from './TodayMarker';
import {GraphDataProvider, useGraphData} from './useGraphData';
import {Suspense, useComponentId} from '../util';
import {createDateScale} from '../../lib/date';
import {maybe} from '../../lib/fn';
import {formatLargeNumber, formatShortDate} from '../../lib/format';
import {theme} from '../../styles';

const {createContext, useCallback, useMemo, useState} = React;

const {sign, pow, floor, log10, abs} = Math;
const floorLog = (n) =>
  sign(n) * pow(10, floor(log10(abs(n)) + (n >= 0 ? 0 : 1)));
const ceilLog = (n) =>
  sign(n) * pow(10, floor(log10(abs(n)) + (n >= 0 ? 1 : 0)));

const valueTickLabelProps = () => ({
  dx: '4px',
  dy: '-4px',
  textAnchor: 'start',
  fill: 'var(--color-gray4)',
  paintOrder: 'stroke',
  stroke: 'var(--color-background)',
  strokeWidth: 5,
});

export const GraphContents = React.memo(function Graph({
  accessors,
  children,
  overlay,
  after,
  before,
  data: dataFn,
  x,
  xLabel = '',
  domain = 1,
  initialScale = 'linear',
  width: propWidth = 600,
  height = 400,
  tickFormat = formatLargeNumber,
  tickLabelProps = valueTickLabelProps,
  controls = false,
  decoration = true,
  scrubber = true,
}) {
  const data = dataFn();
  const [scale, setScale] = useState(initialScale);
  const margin = decoration
    ? {top: 16, left: 16, right: 16, bottom: 32}
    : {top: 0, left: 0, right: 0, bottom: 0};
  const width = propWidth + margin.left + margin.right;

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = useMemo(() => createDateScale(xMax), [data, x, xMax]);

  const yScale = useMemo(() => {
    const yDomain = [0, maybe(domain)];
    switch (scale) {
      case 'log':
        // scaleSymlog allows us to define a log scale that includes 0, but d3
        // doesn’t have a useful domain nicing or default ticks... so we define
        // our own.
        const domainMin = floorLog(yDomain[0]);
        const domainMax = ceilLog(yDomain[1]);
        const yScale = scaleSymlog({
          domain: [domainMin, domainMax],
          range: [yMax, 0],
        });

        const ticks = [0];
        let currentTick = 10;
        while (domainMax >= currentTick) {
          ticks.push(currentTick);
          currentTick = currentTick * 10;
        }
        if (currentTick === 10 && domainMax > 0) {
          while (currentTick > domainMax) {
            currentTick = currentTick / 10;
          }
          ticks.push(currentTick);
        }

        yScale.ticks = (count) => ticks;

        return yScale;
      case 'linear':
      default:
        return scaleLinear({
          domain: yDomain,
          range: [yMax, 0],
          nice: true,
        });
    }
  }, [domain, scale, yMax]);

  const clipPathId = useComponentId('graphClipPath');

  const yTicks = yScale.ticks(yMax > 180 ? 5 : 3);
  const yTickCount = yTicks.length;
  const tickFormatWithLabel = useCallback(
    (v, i) => {
      const value = tickFormat(v, i);
      return xLabel && i === yTickCount - 1 ? `${value} ${xLabel}` : value;
    },
    [tickFormat, xLabel, yTickCount]
  );

  const distancingId = useDistancingId();

  const clipPath = `url(#${clipPathId})`;
  const context = useMemo(
    () => ({data, clipPath, margin, x, xScale, yScale, xMax, yMax}),
    [data, clipPath, margin, x, xScale, yScale, xMax, yMax]
  );

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
            background: ${theme.color.background};
            animation: fade-in 300ms ease-in both;
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
            {decoration && (
              <rect
                x="0"
                y="0"
                width={xMax}
                height={yMax}
                fill={`url(#${distancingId})`}
              />
            )}
            {children(context)}
            <g pointerEvents="none">
              {decoration && (
                <>
                  <NearestMarker />
                  <TodayMarker />
                  <DistancingMarker />
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
              {!decoration && (
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
            <Scrubber>{([d], active) => formatShortDate(x(d))}</Scrubber>
          )}
          {overlay}
        </div>
      </div>
      {after}
    </GraphDataProvider>
  );
});

export const Graph = (props) => {
  return (
    <figure
      className={props.decoration ? 'margin-bottom-1' : ''}
      style={{
        boxShadow: `inset 0 0 0 1px ${theme.color.gray[0]}`,
      }}
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
        <GraphContents {...props} />
      </Suspense>
    </figure>
  );
};
