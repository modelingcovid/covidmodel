import * as React from 'react';
import classNames from 'classnames';

const scaleLabels = {
  linear: 'Linear',
  log: 'Log',
};
const scales = Object.keys(scaleLabels);

export const GraphControls = ({scale, setScale}) => (
  <div>
    <style jsx>{`
      div {
        display: flex;
        justify-content: flex-end;
      }
      a {
        display: block;
        margin-left: var(--spacing1);
        color: var(--color-gray1);
        transition: 200ms;
      }
      a.active {
        color: var(--color-gray3);
      }
      a:hover {
        color: var(--color-gray4);
      }
    `}</style>
    {scales.map((s) => (
      <a
        key={s}
        className={classNames('text-small', {active: scale === s})}
        role="button"
        onClick={() => setScale(s)}
      >
        {scaleLabels[s]}
      </a>
    ))}
  </div>
);
