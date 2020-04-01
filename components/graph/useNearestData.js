import * as React from 'react';
import {bisector} from 'd3-array';

const {createContext, useCallback, useContext, useMemo, useState} = React;

const createNearestDataContexts = () => [
  createContext(null),
  createContext(() => {}),
];

export const defaultNearestDataContexts = createNearestDataContexts();

export const NearestDataProvider = ({
  children,
  data,
  initial,
  x,
  contexts = defaultNearestDataContexts,
}) => {
  const [point, setPoint] = useState(initial);

  const [NearestDataContext, SetNearestDataContext] = contexts;
  const bisectLeft = useMemo(() => bisector(x).left, [x]);

  const nearestData = useMemo(() => {
    const index = bisectLeft(data, point, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    // Which is closest?
    return d1 && point - x(d0) > x(d1) - point ? d1 : d0;
  }, [bisectLeft, data, point, x]);

  return (
    <SetNearestDataContext.Provider value={setPoint}>
      <NearestDataContext.Provider value={nearestData}>
        {children}
      </NearestDataContext.Provider>
    </SetNearestDataContext.Provider>
  );
};

export const useNearestData = (contexts = defaultNearestDataContexts) =>
  useContext(contexts[0]);
export const useSetNearestData = (contexts = defaultNearestDataContexts) =>
  useContext(contexts[1]);

export const WithNearestData = ({children, contexts}) =>
  children(useNearestData(contexts));
