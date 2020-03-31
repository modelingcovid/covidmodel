import * as React from 'react';
import {useNearestPoint} from './useNearestPoint';

export const NearestOverlay = ({
  anchor = 'middle',
  children,
  y,
  style = {},
}) => {
  const nearest = useNearestPoint(y);
  if (!nearest) {
    return null;
  }
  const transforms = [`translate(${nearest.x}px, ${nearest.y}px)`];
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
      {children(nearest?.data)}
    </div>
  );
};
