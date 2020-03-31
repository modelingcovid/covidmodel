import * as React from 'react';
import {Area, Line, Points} from './graph';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';

const {useCallback} = React;

const getConfirmed = (d) => d.confirmed;
const getProjected = (d) => d.projected;
const getLci = (d) => d.lci;
const getUci = (d) => d.uci;

export const PercentileLine = ({y, color = 'var(--color-blue-02)'}) => {
  const getConfirmedY = useCallback((d) => getConfirmed(y(d)), [y]);
  const getProjectedY = useCallback((d) => getProjected(y(d)), [y]);
  const getLciY = useCallback((d) => getLci(y(d)), [y]);
  const getUciY = useCallback((d) => getUci(y(d)), [y]);
  return (
    <>
      <Area y0={getLciY} y1={getUciY} fill={color} opacity="0.2" />
      <Line y={getProjectedY} stroke={color} />
      <Points
        y={getConfirmedY}
        stroke={color}
        strokeWidth={1.5}
        r={2}
        fill="#fff"
      />
    </>
  );
};
