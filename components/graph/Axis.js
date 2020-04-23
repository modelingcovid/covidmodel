import * as React from 'react';
import {
  AxisBottom as VxAxisBottom,
  AxisLeft as VxAxisLeft,
  AxisRight as VxAxisRight,
} from '@vx/axis';
import {useGraphData} from './useGraphData';
import {formatDateAxis} from '../../lib/format';
import {theme} from '../../styles';

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
        fill: theme.color.gray[2],
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
      stroke={theme.color.gray[2]}
      tickStroke={theme.color.gray[2]}
      {...props}
    />
  );
});

const leftTickLabelProps = () => ({
  dx: '4px',
  dy: '-4px',
  textAnchor: 'start',
  fill: theme.color.gray[2],
  paintOrder: 'stroke',
  stroke: theme.color.background,
  strokeWidth: 5,
});

export const AxisLeft = React.memo(function AxisLeft(props) {
  const {xMax, yScale} = useGraphData();
  return (
    <VxAxisLeft
      scale={yScale}
      tickLength={0} // positions text at the axis
      hideTicks
      stroke={theme.color.gray[2]}
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
  fill: theme.color.gray[2],
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
      stroke={theme.color.gray[2]}
      strokeWidth={1}
      {...props}
    />
  );
});
