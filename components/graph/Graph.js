import * as React from 'react';
import {Group} from '@vx/group';
import {scaleLinear, scaleSymlog, scaleTime} from '@vx/scale';
import {AxisLeft, AxisBottom} from '@vx/axis';
import {GridRows, GridColumns} from '@vx/grid';
import {withTooltip, Tooltip} from '@vx/tooltip';
import {localPoint} from '@vx/event';
import {bisector} from 'd3-array';
import {format as formatNumber} from 'd3-format';
import {timeFormat, timeParse} from 'd3-time-format';
import {GraphControls} from './GraphControls';
import {GraphDataProvider} from './useGraphData';
import {NearestPointContext} from './useNearestPoint';
import {getDate} from '../../lib/date';

const {createContext, useCallback, useMemo, useState} = React;

const parseDate = timeParse('%Y%m%d');

const yearFormat = timeFormat('%Y');
const shortMonthFormat = timeFormat('%b');
const isYear = (date) => date.getMonth() === 0;

const dateAxisFormat = (date) =>
  isYear(date) ? yearFormat(date) : shortMonthFormat(date);

const addCommas = formatNumber(',');
const valueFormat = (value) =>
  value >= 1000000
    ? `${addCommas(Math.round(value / 100000) / 10)}M`
    : addCommas(value);

const valueTickLabelProps = () => ({
  dx: '-0.25em',
  dy: '0.25em',
  textAnchor: 'end',
});
const dateTickLabelProps = (date) => ({
  textAnchor: 'middle',
});

const identity = (n) => n;

export const Graph = ({
  children,
  overlay,
  data,
  x = identity,
  xLabel = '',
  domain = 1,
  initialScale = 'linear',
  width = 600,
  height = 400,
  tickFormat = valueFormat,
  tickLabelProps = valueTickLabelProps,
  controls = false,
}) => {
  const [scale, setScale] = useState(initialScale);

  const margin = {top: 16, left: 64, right: 64, bottom: 32};
  const xScale = useMemo(
    () =>
      scaleTime({
        domain: [Math.min(...data.map(x)), Math.max(...data.map(x))],
      }),
    [data, x]
  );

  const yScale = useMemo(() => {
    const yDomain = typeof domain === 'number' ? [0, domain] : domain;
    switch (scale) {
      case 'log':
        const yScale = scaleSymlog({
          domain: yDomain,
          nice: true,
        });

        // scaleSymlog allows us to define a log scale that includes 0, but d3
        // doesn’t have useful default ticks... so we define our own.
        const max = yDomain[1];
        const ticks = [0];
        let currentTick = 10;
        while (currentTick < max) {
          ticks.push(currentTick);
          currentTick = currentTick * 10;
        }
        if (currentTick === 10 && max > 0) {
          while (currentTick > max) {
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

  const [nearestPoint, setNearestPoint] = useState(null);
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
      setNearestPoint(d);
    },
    [bisectDate, data, xScale]
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
      <NearestPointContext.Provider value={nearestPoint}>
        {controls && <GraphControls scale={scale} setScale={setScale} />}
        <div className="graph">
          <svg width={width} height={height} onMouseMove={onMouseMove}>
            <Group left={margin.left} top={margin.top}>
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
              <AxisBottom
                top={yMax}
                scale={xScale}
                numTicks={width > 300 ? 10 : 5}
                tickFormat={dateAxisFormat}
                tickLabelProps={dateTickLabelProps}
              />
              <AxisLeft
                scale={yScale}
                numTicks={5}
                tickFormat={tickFormat}
                tickLabelProps={tickLabelProps}
              />
              {children}
              <text
                x="-5"
                y="15"
                textAnchor="end"
                transform="rotate(-90)"
                fontSize={13}
                stroke="#fff"
                strokeWidth="5"
                fill="#000"
                paintOrder="stroke"
              >
                {xLabel}
              </text>
            </Group>
          </svg>
          <div className="graph-overlay">{overlay}</div>
        </div>
      </NearestPointContext.Provider>
    </GraphDataProvider>
  );
};
