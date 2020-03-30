import * as React from 'react';

const {createContext, useContext} = React;

export const NearestPointContext = createContext(null);

export const useNearestPoint = () => useContext(NearestPointContext);

export const WithNearestPoint = ({children}) => children(useNearestPoint());
