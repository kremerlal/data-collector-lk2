import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export type ColorMode = 'light' | 'dark';

const DHS_PRIMARY = {
  main: '#005288',
  light: '#0078ae',
  dark: '#0c2340',
};

const DHS_PRIMARY_DARK_CONTENT = {
  main: '#7dd3fc',
  light: '#bae6fd',
  dark: '#005288',
};

/** MUI theme for the content area — synced with Scorecard content-theme toggle. */
export function getTheme(mode: ColorMode): Theme {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: isDark ? DHS_PRIMARY_DARK_CONTENT : DHS_PRIMARY,
      secondary: { main: '#c41230', light: '#e03a52', dark: '#9a0e26' },
      background: isDark
        ? { default: '#0c2340', paper: '#112e51' }
        : { default: '#f8f9fb', paper: '#ffffff' },
      text: isDark
        ? { primary: 'rgba(255, 255, 255, 0.96)', secondary: 'rgba(255, 255, 255, 0.76)' }
        : { primary: '#1b1b1b', secondary: '#5c5c5c' },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.10)',
    },
    typography: {
      fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontFamily: '"Source Serif 4", "Source Sans 3", serif' },
      h2: { fontFamily: '"Source Serif 4", "Source Sans 3", serif' },
      h3: { fontFamily: '"Source Serif 4", "Source Sans 3", serif' },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { fontWeight: 600, textTransform: 'none' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
    },
  });
}
