const varRegexp = /^var\(([^:)]+)\)$/;

export const unwrapVar = (str) => {
  return str.startsWith('var(') ? str.replace(varRegexp, '$1') : str;
};

export const applyDeep = (fn) => {
  const applyFn = (input) => {
    if (Array.isArray(input)) {
      return input.map(applyFn);
    } else if (input && typeof input === 'object') {
      const result = {};
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

export const prefix = (prefix) => applyDeep((input) => `${prefix}${input}`);
export const suffix = (suffix) => applyDeep((input) => `${input}${suffix}`);

export const px = suffix('px');

const getDigits = (n) => Math.floor(Math.log10(Math.abs(n)) + 1);
const zeros = new Array(getDigits(Number.MAX_SAFE_INTEGER)).fill(0).join('');
const zeroPad = (key, size) => `${zeros}${key}`.slice(-1 * size);

export const pad = (obj, digits) => {
  const result = {};
  const padding = digits || (obj.length ? getDigits(obj.length) : 0);
  for (let [key, value] of Object.entries(obj)) {
    if (key.length < padding && isNumber(key)) {
      result[zeroPad(key, padding)] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
};
