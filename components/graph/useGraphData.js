import * as React from 'react';

const {createContext, useContext, useMemo} = React;

const GraphDataContext = createContext(null);

export const GraphDataProvider = ({
  children,
  clipPath,
  data,
  margin,
  x,
  xScale,
  yScale,
  xMax,
  yMax,
}) => {
  const context = useMemo(
    () => ({data, clipPath, margin, x, xScale, yScale, xMax, yMax}),
    [data, clipPath, margin, x, xScale, yScale, xMax, yMax]
  );

  return (
    <GraphDataContext.Provider value={context}>
      {children}
    </GraphDataContext.Provider>
  );
};

export const useGraphData = () => {
  const context = useContext(GraphDataContext);
  if (!context) {
    throw new Error('useGraphData requires a GraphDataContext to be set');
  }
  return context;
};

export const WithGraphData = ({children}) => children(useGraphData());
