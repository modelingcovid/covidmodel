import * as React from 'react';
import css from 'styled-jsx/css';
import {useNearestPoint} from './useNearestPoint';

const {useCallback, useEffect, useRef} = React;

const styles = css`
  div {
    position: absolute;
    top: 0;
    bottom: 0;
  }
`;

export const NearestOverlay = ({
  anchor = 'middle',
  children,
  y,
  style = {},
  ...remaining
}) => {
  const nearest = useNearestPoint(y);
  if (!nearest) {
    return null;
  }

  const transforms = [`translate(${nearest.x}px, ${nearest.y}px)`];
  if (anchor === 'middle') {
    transforms.push('translateX(-50%)');
  }
  if (anchor === 'end') {
    transforms.push('translateX(-100%)');
  }
  if (style.transform) {
    transforms.push(style.transform);
  }

  return (
    <div
      {...remaining}
      style={{
        ...style,
        transform: transforms.filter(Boolean).join(' '),
      }}
    >
      <style jsx>{styles}</style>
      {children(nearest?.data)}
    </div>
  );
};
