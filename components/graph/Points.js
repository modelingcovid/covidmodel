import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestData} from './useNearestData';

const {useCallback} = React;

const Point = ({d, y, fill = 'transparent', r = 1.25, ...remaining}) => {
  const {x, xScale, yScale} = useGraphData();
  const yVal = y(d);
  // Only show points with data
  if (!yVal) {
    return null;
  }
  return (
    <circle
      {...remaining}
      fill={fill}
      r={r}
      cx={xScale(x(d))}
      cy={yScale(yVal)}
    />
  );
};

export const Points = ({nearestProps: getNearestProps, ...remaining}) => {
  const {data, x, xScale, yScale} = useGraphData();
  const nearest = useNearestData();
  const points = data.map((d, i) => <Point {...remaining} d={d} key={i} />);

  // Bring the nearest point to the top
  if (nearest) {
    const nearestIndex = data.indexOf(nearest);
    if (nearestIndex !== -1) {
      points.splice(nearestIndex, 1);
      const nearestProps = getNearestProps ? getNearestProps(nearest) : {};
      points.push(
        <Point
          {...remaining}
          {...nearestProps}
          d={nearest}
          key={nearestIndex}
        />
      );
    }
  }

  return <>{points}</>;
};
