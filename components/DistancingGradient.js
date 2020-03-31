import * as React from 'react';
import {ScaleGradientLayer} from './graph';
import {scaleLinear} from '@vx/scale';

const getDistancing = ({distancing}) => distancing;

const distancingScale = scaleLinear({
  domain: [0, 1],
  nice: true,
});

// const y = (d) => distancingScale(getDistancing(d));

export const DistancingGradient = () => (
  <ScaleGradientLayer
    y={getDistancing}
    yScale={distancingScale}
    style={{opacity: '0.2'}}
  />
);
