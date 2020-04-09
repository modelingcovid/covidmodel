import * as React from 'react';
import {Area, Line, Points} from '../graph';
import {getDate} from '../../lib/date';

const {useCallback} = React;

const getConfirmed = (d) => d.confirmed;
const getExpectedOr50 = (d) => d.expected || d.percentile50;
const get10 = (d) => d.percentile10;
const get20 = (d) => d.percentile20;
const get30 = (d) => d.percentile30;
const get40 = (d) => d.percentile40;
const get50 = (d) => d.percentile50;
const get60 = (d) => d.percentile60;
const get70 = (d) => d.percentile70;
const get80 = (d) => d.percentile80;
const get90 = (d) => d.percentile90;

export const PercentileLine = ({
  y,
  color = 'var(--color-blue2)',
  curve,
  gradient = false,
}) => {
  const getConfirmedY = useCallback((...d) => getConfirmed(y(...d)), [y]);
  const getExpectedOr50Y = useCallback((...d) => getExpectedOr50(y(...d)), [y]);
  const get10Y = useCallback((...d) => get10(y(...d)), [y]);
  const get20Y = useCallback((...d) => get20(y(...d)), [y]);
  const get30Y = useCallback((...d) => get30(y(...d)), [y]);
  const get40Y = useCallback((...d) => get40(y(...d)), [y]);
  const get50Y = useCallback((...d) => get50(y(...d)), [y]);
  const get60Y = useCallback((...d) => get60(y(...d)), [y]);
  const get70Y = useCallback((...d) => get70(y(...d)), [y]);
  const get80Y = useCallback((...d) => get80(y(...d)), [y]);
  const get90Y = useCallback((...d) => get90(y(...d)), [y]);
  return (
    <>
      <Area y0={get10Y} y1={get90Y} fill={color} opacity="0.1" curve={curve} />
      {gradient && (
        <>
          <Area
            y0={get20Y}
            y1={get80Y}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={get30Y}
            y1={get70Y}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
          <Area
            y0={get40Y}
            y1={get60Y}
            fill={color}
            opacity="0.1"
            curve={curve}
          />
        </>
      )}
      <Line y={get50Y} stroke={color} opacity="0.2" dot={false} curve={curve} />
      <Line y={getExpectedOr50Y} stroke={color} curve={curve} />
      <Points
        y={getConfirmedY}
        stroke={color}
        strokeWidth={1.5}
        r={2}
        fill="var(--color-background)"
        nearestProps={() => ({r: 3.5})}
      />
    </>
  );
};
