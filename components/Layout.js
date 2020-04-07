import * as React from 'react';
import css from 'styled-jsx/css';
import Head from 'next/head';
import Link from 'next/link';
import {LocationMenu} from './configured';
import {Section} from './content';
import {Notice} from './Notice';
import {theme} from '../styles';

const styles = css`
  .layout {
    padding-bottom: ${theme.spacing[5]};
  }
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: ${theme.color.background};
  }
  nav {
    position: relative;
    padding: ${theme.spacing[1]} 0;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: ${theme.font.size.small};
    color: ${theme.color.gray[5]};
    box-shadow: 0 2px ${theme.color.shadow[0]};
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

export function Layout({children, states}) {
  return (
    <div className="layout">
      <style jsx>{styles}</style>
      <Notice>
        Please do not share these values; this model is under active
        development.
      </Notice>
      <header>
        <Section className="nav">
          <nav>
            <Link href="/">
              <a className="focus title">COSMC</a>
            </Link>
            <div className="pages text-small">
              <Link href="/">
                <a className="focus nav-link">Home</a>
              </Link>
              <div className="nav-link location-menu">
                <LocationMenu
                  states={states}
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
