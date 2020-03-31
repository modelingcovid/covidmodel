import * as React from 'react';
import {NearestOverlay} from './graph';
import {PercentileLine} from './PercentileLine';
import {PopulationGraph} from './PopulationGraph';
import {getDate} from '../lib/date';
import {formatWholeNumber} from '../lib/format';

const getCumulativeDeaths = ({cumulativeDeaths}) => cumulativeDeaths;

export const ProjectedDeaths = ({data, scenario, state, width, height}) => (
  <div>
    <div className="section-heading">Projected deaths</div>
    <p className="paragraph">
      We project the cumulative number of deaths on a logarithmic scale. Black
      dots are confirmed counts.
    </p>
    <PopulationGraph
      scenario={scenario}
      data={data}
      x={getDate}
      xLabel="people"
      width={width}
      height={height}
      overlay={
        <NearestOverlay style={{top: '100%', transform: 'translateY(32px)'}}>
          {(nearest) => {
            const confirmed = getCumulativeDeaths(nearest).confirmed;
            return (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 'var(--font-size-small)',
                }}
              >
                <div className="text-mono text-gray">
                  {formatWholeNumber(getCumulativeDeaths(nearest).projected)}{' '}
                  <span className="text-gray-faint">deaths projected</span>
                </div>
                {confirmed && (
                  <div className="text-mono text-gray">
                    {formatWholeNumber(getCumulativeDeaths(nearest).confirmed)}{' '}
                    <span className="text-gray-faint">deaths confirmed</span>
                  </div>
                )}
              </div>
            );
          }}
        </NearestOverlay>
      }
    >
      <PercentileLine y={getCumulativeDeaths} color="var(--color-blue-02)" />
    </PopulationGraph>
  </div>
);
