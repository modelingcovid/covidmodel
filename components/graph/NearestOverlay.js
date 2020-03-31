import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestPoint} from './useNearestPoint';
import {formatDate} from '../../lib/date';

export const NearestOverlay = ({children, y, style = {}}) => {
  const {x, xScale, yScale} = useGraphData();
  const nearest = useNearestPoint();
  if (!nearest) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        transform: `translate(${xScale(x(nearest))}px, ${
          y ? yScale(y(nearest)) : 0
        }px) ${style.transform || ''}`,
      }}
    >
      {children(nearest)}
    </div>
  );
};
