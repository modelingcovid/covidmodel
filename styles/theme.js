import {px, toCssProperties} from './util';

export const {
  values: theme,
  declarations,
  setProperties,
  properties,
} = toCssProperties({
  color: {
    background: '#fff',
    focus: ['rgba(66, 153, 225, 0.2)', 'rgba(66, 153, 225, 0.5)'],
    shadow: ['rgba(24, 27, 44, 0.1)'],
    gray: {
      ...['#e0e6eb', '#8691a1', '#515a70', '#2d3146', '#181b2c'],
      bg: '#f6f8fa',
      muted: '#515a70',
    },
    blue: {
      ...['#b5eff1', '#0096ed', '#0670de', '#0055bc'],
      bg: '#ddfffe',
    },
    yellow: {
      ...['#fae498', null, '#ed6804', '#c84801'],
      muted: '#8b5904',
    },
    red: ['#ffa8a8', '#e6082d', '#cd0426'],
    green: [null, null, '#228403'],
    magenta: [null, '#df0371'],
    purple: {...['#f0defe'], muted: '#5a2c8e'},
  },
  font: {
    family: {
      ui:
        "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      mono: "'IBM Plex Mono', monospace",
      text: "'IBM Plex Serif', serif",
    },
    size: px({
      micro: 13,
      small: 14,
      jumbo: 36,
      title: 20,
      subtitle: 16,
      section: 20,
      body: 16,
    }),
  },
  spacing: px([8, 16, 32, 64, 96]),
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
  tabletUp: '(min-width: 600px)',
};
export const mediaQuery = {
  darkMode: '(prefers-color-scheme: dark)',
};

export const darkMode = setProperties({
  color: {
    background: '#181b2c',
    shadow: ['rgba(255, 255, 255, 0.1)'],
    gray: {
      ...['#2d3146', '#8691a1', '#c0c8d2', '#e0e6eb', '#f6f8fa'],
      bg: '#2d3146',
      muted: '#c0c8d2',
    },
    red: ['#ffa8a8', '#ff0a33', '#f00028'],
    blue: {
      ...['#b5eff1', '#26afff', '#0096ed', '#0670de'],
      bg: '#ddfffe',
    },
    yellow: {
      ...['#fcbd3a', null, '#ff8f0e', '#ed6804'],
      muted: '#a82c00',
    },
    magenta: [null, '#ff248e'],
  },
});
