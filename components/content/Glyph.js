import * as React from 'react';
import {theme} from '../../styles';

export function Glyph({fill, mode, ...remaining}) {
  const showCircle = mode === 'fill' || mode === 'stroke';
  return (
    <svg {...remaining} height="12" width="12" viewBox="0 0 12 12">
      <line
        x1="0"
        y1="12"
        x2="12"
        y2="0"
        stroke={fill}
        strokeLinecap="round"
        strokeWidth={2}
        strokeDasharray={mode === 'dash' ? '6,5' : 'none'}
      />
      {showCircle && (
        <circle
          cx="6"
          cy="6"
          r={mode === 'fill' ? 4 : 3.5}
          fill={mode === 'fill' ? fill : theme.color.background}
          stroke={mode === 'stroke' ? fill : 'none'}
          strokeWidth={2}
        />
      )}
    </svg>
  );
}
