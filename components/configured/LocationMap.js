import * as React from 'react';
import * as topojson from 'topojson-client';
import {geoPath} from 'd3-geo';
import {useNavigateToLocation} from './useNavigateToLocation';
import {useContentRect} from '../util';
import {stateCodes} from '../../lib/controls';
import {theme} from '../../styles';

const {useMemo, useRef, useState} = React;

function State({feature, path, states}) {
  const navigateToLocation = useNavigateToLocation();
  const [hover, setHover] = useState(false);
  const state = stateCodes[feature.properties.name];
  const hasState = states.includes(state);
  const d = path(feature);
  if (!hasState) {
    return <path d={d} fill={theme.color.gray[0]} strokeWidth={0.5} />;
  }
  return (
    <path
      d={d}
      fill={hover ? theme.color.gray[2] : theme.color.gray[1]}
      strokeWidth={0.5}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigateToLocation(state)}
      cursor="pointer"
      style={{transition: 'fill 150ms 25ms ease-in-out'}}
    />
  );
}

export function LocationMap({states, topo, ...remaining}) {
  const sizeRef = useRef(null);
  const {width} = useContentRect(sizeRef, {width: 896});

  const {features, mesh} = useMemo(
    () => ({
      features: topojson.feature(topo, topo.objects.states).features,
      mesh: topojson.mesh(topo, topo.objects.states, (a, b) => a !== b),
    }),
    [topo]
  );

  const path = useMemo(geoPath, []);
  const height = 0.625 * width;

  return (
    <div {...remaining} ref={sizeRef}>
      <svg width={width} height={height} viewBox="0 0 975 610">
        <g>
          {features.map((feature, i) => (
            <State key={i} feature={feature} path={path} states={states} />
          ))}
          <path
            strokeLinejoin="round"
            pointerEvents="none"
            d={path(mesh)}
            fill="none"
            stroke={theme.color.background}
          />
        </g>
      </svg>
    </div>
  );
}
