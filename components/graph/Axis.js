import * as React from 'react';
import {
  AxisBottom as VxAxisBottom,
  AxisLeft as VxAxisLeft,
  AxisRight as VxAxisRight,
} from '@vx/axis';
import {useGraphData} from './useGraphData';
import {formatDateAxis} from '../../lib/format';

const {useCallback} = React;

export const AxisBottom = React.memo(function AxisBottom(props) {
  const {xMax, yMax, xScale, width} = useGraphData();

  const xTicks = xScale.ticks(xMax > 600 ? 10 : 5);
  const xTickCount = xTicks.length;
  const bottomTickLabelProps = useCallback(
    (date, i) => {
      const props = {
        textAnchor: 'middle',
        dy: '4px',
        fill: 'var(--color-gray3)',
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

  return (
    <VxAxisBottom
      top={yMax}
      scale={xScale}
      tickValues={xTicks}
      tickLength={4}
      tickFormat={formatDateAxis}
      tickLabelProps={bottomTickLabelProps}
      strokeWidth={1}
      stroke="var(--color-gray1)"
      tickStroke="var(--color-gray1)"
      {...props}
    />
  );
});

const leftTickLabelProps = () => ({
  dx: '4px',
  dy: '-4px',
  textAnchor: 'start',
  fill: 'var(--color-gray2)',
  paintOrder: 'stroke',
  stroke: 'var(--color-background)',
  strokeWidth: 5,
});

export const AxisLeft = React.memo(function AxisLeft(props) {
  const {xMax, yScale} = useGraphData();
  return (
    <VxAxisLeft
      scale={yScale}
      tickLength={0} // positions text at the axis
      hideTicks
      stroke="var(--color-gray1)"
      strokeWidth={1}
      tickLabelProps={leftTickLabelProps}
      {...props}
    />
  );
});

const rightTickLabelProps = () => ({
  dx: '-4px',
  dy: '-4px',
  textAnchor: 'end',
  fill: 'var(--color-gray2)',
});

export const AxisRight = React.memo(function AxisRight(props) {
  const {xMax, yScale} = useGraphData();
  return (
    <VxAxisRight
      left={xMax}
      scale={yScale}
      tickLabelProps={rightTickLabelProps}
      tickLength={0} // positions text at the axis
      hideTicks
      stroke="var(--color-gray1)"
      strokeWidth={1}
      {...props}
    />
  );
});
