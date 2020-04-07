import * as React from 'react';
import {Group} from '@vx/group';
import {scaleLinear, scaleSymlog, scaleUtc} from '@vx/scale';
import {AxisLeft, AxisBottom} from './Axis';
import {GridRows, GridColumns} from '@vx/grid';
import {withTooltip, Tooltip} from '@vx/tooltip';
import {GraphControls} from './GraphControls';
import {NearestMarker} from './NearestMarker';
import {Scrubber} from './Scrubber';
import {TodayMarker} from './TodayMarker';
import {GraphDataProvider} from './useGraphData';
import {useComponentId} from '../util';
import {getDate} from '../../lib/date';
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

export const Graph = React.memo(function Graph({
  children,
  overlay,
  after,
  data,
  x,
  xLabel = '',
  domain = 1,
  initialScale = 'linear',
  width: propWidth = 600,
  height = 400,
  tickFormat = formatLargeNumber,
  tickLabelProps = valueTickLabelProps,
  controls = false,
}) {
  const [scale, setScale] = useState(initialScale);
  const margin = {top: 16, left: 16, right: 16, bottom: 32};
  const width = propWidth + margin.left + margin.right;

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleUtc({
        domain: [
          new Date('2020-01-01').getTime(),
          new Date('2021-01-01').getTime(),
        ],
        range: [0, xMax],
      }),
    [data, x, xMax]
  );

  const yScale = useMemo(() => {
    const yDomain = typeof domain === 'number' ? [0, domain] : domain;
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

  const xTicks = xScale.ticks(width > 600 ? 10 : 5);
  const xTickCount = xTicks.length;
  const dateTickLabelProps = useCallback(
    (date, i) => {
      const props = {
        textAnchor: 'middle',
        dy: '4px',
        fill: 'var(--color-gray5)',
      };
      if (i === 0) {
        props.textAnchor = 'start';
        props.dx = '-2px';
      } else if (i === xTickCount - 1) {
        props.textAnchor = 'end';
        props.dx = '2px';
      }
      return props;
    },
    [xTickCount]
  );

  const yTicks = yScale.ticks(height > 180 ? 5 : 3);
  const yTickCount = yTicks.length;
  const tickFormatWithLabel = useCallback(
    (v, i) => {
      const value = tickFormat(v, i);
      return xLabel && i === yTickCount - 1 ? `${value} ${xLabel}` : value;
    },
    [tickFormat, xLabel, yTickCount]
  );

  const clipPathId = useComponentId('graphClipPath');

  return (
    <GraphDataProvider
      data={data}
      x={x}
      xScale={xScale}
      yScale={yScale}
      xMax={xMax}
      yMax={yMax}
      margin={margin}
      clipPath={`url(#${clipPathId})`}
    >
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
      `}</style>
      {controls && <GraphControls scale={scale} setScale={setScale} />}
      <div className="graph no-select">
        <svg width={width} height={height}>
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
            {children}
            <TodayMarker />
            <NearestMarker />
            <g pointerEvents="none">
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
              <AxisLeft tickFormat={tickFormatWithLabel} tickValues={yTicks} />
            </g>
          </Group>
        </svg>
        <div className="graph-overlay">
          <Scrubber>{(d, active) => formatShortDate(getDate(d))}</Scrubber>
          {overlay}
        </div>
      </div>
      {after}
    </GraphDataProvider>
  );
});
