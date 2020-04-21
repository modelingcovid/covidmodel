import * as React from 'react';
import {hcl, rgb} from 'd3-color';
import {scaleLinear} from '@vx/scale';
import {ScaleGradient} from '../graph';
import {useLocationData, useModelState} from '../modeling';
import {Suspense, useMatchMedia} from '../util';
import {darkMode, mediaQuery, declarations, properties} from '../../styles';

const {useCallback} = React;

const distancingScale = scaleLinear({
  domain: [0, 1],
  nice: true,
});

const lightMode = declarations;
const lightSource = rgb(lightMode[properties.color.focus[0]]);
const lightColor = (n) => {
  lightSource.opacity = n * 0.1;
  return lightSource.toString();
};

const darkSource = rgb(darkMode[properties.color.focus[0]]);
const darkColor = (n) => {
  darkSource.opacity = n * 0.1;
  return darkSource.toString();
};

export function useDistancingId() {
  const {id} = useModelState();
  return `${id}-distancing`;
}

export const DistancingGradientContents = React.memo(
  function DistancingGradientContents({width}) {
    const {indices, x, xScale} = useModelState();
    const id = useDistancingId();
    const isDarkMode = useMatchMedia(mediaQuery.darkMode);
    const {distancing} = useLocationData();
    const inverted = useCallback((n) => 1 - distancing.expected.get(n), [
      distancing,
    ]);

    return (
      <ScaleGradient
        color={isDarkMode ? darkColor : lightColor}
        data={indices}
        id={id}
        x={(...d) => xScale(x(...d))}
        y={inverted}
        width={width}
      />
    );
  }
);

export function DistancingGradient({width}) {
  return (
    <Suspense fallback={<div />}>
      <svg
        viewBox={`0 0 ${width} 0`}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <DistancingGradientContents width={width} />
      </svg>
    </Suspense>
  );
}
