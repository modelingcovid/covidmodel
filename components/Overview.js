import * as React from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import {Label} from './content';
import {LocationMap, StateSelect} from './configured';
import {stateLabels} from '../lib/controls';
import {formatNumber} from '../lib/format';
import {theme} from '../styles';

const styles = css`
  .map-heading {
    font-size: ${theme.font.size.body};
    font-weight: 600;
    color: ${theme.color.gray[5]};
    margin-bottom: ${theme.spacing[1]};
    text-align: center;
  }
  .map-heading span {
    background: ${theme.color.gray[0]};
    padding: 4px ${theme.spacing[0]};
  }
  .location {
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size.small};
    columns: 2;
  }
  .location-label {
    font-size: ${theme.font.size.small};
  }
  a {
    color: ${theme.color.gray[5]};
    text-decoration: underline;
    padding: ${theme.spacing[0]};
    margin: 0 calc(-1 * ${theme.spacing[0]});
    display: inline-block;
  }
  a:hover {
    color: ${theme.color.blue[2]};
  }
  @media (min-width: 600px) {
    .map-heading {
      margin-bottom: 0;
    }
    .location {
      columns: 3;
    }
    a {
      padding: 0;
    }
  }
`;

export function Overview({overview, states, topo}) {
  const ordered = states;
  return (
    <div>
      <style jsx>{styles}</style>
      <div className="margin-top-4 map-heading">
        <span>Modeled states in the U.S.</span>
      </div>
      <LocationMap states={states} topo={topo} />
      <div className="location margin-top-3">
        {ordered.map((state) => {
          const stateName = stateLabels[state];
          const model = overview[state];
          const url = `/state/${state}`;
          return (
            <div className="location-label" key={state}>
              <Link href="/state/[state]" as={url}>
                <a href={url} className="focus">
                  {stateName}
                </a>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
