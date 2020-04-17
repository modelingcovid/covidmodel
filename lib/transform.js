import {bisector} from 'd3-array';
import {maybe} from './fn';

export const findPoint = (input, x) => (point) => {
  const data = maybe(input);
  const bisectLeft = bisector(x).left;
  const index = bisectLeft(data, point, 1);

  const d0 = data[index - 1];
  const d1 = data[index];
  // Which is closest?
  return d1 && point - x(d0) > x(d1) - point ? d1 : d0;
};

const identity = (x) => x;

export const flattenData = (data, getPoints = identity) =>
  data.reduce((a, v) => {
    const points = v && getPoints(v);
    return points ? a.concat(points) : a;
  }, []);
