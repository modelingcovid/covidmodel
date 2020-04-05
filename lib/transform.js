const identity = (x) => x;

export const flattenData = (data, getPoints = identity) =>
  data.reduce((a, v) => {
    const points = v && getPoints(v);
    return points ? a.concat(points) : a;
  }, []);
