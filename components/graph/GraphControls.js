import * as React from 'react';
import classNames from 'classnames';
import {theme} from '../../styles';

const scaleLabels = {
  linear: 'Linear',
  log: 'Log',
};
const scales = Object.keys(scaleLabels);

export const GraphControls = ({scale, setScale}) => (
  <div>
    <style jsx>{`
      div {
        position: absolute;
        pointer-events: auto;
        bottom: 100%;
        right: 0;
        display: flex;
        justify-content: flex-end;
        clear: both;
        font-size: ${theme.font.size.micro};
        background: ${theme.color.background};
        margin-bottom: ${theme.spacing[0]};
      }
      a {
        display: block;
        margin-left: ${theme.spacing[1]};
        color: ${theme.color.gray[2]};
        transition: 200ms;
        cursor: pointer;
      }
      a.active {
        color: ${theme.color.gray[5]};
      }
      a:hover {
        color: ${theme.color.gray[6]};
      }
    `}</style>
    {scales.map((s) => (
      <a
        key={s}
        className={classNames({active: scale === s})}
        role="button"
        onClick={() => setScale(s)}
      >
        {scaleLabels[s]}
      </a>
    ))}
  </div>
);
