import * as React from 'react';
import {useGraphData} from './useGraphData';
import {useNearestData} from './useNearestData';

const {useCallback} = React;

const Point = ({d, y, fill = 'transparent', r = 1.25, ...remaining}) => {
  const {clipPath, x, xScale, yScale} = useGraphData();
  const yVal = y(d);
  // Only show points with data
  if (!yVal) {
    return null;
  }
  return (
    <circle
      {...remaining}
      clip-path={clipPath}
      fill={fill}
      r={r}
      cx={xScale(x(d))}
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
  const nearestIndex = data.indexOf(nearest);
  if (nearestIndex === -1) {
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
        <Point {...remaining} d={d} key={i} />
      ))}
      <NearestPoint {...remaining} nearestProps={nearestProps} />
    </>
  );
};
