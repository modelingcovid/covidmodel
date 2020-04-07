import * as React from 'react';
import css from 'styled-jsx/css';
import {NearestControl} from './NearestControl';
import {theme} from '../../styles';

const styles = css`
  div {
    pointer-events: auto;
    user-select: none;
    position: absolute;
    top: 100%;
    color: ${theme.color.background};
    background: ${theme.color.gray[5]};
    border-radius: 99em;
    padding: 6px 12px 5px;
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    white-space: nowrap;
    transition: transform 100ms ease;
  }
`;

export function Scrubber({children, ...remaining}) {
  return (
    <NearestControl>
      {(d, active) => (
        <div
          {...remaining}
          style={{
            cursor: active ? 'grabbing' : 'grab',
            transform: `translate(-50%, 0) scale(${active ? 1.1 : 1})`,
          }}
        >
          <style jsx>{styles}</style>
          {children(d, active)}
        </div>
      )}
    </NearestControl>
  );
}
