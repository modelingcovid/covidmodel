import * as React from 'react';
import {curveCatmullRom} from '@vx/curve';
import {LinePath as VxLinePath} from '@vx/shape';

const {useCallback, useEffect, useRef, useState} = React;

const AnimatedPath = ({
  d,
  duration = '400ms',
  fill = 'transparent',
  ...remaining
}) => {
  const [frozen, setFrozen] = useState(d);
  const animateRef = useRef(null);

  const onEnd = useCallback(() => {
    setFrozen(d);
  }, [d]);

  useEffect(() => {
    const el = animateRef.current;
    if (!el || d === frozen) {
      return;
    }

    if (!el.beginElement) {
      onEnd();
      return;
    }
    el.beginElement();

    // React doesn’t know about this event handler, so we do it the old
    // fashioned way. It has decent compatibility too.
    // https://developer.mozilla.org/en-US/docs/Web/API/SVGAnimationElement/endEvent_event#Browser_compatibility
    el.addEventListener('endEvent', onEnd);
    return () => el.removeEventListener('endEvent', onEnd);
  }, [d, frozen, onEnd]);

  return (
    <path {...remaining} d={frozen} fill={fill}>
      <animate
        dur={duration}
        begin="indefinite"
        attributeName="d"
        fill="freeze"
        to={d}
        ref={animateRef}
        // Tell the animation to use a cubic-bezier curve for timing:
        calcMode="spline"
        keyTimes="0;1"
        // Define the curve (ease-in-out)
        // https://www.w3.org/TR/css-easing-1/#valdef-cubic-bezier-easing-function-ease-in-out
        keySplines="0.42, 0, 0.58, 1"
      />
    </path>
  );
};

export const LinePath = ({
  curve = curveCatmullRom,
  data,
  x,
  y,
  ...remaining
}) => (
  <VxLinePath curve={curve} x={x} y={(d) => Math.round(y(d) * 10000) / 10000}>
    {({path}) => <AnimatedPath {...remaining} d={path(data) || ''} />}
  </VxLinePath>
);
