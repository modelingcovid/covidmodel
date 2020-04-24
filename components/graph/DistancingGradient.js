import * as React from 'react';
import {hcl, rgb} from 'd3-color';
import {scaleLinear} from '@vx/scale';
import {ScaleGradient, useXScale} from '../graph';
import {useExpected, useLocationData, useModelState} from '../modeling';
import {Suspense, useMatchMedia} from '../util';
import {getFunctionId} from '../../lib/fn';
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

export function useDistancingId(width) {
  const {id} = useModelState();
  const xScale = useXScale();
  const xScaleId = getFunctionId(xScale);
  return `${id}-${xScaleId}-${width}-distancing`;
}

export const DistancingGradientContents = React.memo(
  function DistancingGradientContents({width}) {
    const {indices, x} = useModelState();
    const expected = useExpected();
    const xScale = useXScale();
    const id = useDistancingId(width);
    const isDarkMode = useMatchMedia(mediaQuery.darkMode);
    const {distancing} = useLocationData();
    const inverted = useCallback((n) => 1 - expected(distancing).get(n), [
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
  return null;

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
