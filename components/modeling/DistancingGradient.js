import * as React from 'react';
import {hcl, rgb} from 'd3-color';
import {interpolateHcl, piecewise} from 'd3-interpolate';
import {scaleLinear} from '@vx/scale';
import {ScaleGradientLayer} from '../graph';
import {useMatchMedia} from '../util';
import {darkMode, mediaQuery, declarations, properties} from '../../styles';

const getDistancing = ({distancing}) => distancing;

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

const darkSource = hcl(darkMode[properties.color.gray[6]]);
const darkColor = (n) => {
  darkSource.opacity = n * 0.8;
  return darkSource.toString();
};

export const DistancingGradient = React.memo(function DistancingGradient() {
  const isDarkMode = useMatchMedia(mediaQuery.darkMode);
  return (
    <ScaleGradientLayer
      color={isDarkMode ? darkColor : lightColor}
      y={getDistancing}
      yScale={distancingScale}
      style={{
        mixBlendMode: isDarkMode ? 'overlay' : 'normal',
      }}
    />
  );
});
