import * as React from 'react';
import {scaleLinear, scaleSymlog} from '@vx/scale';
import {useGraphData} from './useGraphData';
import {useXScale} from './useXScale';
import {useComponentId} from '../util';
import {useModelState} from '../modeling';
import {maybe} from '../../lib/fn';
import {formatLargeNumber, formatShortDate} from '../../lib/format';
import {theme} from '../../styles';

const {createContext, useCallback, useMemo, useState} = React;

const {sign, pow, floor, log10, abs} = Math;
const floorLog = (n) =>
  sign(n) * pow(10, floor(log10(abs(n)) + (n >= 0 ? 0 : 1)));
const ceilLog = (n) =>
  sign(n) * pow(10, floor(log10(abs(n)) + (n >= 0 ? 1 : 0)));

const marginDecorated = {top: 64, left: 16, right: 16, bottom: 32};
const marginCompact = {top: 1, left: 1, right: 1, bottom: 1};

export const useGraphConfig = function Graph({
  domain = 1,
  scale = 'linear',
  width: propWidth = 600,
  height = 400,
  decoration = false,
  frameless = false,
  scrubber = false,
  nice = true,
}) {
  const {indices, x} = useModelState();
  const xScaleSource = useXScale();
  const data = indices();

  const margin = decoration ? marginDecorated : marginCompact;
  const width = propWidth + margin.left + margin.right;

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = useMemo(() => xScaleSource.copy().range([0, xMax]), [
    xScaleSource,
    xMax,
  ]);

  const yScale = useMemo(() => {
    const yDomain = [0, maybe(domain)];
    switch (scale) {
      case 'log':
        // scaleSymlog allows us to define a log scale that includes 0, but d3
        // doesn’t have a useful domain nicing or default ticks... so we define
        // our own.
        const domainMin = floorLog(yDomain[0]);
        const domainMax = ceilLog(yDomain[1]);
        const yScale = scaleSymlog({
          domain: [domainMin, domainMax],
          range: [yMax, 0],
        });

        const ticks = [0];
        let currentTick = 10;
        while (domainMax >= currentTick) {
          ticks.push(currentTick);
          currentTick = currentTick * 10;
        }
        if (currentTick === 10 && domainMax > 0) {
          while (currentTick > domainMax) {
            currentTick = currentTick / 10;
          }
          ticks.push(currentTick);
        }

        yScale.ticks = (count) => ticks;

        return yScale;
      case 'linear':
      default:
        return scaleLinear({
          domain: yDomain,
          range: [yMax, 0],
          nice,
        });
    }
  }, [domain, nice, scale, yMax]);

  const id = useComponentId('graph');

  const clipPathId = `${id}-boundary`;
  const clipPath = frameless ? 'none' : `url(#${clipPathId})`;
  return useMemo(
    () => ({
      data,
      clipPath,
      clipPathId,
      decoration,
      frameless,
      height,
      id,
      margin,
      scrubber,
      width,
      x,
      xScale,
      yScale,
      xMax,
      yMax,
    }),
    [
      data,
      clipPath,
      clipPathId,
      decoration,
      frameless,
      height,
      id,
      margin,
      scrubber,
      width,
      x,
      xScale,
      yScale,
      xMax,
      yMax,
    ]
  );
};
