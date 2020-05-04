import * as React from 'react';
import classNames from 'classnames';
import {theme} from '../../styles';
import {
  useContainmentStrategy,
  useLocationData,
  useSetContainmentStrategy,
} from '../modeling';

const {useCallback} = React;

const scaleLabels = {
  linear: 'Linear',
  log: 'Log',
};
const scales = Object.keys(scaleLabels);

export function ScaleControls({scale, setScale}) {
  return (
    <div>
      <style jsx>{`
        div {
          display: flex;
          background: ${theme.color.background};
          margin-left: ${theme.spacing[0]};
          border-radius: 3px;
          box-shadow: 0 0 0 1px ${theme.color.shadow[1]};
          overflow: hidden;
        }
        a {
          display: block;
          padding: 4px ${theme.spacing[0]};
          color: ${theme.color.gray[3]};
          transition: 200ms;
          cursor: pointer;
          background: ${theme.color.gray.bg};
          box-shadow: inset 1px 0 ${theme.color.shadow[1]};
        }
        a:first-child {
          box-shadow: none;
        }
        a.active {
          background: ${theme.color.background};
          color: ${theme.color.gray[4]};
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
}

export function ContainmentControls() {
  const {dateContained} = useLocationData();
  const strategy = useContainmentStrategy();
  const setStrategy = useSetContainmentStrategy();
  const onClick = useCallback(
    () => setStrategy((s) => (s === 'none' ? 'testTrace' : 'none')),
    []
  );

  if (!dateContained()) {
    return null;
  }

  return (
    <a
      className={classNames({active: strategy === 'testTrace'})}
      role="button"
      onClick={onClick}
    >
      <style jsx>{`
        a {
          background: ${theme.color.background};
          margin-left: ${theme.spacing[0]};
          border-radius: 3px;
          box-shadow: 0 0 0 1px ${theme.color.shadow[1]};
          overflow: hidden;
          display: block;
          padding: 4px ${theme.spacing[0]};
          color: ${theme.color.gray[3]};
          transition: 200ms;
          cursor: pointer;
          background: ${theme.color.gray.bg};
        }
        a.active {
          background: ${theme.color.background};
          color: ${theme.color.gray[4]};
        }
        a:hover {
          color: ${theme.color.gray[6]};
        }
      `}</style>
      Test + trace
    </a>
  );
}

export function GraphControls({scale, setScale}) {
  return (
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
          margin-bottom: ${theme.spacing[0]};
          font-size: ${theme.font.size.tiny};
          text-transform: uppercase;
        }
      `}</style>
      <ContainmentControls />
      <ScaleControls scale={scale} setScale={setScale} />
    </div>
  );
}
