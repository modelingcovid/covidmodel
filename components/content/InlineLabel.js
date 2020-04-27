import * as React from 'react';
import {Glyph} from './Glyph';
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
  glyph = 'fill',
  fill = theme.color.background,
  list = false,
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
        <Glyph
          fill={fill}
          mode={glyph}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            margin: `-1px 4px 0 ${
              list ? `calc(-1 * ${theme.spacing[1]})` : '4px'
            }`,
          }}
        />
        {first}
      </span>
      {rest}
    </span>
  );
}
