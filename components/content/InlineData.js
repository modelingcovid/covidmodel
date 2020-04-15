import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../../styles';
import {Suspense} from '../util';
import {formatText} from './Text';

const styles = css`
  span {
    background-size: 200% 100%;
    background-color: ${theme.color.gray[0]};
    background-image: linear-gradient(
      to right,
      ${theme.color.gray[0]} 50%,
      ${theme.color.gray[1]} 80%,
      ${theme.color.gray[0]} 100%
    );
    border-radius: 999em;
    display: inline-block;
    height: 1em;
    position: relative;
    vertical-align: middle;
    transform: translateY(-1px);
    animation: placeholder 1s 800ms infinite ease-in-out both;
    margin: 0 4px;
  }
  @keyframes placeholder {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: 0 center;
    }
  }
`;

export function InlinePlaceholder({width = '3em'}) {
  return (
    <span
      title="Loading…"
      style={{
        width,
      }}
    >
      <style jsx>{styles}</style>
    </span>
  );
}

export function InlineDataInner({children}) {
  return <span>{formatText(children(), 'inline')}</span>;
}

export function InlineData({children, width}) {
  return (
    <Suspense fallback={<InlinePlaceholder width={width} />}>
      <InlineDataInner>{children}</InlineDataInner>
    </Suspense>
  );
}
