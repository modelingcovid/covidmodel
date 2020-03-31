import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestPoint} from './useNearestPoint';

export const NearestOverlay = ({
  anchor = 'middle',
  children,
  y,
  style = {},
}) => {
  const {x, xScale, yScale} = useGraphData();
  const nearest = useNearestPoint();
  if (!nearest) {
    return null;
  }
  const transforms = [
    `translate(${xScale(x(nearest))}px, ${y ? yScale(y(nearest)) : 0}px)`,
  ];
  if (anchor === 'middle') {
    transforms.push('translateX(-50%)');
  }
  if (anchor === 'end') {
    transforms.push('translateX(-100%)');
  }
  if (style.transform) {
    transforms.push(style.transform);
  }
  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        transform: transforms.filter(Boolean).join(' '),
      }}
    >
      {children(nearest)}
    </div>
  );
};
