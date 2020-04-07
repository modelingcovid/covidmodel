import * as React from 'react';
import {findPoint} from '../../lib/transform';

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
  const findNearestPoint = useMemo(() => findPoint(data, x), [data, x]);

  const nearestData = useMemo(() => findNearestPoint(point), [
    findNearestPoint,
    point,
  ]);

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
