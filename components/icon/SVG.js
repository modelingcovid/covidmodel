import * as React from 'react';

export const SVG = ({children, size = 18, viewBox, ...props}) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    height={size}
    width={size}
  >
    <style jsx>{`
      svg {
        display: inline-block;
        fill: currentColor;
        vertical-align: middle;
        transform: translateY(-7.5%);
      }
    `}</style>
    {children}
  </svg>
);
