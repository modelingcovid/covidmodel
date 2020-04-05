import * as React from 'react';
import css from 'styled-jsx/css';
import Head from 'next/head';
import Link from 'next/link';
import {Section} from './content';
import {MDXComponents} from './MDXComponents';
import {Notice} from './Notice';
import {theme} from '../styles';

const styles = css`
  .layout {
    padding-bottom: ${theme.spacing[4]};
  }
  header {
    padding: ${theme.spacing[1]} 0;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: ${theme.font.size.small};
    color: ${theme.color.gray[5]};
  }
  .title {
    font-family: ${theme.font.family.mono};
    color: ${theme.color.gray[2]};
    font-size: 16px;
    display: block;
    flex-shrink: 0;
    font-weight: 500;
    letter-spacing: 0.4em;
    padding-left: 0.4em;
    margin: 0 -0.4em;
  }
  .title:hover {
    color: ${theme.color.gray[6]};
  }
  .link {
    margin-left: ${theme.spacing[2]};
    font-weight: 500;
  }
  .link:hover {
    text-decoration: underline;
  }
  .link:first-of-type {
    margin-left: 0;
  }
`;

export const App = ({children}) => (
  <MDXComponents>
    <Head>
      <title>
        Modeling COVID-19 — The COVID Open Source Modeling Collaboration
      </title>
      <meta
        name="description"
        content="COVID-19 forecasting models trained to actual social distancing, PCR tests, and fatality data."
      />
    </Head>
    <div className="layout">
      <style jsx>{styles}</style>
      <Notice>
        Please do not share these values; this model is under active
        development.
      </Notice>
      <Section>
        <header>
          <Link href="/">
            <a className="focus title">COSMC</a>
          </Link>
          <div className="pages text-small">
            <Link href="/">
              <a className="focus link">Overview</a>
            </Link>
            <Link href="/about">
              <a className="focus link">About</a>
            </Link>
          </div>
        </header>
      </Section>
      {children}
    </div>
  </MDXComponents>
);
