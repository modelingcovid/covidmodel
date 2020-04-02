const isNumber = (str) => !Number.isNaN(Number(str));

const defaultCssPropertyName = (prefix, key, obj) => {
  if (!prefix) {
    return `--${key}`;
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
  getPropertyName = defaultCssPropertyName,
} = {}) => {
  const toCssProperties = (obj, prefix = '') => {
    // A nested object that remaps the input to CSS custom property names.
    const properties = {};
    // A nested object that remaps the input to CSS custom property names,
    // wrapped with the `var` function.
    const values = {};
    // A flat object of all the CSS custom property definitions.
    const declarations = {};

    for (let [key, value] of Object.entries(obj)) {
      const property = getPropertyName(prefix, key, obj);
      if (value == null) {
        continue;
      } else if (typeof value === 'object') {
        const nested = toCssProperties(value, property);
        Object.assign(declarations, nested.declarations);
        values[key] = nested.values;
        properties[key] = nested.properties;
      } else {
        declarations[property] = value;
        properties[key] = property;
        values[key] = `var(${property})`;
      }
    }

    const setProperties = (obj, prefix = '') => {
      // A flat object of all the CSS custom property overrides.
      const declarations = {};

      for (let [key, value] of Object.entries(obj)) {
        const property = getPropertyName(prefix, key, obj);
        if (value == null) {
          continue;
        } else if (typeof value === 'object') {
          const nested = setProperties(value, property);
          Object.assign(declarations, nested);
        } else {
          declarations[property] = value;
        }
      }
      return declarations;
    };

    return {declarations, properties, setProperties, values};
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
