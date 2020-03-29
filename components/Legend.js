import * as React from 'react';

export const Legend = ({color, children}) => (
  <div style={{display: 'flex', margin: '8px 0'}}>
    <div
      style={{
        background: color,
        width: '32px',
        height: '16px',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.2)',
        marginRight: '8px',
      }}
    />
    <div
      style={{
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  </div>
);
