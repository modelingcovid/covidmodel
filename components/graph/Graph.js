import * as React from 'react';
import {Group} from '@vx/group';
import {scaleLinear, scaleSymlog, scaleUtc} from '@vx/scale';
import {AxisLeft, AxisBottom} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {withTooltip, Tooltip} from '@vx/tooltip';
import {localPoint} from '@vx/event';
import {bisector} from 'd3-array';
import {GraphControls} from './GraphControls';
import {NearestMarker} from './NearestMarker';
import {NearestOverlay} from './NearestOverlay';
import {TodayMarker} from './TodayMarker';
import {GraphDataProvider} from './useGraphData';
import {NearestDataContext} from './useNearestData';
import {getDate, isYear} from '../../lib/date';
import {
  formatLargeNumber,
  formatShortDate,
  formatShortMonth,
  formatYear,
} from '../../lib/format';

const {createContext, useCallback, useMemo, useState} = React;

const dateAxisFormat = (date) =>
  isYear(date) ? formatYear(date) : formatShortMonth(date);

const {sign, pow, floor, log10, abs} = Math;
const floorLog = (n) =>
  sign(n) * pow(10, floor(log10(abs(n)) + (n >= 0 ? 0 : 1)));
const ceilLog = (n) =>
  sign(n) * pow(10, floor(log10(abs(n)) + (n >= 0 ? 1 : 0)));

const valueTickLabelProps = () => ({
  dx: '4px',
  dy: '-4px',
  textAnchor: 'start',
  fill: 'var(--color-gray-02)',
  paintOrder: 'stroke',
  stroke: '#fff',
  strokeWidth: 5,
});

export const Graph = ({
  children,
  overlay,
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
}) => {
  const [scale, setScale] = useState(initialScale);
  const margin = {top: 16, left: 16, right: 16, bottom: 32};
  const width = propWidth + margin.left + margin.right;

  const xScale = useMemo(
    () =>
      scaleUtc({
        domain: [
          new Date('2020-01-01').getTime(),
          new Date('2021-01-01').getTime(),
        ],
      }),
    [data, x]
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
          nice: true,
        });
    }
  }, [domain, scale]);

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  const [nearestData, setNearestData] = useState(null);
  const bisectDate = useMemo(() => bisector(x).left, [x]);
  const onMouseMove = useCallback(
    (event) => {
      const point = localPoint(event);
      const x0 = xScale.invert(point.x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      // Which is closest?
      const d = d1 && x0 - x(d0) > x(d1) - x0 ? d1 : d0;
      setNearestData(d);
    },
    [bisectDate, data, xScale]
  );

  const xTicks = xScale.ticks(width > 600 ? 10 : 5);
  const xTickCount = xTicks.length;
  const dateTickLabelProps = useCallback(
    (date, i) => {
      const props = {
        textAnchor: 'middle',
        dy: '4px',
        fill: 'var(--color-gray-03)',
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

  return (
    <GraphDataProvider
      data={data}
      x={x}
      xScale={xScale}
      yScale={yScale}
      xMax={xMax}
      yMax={yMax}
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
      <NearestDataContext.Provider value={nearestData}>
        {controls && <GraphControls scale={scale} setScale={setScale} />}
        <div className="graph">
          <svg width={width} height={height} onMouseMove={onMouseMove}>
            <Group
              // Add 0.5 to snap centered strokes onto the pixel grid
              left={margin.left + 0.5}
              top={margin.top + 0.5}
            >
              <TodayMarker />
              <NearestMarker />
              <GridRows
                scale={yScale}
                width={xMax}
                height={yMax}
                stroke="#e0e0e0"
              />
              <GridColumns
                scale={xScale}
                width={xMax}
                height={yMax}
                stroke="#e0e0e0"
              />
              <line x1={xMax} x2={xMax} y1={0} y2={yMax} stroke="#e0e0e0" />
              {children}
              <AxisBottom
                top={yMax}
                scale={xScale}
                tickValues={xTicks}
                tickLength={4}
                tickFormat={dateAxisFormat}
                tickLabelProps={dateTickLabelProps}
                strokeWidth={1}
                stroke="var(--color-gray-01)"
                tickStroke="var(--color-gray-01)"
              />
              <AxisLeft
                scale={yScale}
                tickFormat={tickFormatWithLabel}
                tickValues={yTicks}
                tickLength={0} // positions text at the axis
                hideTicks
                stroke="var(--color-gray-01)"
                strokeWidth={1}
                tickLabelProps={tickLabelProps}
              />
            </Group>
          </svg>
          <div className="graph-overlay">
            <NearestOverlay
              style={{
                top: '100%',
                transform: 'translateY(3px)',
                background: '#fff',
                borderRadius: '99em',
                padding: '6px 12px 5px',
                boxShadow:
                  '0 2px 5px -1px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.15)',
                fontSize: '12px',
                lineHeight: '1',
                fontWeight: 500,
              }}
            >
              {(d) => formatShortDate(getDate(d))}
            </NearestOverlay>
            {overlay}
          </div>
        </div>
      </NearestDataContext.Provider>
    </GraphDataProvider>
  );
};
