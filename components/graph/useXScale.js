import * as React from 'react';
import {scaleUtc} from '@vx/scale';
import {maybe, memo} from '../../lib/fn';

const {createContext, useCallback, useContext} = React;

const defaultStart = new Date('2020-01-01').getTime();
const defaultEnd = new Date('2021-01-01').getTime();

export function createXScale({start, end}) {
  return scaleUtc({
    clamp: true,
    domain: [start, end],
    range: [0, 1],
  });
}

const defaultXScale = createXScale({start: defaultStart, end: defaultEnd});
const defaultXScaleFn = () => defaultXScale;

export const XScaleContext = createContext(defaultXScaleFn);

export function useCreateXScale({start = defaultStart, end = defaultEnd} = {}) {
  return useCallback(
    memo(() => createXScale({start: maybe(start), end: maybe(end)})),
    [start, end]
  );
}

export function useXScale() {
  return useContext(XScaleContext)();
}
