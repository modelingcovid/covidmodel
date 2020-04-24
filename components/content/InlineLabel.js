import * as React from 'react';
import {theme} from '../../styles';

function getFirstWord(children) {
  if (typeof children !== 'string') {
    return ['', children];
  }
  const index = children.indexOf(' ');
  if (index === -1) {
    return [children, ''];
  }
  return [children.slice(0, index), children.slice(index)];
}

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
  const [first, rest] = getFirstWord(children);
  return (
    <span
      {...remaining}
      style={{
        ...style,
        fontFamily: theme.font.family.ui,
        fontWeight: 500,
        letterSpacing: theme.font.spacing.ui,
        color,
      }}
    >
      <span className="nowrap">
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
        {first}
      </span>
      {rest}
    </span>
  );
}
