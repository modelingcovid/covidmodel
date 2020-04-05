import * as React from 'react';
import css from 'styled-jsx/css';
import Head from 'next/head';
import Link from 'next/link';
import {Section} from './content';
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
  .pages {
    display: flex;
  }
  .link {
    margin-left: ${theme.spacing[2]};
    font-weight: 500;
  }
  .link:hover {
    text-decoration: underline;
  }
  .link:first-child {
    margin-left: 0;
  }
`;

export const Layout = ({children, state}) => (
  <div className="layout">
    <style jsx>{styles}</style>
    <Notice>
      Please do not share these values; this model is under active development.
    </Notice>
    <Section>
      <header>
        <Link href="/">
          <a className="focus title">COSMC</a>
        </Link>
        <div className="pages text-small">
          <Link href="/">
            <a className="focus link">Home</a>
          </Link>
          <Link href="/about">
            <a className="focus link">About</a>
          </Link>
        </div>
      </header>
    </Section>
    {children}
  </div>
);
