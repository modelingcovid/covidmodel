import * as React from 'react';
import {hcl, rgb} from 'd3-color';
import {interpolateHcl, piecewise} from 'd3-interpolate';
import {scaleLinear} from '@vx/scale';
import {ScaleGradient} from '../graph';
import {useModelData} from '../modeling';
import {useMatchMedia} from '../util';
import {dateScale} from '../../lib/date';
import {darkMode, mediaQuery, declarations, properties} from '../../styles';

const getDistancing = ({distancing}) => 1 - distancing;

const distancingScale = scaleLinear({
  domain: [0, 1],
  nice: true,
});

const lightMode = declarations;
const lightSource = rgb(lightMode[properties.color.focus[0]]);
const lightColor = (n) => {
  lightSource.opacity = n * 0.2;
  return lightSource.toString();
};

const darkSource = hcl('#272d4a');
const darkColor = (n) => {
  darkSource.opacity = n * 0.8;
  return darkSource.toString();
};

export function useDistancingId() {
  const {id} = useModelData();
  return `${id}-distancing`;
}

export const DistancingGradient = React.memo(function DistancingGradient({
  size,
}) {
  const {timeSeriesData, x} = useModelData();
  const id = useDistancingId();
  const isDarkMode = useMatchMedia(mediaQuery.darkMode);

  return (
    <ScaleGradient
      color={isDarkMode ? darkColor : lightColor}
      data={timeSeriesData}
      id={id}
      x={(...d) => dateScale(x(...d))}
      y={getDistancing}
      size={size}
    />
  );
});
