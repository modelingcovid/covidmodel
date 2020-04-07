import * as React from 'react';
import {NearestOverlay} from './NearestOverlay';
import {useGraphData} from './useGraphData';
import {useSetNearestData} from './useNearestData';
import {useNearestPoint} from './useNearestPoint';

const {useCallback, useEffect, useState, useRef} = React;

export const NearestControl = ({children, y, ...remaining}) => {
  const [active, setActive] = useState(false);
  const nearest = useNearestPoint(y);
  const {margin, xScale} = useGraphData();

  const setNearestData = useSetNearestData();
  const marginLeft = margin.left;
  const nearestX = (nearest && nearest.x) || 0;

  const activeRef = useRef(null);

  const onStart = useCallback(
    (event) => {
      let last = event.changedTouches ? event.changedTouches[0].clientX : null;
      activeRef.current = {x: nearestX, last};
      setActive(true);
    },
    [activeRef, nearestX, setActive]
  );

  useEffect(() => {
    const handler = (event) => {
      activeRef.current = null;
      setActive(false);
    };
    const leave = (event) => {
      if (event.target === document.body) {
        handler(event);
      }
    };
    document.body.addEventListener('mouseleave', leave, true);
    document.body.addEventListener('mouseup', handler, true);
    document.body.addEventListener('touchend', handler, true);
    return () => {
      document.body.removeEventListener('mouseleave', leave, true);
      document.body.removeEventListener('mouseup', handler, true);
      document.body.removeEventListener('touchend', handler, true);
    };
  }, [activeRef, setActive]);

  const onMove = useCallback(
    (diff) => {
      if (!activeRef.current) {
        return;
      }
      activeRef.current.x += diff;
      const x0 = xScale.invert(activeRef.current.x);
      setNearestData(x0);
    },
    [activeRef, setNearestData, xScale]
  );

  useEffect(() => {
    const mousemove = (event) => {
      if (!activeRef.current) {
        return;
      }
      onMove(event.movementX);
    };

    const touchmove = () => {
      if (!activeRef.current || !event.changedTouches) {
        return;
      }

      const {clientX} = event.changedTouches[0];
      const {last} = activeRef.current;
      const diff = last == null ? 0 : clientX - last;
      activeRef.current.last = clientX;

      // Don't scroll when using the slider on a touch device.
      event.preventDefault();
      onMove(diff);
    };
    const touchoptions = {
      capture: true,
      passive: false,
    };

    document.body.addEventListener('mousemove', mousemove, true);
    document.body.addEventListener('touchmove', touchmove, touchoptions);
    return () => {
      document.body.removeEventListener('mousemove', mousemove, true);
      document.body.removeEventListener('touchmove', touchmove, touchoptions);
    };
  }, [activeRef, onMove]);

  if (!nearest) {
    return null;
  }

  return (
    <NearestOverlay {...remaining} onMouseDown={onStart} onTouchStart={onStart}>
      {(d) => children(d, active)}
    </NearestOverlay>
  );
};
