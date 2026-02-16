export const theme = {
  colors: {
    dark: '#1a1a1a',
    light: '#f5f5f5',
    white: '#ffffff',
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      dark: '#1a1a1a',
      darkSecondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  spineColors: [
    '#4a5568', // slate
    '#2d3748', // dark slate
    '#744210', // brown
    '#702459', // magenta
    '#1a365d', // navy
    '#234e52', // teal
    '#742a2a', // maroon
    '#553c9a', // purple
  ],
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  transitions: {
    default: '0.3s ease',
  },
};

export type Theme = typeof theme;
