import * as React from 'react';
import {Group} from '@vx/group';
import {useGraphData} from './useGraphData';
import {theme} from '../../styles';

export default function Marker({
  top = 0,
  left = 0,
  from,
  to,
  stroke = 'magenta',
  strokeWidth = 2,
  label,
  labelAnchor = 'left',
  labelDx = 0,
  labelDy = 0,
  labelFill,
  labelFontSize = 10,
  labelStroke = 'white',
  labelStrokeWidth = 3,
  labelPaintOrder = 'stroke',
  ...props
}) {
  return (
    <Group top={top} left={left}>
      <line
        x1={from.x - strokeWidth / 2}
        y1={from.y}
        x2={to.x - strokeWidth / 2}
        y2={to.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...props}
      />
      {label && (
        <text
          x={from ? from.x : 0}
          y={from ? from.y : 0}
          dx={labelDx}
          dy={labelDy}
          fontSize={labelFontSize}
          fill={labelFill || stroke}
          stroke={labelStroke}
          strokeWidth={labelStrokeWidth}
          textAnchor={labelAnchor}
          paintOrder={labelPaintOrder}
        >
          {label}
        </text>
      )}
    </Group>
  );
}

export const VMarker = ({
  anchor = 'start',
  value,
  stroke = theme.color.shadow[2],
  strokeWidth = 1,
  labelStroke = theme.color.background,
  labelStrokeWidth = 5,
  ...props
}) => {
  const {xScale, yMax} = useGraphData();
  const start = {x: xScale(value), y: 0};
  const end = {x: xScale(value), y: yMax};
  const isStart = anchor === 'start';

  const from = isStart ? start : end;
  const to = isStart ? end : start;

  return (
    <Marker
      shapeRendering={strokeWidth === 1 ? 'crispEdges' : 'geometricPrecision'}
      {...props}
      from={from}
      to={to}
      stroke={stroke}
      strokeWidth={strokeWidth}
      labelStroke={labelStroke}
      labelStrokeWidth={labelStrokeWidth}
    />
  );
};

export const HMarker = ({
  anchor = 'start',
  value,
  stroke = theme.color.shadow[2],
  strokeWidth = 1,
  labelStroke = theme.color.background,
  labelStrokeWidth = 5,
  ...props
}) => {
  const {yScale, xMax} = useGraphData();
  const start = {x: 0, y: yScale(value)};
  const end = {x: xMax, y: yScale(value)};
  const isStart = anchor === 'start';

  const from = isStart ? start : end;
  const to = isStart ? end : start;

  return (
    <Marker
      shapeRendering={strokeWidth === 1 ? 'crispEdges' : 'geometricPrecision'}
      labelAnchor={anchor}
      {...props}
      from={from}
      to={to}
      stroke={stroke}
      strokeWidth={strokeWidth}
      labelStroke={labelStroke}
      labelStrokeWidth={labelStrokeWidth}
    />
  );
};
