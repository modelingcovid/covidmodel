import * as React from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import {Label} from './content';
import {StateSelect} from './configured';
import {stateLabels} from '../lib/controls';
import {formatNumber} from '../lib/format';
import {theme} from '../styles';

const styles = css`
  .select {
    display: flex;
    padding-top: ${theme.spacing[1]};
    padding-bottom: ${theme.spacing[3]};
  }
  .location {
    font-family: ${theme.font.family.mono};
    font-size: ${theme.font.size.small};
  }
  .location-label {
    font-size: ${theme.font.size.small};
  }
  a {
    color: ${theme.color.gray[3]};
    text-decoration: underline;
  }
  a:hover {
    color: ${theme.color.blue[2]};
  }
`;

export function Overview({overview, states}) {
  const ordered = states;
  return (
    <div>
      <style jsx>{styles}</style>
      <div className="select">
        <StateSelect states={states} />
      </div>
      <div className="location">
        <div className="margin-bottom-0">
          <Label color="yellow">Modeled locations</Label>
        </div>
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
