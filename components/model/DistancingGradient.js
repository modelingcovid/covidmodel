import * as React from 'react';
import {scaleLinear} from '@vx/scale';
import {ScaleGradientLayer} from '../graph';

const getDistancing = ({distancing}) => distancing;

const distancingScale = scaleLinear({
  domain: [0, 1],
  nice: true,
});

export const DistancingGradient = () => (
  <ScaleGradientLayer
    y={getDistancing}
    yScale={distancingScale}
    style={{opacity: '0.2'}}
  />
);
