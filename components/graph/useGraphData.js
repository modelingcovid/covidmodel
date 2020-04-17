import * as React from 'react';

const {createContext, useContext, useMemo} = React;

const GraphDataContext = createContext(null);

export const GraphDataProvider = ({children, context}) => {
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
