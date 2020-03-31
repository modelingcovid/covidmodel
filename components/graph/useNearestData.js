import * as React from 'react';

const {createContext, useContext} = React;

export const NearestDataContext = createContext(null);

export const useNearestData = () => useContext(NearestDataContext);

export const WithNearestData = ({children}) => children(useNearestData());
