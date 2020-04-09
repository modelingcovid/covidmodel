import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestData} from './useNearestData';
import {theme} from '../../styles';

const {useCallback} = React;

const Point = ({
  d,
  y,
  strokeWidth = 1.5,
  r = 2,
  fill = theme.color.background,
  ...remaining
}) => {
  const {clipPath, x, xScale, yScale} = useGraphData();
  const yVal = y(...d);
  // Only show points with data
  if (!yVal) {
    return null;
  }
  return (
    <circle
      {...remaining}
      strokeWidth={strokeWidth}
      clipPath={clipPath}
      fill={fill}
      r={r}
      cx={xScale(x(...d))}
      cy={yScale(yVal)}
    />
  );
};

const NearestPoint = ({nearestProps, ...remaining}) => {
  const {data} = useGraphData();
  const nearest = useNearestData();

  if (!nearest) {
    return null;
  }
  const [d, i, nearestData] = nearest;
  if (data !== nearestData) {
    return null;
  }
  const props = nearestProps ? nearestProps(nearest) : {};
  return <Point {...remaining} {...props} d={nearest} key="nearest" />;
};

export const Points = ({nearestProps, ...remaining}) => {
  const {data, x, xScale, yScale} = useGraphData();

  return (
    <>
      {data.map((d, i) => (
        <Point {...remaining} d={[d, i, data]} key={i} />
      ))}
      <NearestPoint {...remaining} nearestProps={nearestProps} />
    </>
  );
};
