export const applyDeep = (fn, inPlace = false) => {
  const applyFn = (input) => {
    if (Array.isArray(input)) {
      return input.map(applyFn);
    } else if (input && typeof input === 'object') {
      const result = inPlace ? input : {};
      for (let [key, value] of Object.entries(input)) {
        result[key] = applyFn(value);
      }
      return result;
    } else {
      return fn(input);
    }
  };
  return applyFn;
};

export const roundTo = (precision) => {
  const multiplier = Math.pow(10, precision);
  return (n) => Math.round(n * multiplier) / multiplier;
};

export const round4 = roundTo(4);
