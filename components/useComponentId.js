import * as React from 'react';

const {createContext, useContext, useMemo, useRef} = React;

// We use React context to create ids so that they are deterministic across
// a given React tree. This ensures that ids generated on the server match
// those generated on the client.
const ComponentIdContext = createContext(null);

export const ComponentIdProvider = ({children}) => {
  const counterRef = useRef(0);
  return (
    <ComponentIdContext.Provider value={counterRef}>
      {children}
    </ComponentIdContext.Provider>
  );
};

export const useComponentId = (prefix) => {
  const context = useContext(ComponentIdContext);
  const id = useMemo(() => {
    if (!context) {
      throw new Error(
        'useComponentId must be nested within a ComponentIdProvider'
      );
    }
    return context.current++;
  }, [context]);
  return `${prefix}${id}`;
};

export const WithComponentId = ({children, prefix}) =>
  children(useComponentId(prefix));
