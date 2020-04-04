import * as React from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import {stateLabels} from '../lib/controls';
import {formatNumber} from '../lib/format';
import {theme} from '../styles';

const styles = css`
  table {
    --table-columns: 2;
    table-layout: fixed;
    width: calc(8 * ${theme.column.width});
    font-size: ${theme.font.size.small};
  }
  th,
  td {
    text-align: right;
    font-family: ${theme.font.family.mono};
    position: relative;
    z-index: 1;
  }
  th:first-child,
  td:first-child {
    text-align: left;
  }
  td:first-child::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -2px;
    width: calc(var(--table-columns) * 100%);
    height: 100%;
    box-sizing: content-box;
    padding: 2px 4px;
    z-index: -1;
    transform: scale(0.99);
    transition: transform 200ms ease-in-out;
  }
  tr:hover td:first-child::before {
    transform: scale(1);
    background: ${theme.color.gray[0]};
  }
  tbody tr {
    cursor: pointer;
    position: relative;
  }
`;

export function Overview({overview, states}) {
  const ordered = states;
  return (
    <table>
      <style jsx>{styles}</style>
      <thead>
        <tr>
          <th>Location</th>
          <th>Population</th>
        </tr>
      </thead>
      <tbody>
        {ordered.map((state) => {
          const stateName = stateLabels[state];
          const model = overview[state];
          const url = `/state/${state}`;
          return (
            <Link key={state} href="/state/[state]" as={url}>
              <tr>
                <td>
                  <a href={url}>{stateName}</a>
                </td>
                <td>{formatNumber(model.population)}</td>
              </tr>
            </Link>
          );
        })}
      </tbody>
    </table>
  );
}
