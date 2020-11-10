import * as React from 'react';
import css from 'styled-jsx/css';
import Head from 'next/head';
import Link from 'next/link';
import {LocationMenu} from './configured';
import {Section} from './content';
import {Suspense} from './util';
import {Notice} from './Notice';
import {theme} from '../styles';

const styles = css`
  .layout {
    padding-bottom: ${theme.spacing[5]};
  }
  header,
  .sticky-anchor {
    position: sticky;
    top: 0;
  }
  .sticky-anchor {
    height: 0;
    z-index: 1;
  }
  header {
    z-index: 100;
  }
  nav,
  .header-background {
    height: 48px;
  }
  .header-background {
    background: ${theme.color.background};
    box-shadow: 0 2px ${theme.color.shadow[0]};
  }
  nav {
    position: relative;
    padding: 12px 0;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: ${theme.font.size.small};
    color: ${theme.color.gray[5]};
  }
  .title {
    font-family: ${theme.font.family.mono};
    color: ${theme.color.gray[5]};
    font-size: 16px;
    display: block;
    flex-shrink: 0;
    font-weight: 500;
    padding-left: 0.4em;
    margin: 0 -0.4em;
  }
  .title:hover {
    color: ${theme.color.gray[6]};
  }
  .pages {
    display: flex;
  }
  .location-menu {
    position: relative;
  }
  .nav-link {
    margin-left: ${theme.spacing[3]};
    font-weight: 500;
  }
  .nav-link:hover {
    text-decoration: underline;
  }
  .nav-link:first-child {
    margin-left: 0;
  }
`;

export function Layout({children}) {
  return (
    <div className="layout">
      <style jsx>{styles}</style>
      <Notice>
        This model was last run on May 14, 2020 and has been archived.
      </Notice>
      <div className="sticky-anchor">
        <Section>
          <div className="header-background" />
        </Section>
      </div>
      <header>
        <Section>
          <nav className="text-small">
            <Link href="/">
              <a className="focus nav-link">Modeling Covid-19</a>
            </Link>
            <div className="pages">
              <div className="nav-link location-menu">
                <LocationMenu
                  menuProps={{
                    style: {left: '50%', transform: 'translateX(-50%)'},
                  }}
                />
              </div>
              <Link href="/about">
                <a className="focus nav-link">About</a>
              </Link>
            </div>
          </nav>
        </Section>
      </header>
      {children}
    </div>
  );
}
