export const forEachPair = (data, predicate) => {
  data.forEach((prev, i) => {
    const next = data[i + 1];
    if (!next) {
      return;
    }
    predicate(prev, next, i);
  });
};

export const getThresholdIntersections = (data, y, threshold) => {
  const above = [];
  const below = [];
  forEachPair(data, (prev, next) => {
    const yPrev = y(prev);
    const yNext = y(next);
    if (yPrev <= threshold && yNext > threshold) {
      above.push(next);
    } else if (yPrev > threshold && yNext <= threshold) {
      below.push(next);
    }
  });
  return {above, below};
};

export const getFirstExceedsThreshold = (data, y, threshold) =>
  getThresholdIntersections(data, y, threshold).above[0] || null;
