import {px, toCssProperties} from './util';

export const {
  values: theme,
  declarations,
  setProperties,
  properties,
} = toCssProperties({
  color: {
    background: '#fff',
    backgroundRgb: '255, 255, 255',
    focus: [
      'rgba(66, 153, 225, 0.2)',
      'rgba(66, 153, 225, 0.5)',
      'rgba(66, 153, 225, 0.7)',
    ],
    shadow: [
      'rgba(24, 27, 44, 0.1)',
      'rgba(24, 27, 44, 0.2)',
      'rgba(24, 27, 44, 0.4)',
    ],
    gray: {
      ...[
        '#e0e6eb',
        '#c0c8d2',
        '#8691a1',
        '#687386',
        '#515a70',
        '#2d3146',
        '#181b2c',
      ],
      bg: '#f2f5f7',
      muted: '#515a70',
    },
    blue: {
      ...['#b5eff1', '#0096ed', '#0670de', '#0055bc'],
      bg: '#f2f9fe',
      text: '#0670de',
    },
    yellow: {
      ...['#fae498', '#fcbd3a', '#ff8f0e', '#ed6804', '#c84801'],
      text: '#ed6804',
      muted: '#8b5904',
    },
    red: {...['#ffa8a8', '#e6082d', '#cd0426'], text: '#cd0426'},
    green: {...['#48c404', '#3fad1c', '#38991a'], text: '#38991a'},
    magenta: ['#d64b91', '#df0371'],
    purple: {...['#f0defe'], muted: '#5a2c8e'},
  },
  font: {
    family: {
      ui:
        "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      mono: "'IBM Plex Mono', monospace",
      text: "'IBM Plex Serif', serif",
    },
    size: {
      // TODO(koop): Define this in relation to other variables
      jumbo: 'calc(var(--maxWidth) * 0.08)',
      ...px({
        tiny: 12,
        micro: 13,
        small: 14,
        title: 28,
        dek: 22,
        subtitle: 16,
        section: 20,
        body: 17,
        pullquote: 19,
      }),
    },
    spacing: {
      jumbo: '-0.04em',
      title: '-0.038em',
      section: '-0.015em',
      dek: '-0.02em',
      pullquote: '-0.02em',
      ui: '-0.01em',
    },
  },
  spacing: px([8, 16, 24, 32, 64, 96]),
  column: {
    count: 12,
    // TODO(koop): Define this in relation to other variables
    width: `calc(
      (var(--maxWidth) - var(--gutterWidth) * 2) / var(--column-count)
    )`,
  },
  maxWidth: '100vw',
  gutterWidth: px(16),
});

export const breakpoint = {
  tabletUp: '@media (min-width: 600px)',
};
export const mediaQuery = {
  darkMode: '@media (prefers-color-scheme: dark)',
};

export const tabletUp = setProperties({
  font: {
    size: {
      // TODO(koop): Define this in relation to other variables
      jumbo: 'calc(var(--maxWidth) * 0.055)',
      ...px({
        title: 36,
        dek: 28,
        subtitle: 20,
        section: 26,
        body: 18.5,
        pullquote: 21,
        small: 15,
      }),
    },
    spacing: {
      jumbo: '-0.024em',
      title: '-0.02em',
    },
  },
});

export const darkMode = setProperties({
  color: {
    background: '#181b2c',
    backgroundRgb: '24, 27, 44',
    focus: [
      'hsla(213, 90%, 75%, 0.3)',
      'hsla(213, 90%, 75%, 0.6)',
      'hsla(213, 90%, 75%, 0.8)',
    ],
    shadow: [
      'rgba(255, 255, 255, 0.1)',
      'rgba(255, 255, 255, 0.2)',
      'rgba(255, 255, 255, 0.4)',
    ],
    gray: {
      ...[
        '#2d3146',
        '#3c445d',
        '#8691a1',
        '#a3acba',
        '#c0c8d2',
        '#e0e6eb',
        '#f6f8fa',
      ],
      bg: '#1d2135',
      muted: '#c0c8d2',
    },
    red: {...['#ffa8a8', '#ff0a33', '#f00028'], text: '#ff0a33'},
    green: {...['#79de41', '#62dc3c', '#56de2c'], text: '#56de2c'},
    blue: {
      ...['#b5eff1', '#26afff', '#0096ed', '#0b7ef9'],
      bg: '#1e2639',
      text: '#26afff',
    },
    yellow: {
      ...['#fae498', '#fcbd3a', '#ff8f0e', '#ed6804', '#c84801'],
      text: '#ff8f0e',
      muted: '#822707',
    },
    magenta: ['#d64b91', '#ff248e'],
  },
});
