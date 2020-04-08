import * as React from 'react';
import css from 'styled-jsx/css';
import {NearestControl} from './NearestControl';
import {theme} from '../../styles';

const styles = css`
  .hitbox {
    pointer-events: auto;
    user-select: none;
    position: absolute;
    top: 100%;
    transition: transform 100ms ease;
    margin-top: calc(-1 * ${theme.spacing[0]});
    padding: ${theme.spacing[0]} ${theme.spacing[2]};
  }
  .content {
    color: ${theme.color.background};
    background: ${theme.color.gray[5]};
    border-radius: 99em;
    padding: 6px 12px 5px;
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    white-space: nowrap;
  }
`;

export function Scrubber({children, ...remaining}) {
  return (
    <NearestControl>
      {(d, active) => (
        <div
          className="hitbox"
          style={{
            cursor: active ? 'grabbing' : 'grab',
            // Can't scale here, it makes anything that uses mix-blend-mode sad.
            // https://stackoverflow.com/questions/32932966/mix-blend-mode-is-broken-by-3d-transformations-on-page
            transform: `translate(-50%, 3px)`,
          }}
        >
          <style jsx>{styles}</style>
          <div {...remaining} className="content">
            {children(d, active)}
          </div>
        </div>
      )}
    </NearestControl>
  );
}
