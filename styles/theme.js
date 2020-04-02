import {px, toCssProperties} from './util';

export const {values: theme, declarations, properties} = toCssProperties({
  color: {
    background: '#fff',
    focus: ['rgba(66, 153, 225, 0.2)', 'rgba(66, 153, 225, 0.5)'],
    gray: {
      ...['#e0e6eb', '#8691a1', '#515a70', '#2d3146', '#181b2c'],
      bg: '#f6f8fa',
    },
    blue: {
      ...['#b5eff1', '#0096ed', '#0670de', '#0055bc'],
      bg: '#ddfffe',
    },
    yellow: ['#fae498', null, '#ed6804', '#c84801'],
    red: ['#ffa8a8', '#e6082d', '#cd0426'],
    green: [null, null, '#228403'],
    magenta: [null, '#df0371'],
  },
  font: {
    family: {
      ui:
        "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      mono: "'IBM Plex Mono', monospace",
      text: "'IBM Plex Serif', serif",
    },
    size: px({
      micro: 14,
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
  tabletUp: '@media (min-width: 600px)',
};

export const tabletUp = (obj) => ({[breakpoint.tabletUp]: obj});
