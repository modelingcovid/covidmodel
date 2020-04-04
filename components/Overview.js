import * as React from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import {stateLabels} from '../lib/controls';
import {formatNumber} from '../lib/format';
import {theme} from '../styles';

const styles = css`
  .overview {
    font-family: ${theme.font.family.mono};
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
    <div className="overview">
      <style jsx>{styles}</style>
      {ordered.map((state) => {
        const stateName = stateLabels[state];
        const model = overview[state];
        const url = `/state/${state}`;
        return (
          <div key={state}>
            <Link href="/state/[state]" as={url}>
              <a href={url} className="focus">
                {stateName}
              </a>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
