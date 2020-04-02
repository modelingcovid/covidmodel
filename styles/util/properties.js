const isNumber = (str) => !Number.isNaN(Number(str));

const defaultCssPropertyPath = (prefix, key, obj) => {
  if (!prefix) {
    return key;
  }
  // Allows you to pass an empty key to get a default variable name.
  // For example, this JS object
  //   {column: {'': 12, width: '64px'}}
  // becomes these CSS variables
  //   --column: 12; --column-width: 64px;
  if (!key) {
    return prefix;
  }
  if (isNumber(key)) {
    return `${prefix}${key}`;
  }
  return `${prefix}-${key}`;
};

export const createCssPropertyConverter = ({
  getPath = defaultCssPropertyPath,
} = {}) => {
  const toCssProperties = (obj, prefix = '') => {
    // A nested object that remaps the input to CSS custom property names.
    const properties = {};
    // A nested object that remaps the input to CSS custom property names,
    // wrapped with the `var` function.
    const values = {};
    // A flat object of all the CSS variable definitions.
    const declarations = {};

    for (let [key, value] of Object.entries(obj)) {
      const path = getPath(prefix, key, obj);
      if (value == null) {
        continue;
      } else if (typeof value === 'object') {
        const nested = toCssProperties(value, path);
        Object.assign(declarations, nested.declarations);
        values[key] = nested.values;
        properties[key] = nested.properties;
      } else {
        const property = `--${path}`;
        declarations[property] = value;
        properties[key] = property;
        values[key] = `var(${property})`;
      }
    }

    return {declarations, properties, values};
  };
  return toCssProperties;
};

export const toCssProperties = createCssPropertyConverter();

export const toCssDeclarations = (declarations) =>
  Object.entries(declarations)
    .map(([property, value]) => `${property}: ${value};`)
    .join('\n');

export const toRootRule = (declarations) => `:root {
  ${toCssDeclarations(declarations)}
}`;
