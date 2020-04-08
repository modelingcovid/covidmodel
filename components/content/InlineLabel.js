import * as React from 'react';
import {theme} from '../../styles';

export function InlineLabel({
  children,
  color,
  fill = theme.color.background,
  list = false,
  stroke = 'transparent',
  strokeWidth = 0,
  style = {},
  ...remaining
}) {
  return (
    <span
      {...remaining}
      style={{
        ...style,
        fontFamily: theme.font.family.ui,
        fontWeight: 500,
        color,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          height: 8,
          width: 8,
          margin: `0 ${list ? theme.spacing[0] : '6px'} 0 ${
            list ? `calc(-1 * ${theme.spacing[1]})` : '6px'
          }`,
          verticalAlign: 'middle',
          position: 'relative',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: strokeWidth ? stroke : fill,
            height: 16,
            width: 2,
            position: 'absolute',
            left: 3,
            top: -4,
            transform: 'rotate(45deg)',
          }}
        />
        <span
          style={{
            display: 'inline-block',
            background: fill,
            boxShadow: `inset 0 0 0 ${strokeWidth}px ${stroke}`,
            position: 'absolute',
            borderRadius: 8,
            height: 8,
            width: 8,
          }}
        />
      </span>
      {children}
    </span>
  );
}
