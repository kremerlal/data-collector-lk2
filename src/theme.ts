import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { AppBranding } from './types';

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
  contrastText: '#0c2340',
};

function paletteFromBranding(mode: ColorMode, branding?: AppBranding) {
  const colors = mode === 'dark' ? branding?.dark : branding?.light;
  const isDark = mode === 'dark';
  const fallbackPrimary = isDark ? DHS_PRIMARY_DARK_CONTENT : DHS_PRIMARY;
  return {
    primary: colors
      ? { main: colors.primary, light: colors.primary_light, dark: colors.primary_dark }
      : fallbackPrimary,
    secondary: colors
      ? { main: colors.secondary, light: colors.secondary, dark: colors.secondary }
      : { main: '#c41230', light: '#e03a52', dark: '#9a0e26' },
    background: colors
      ? { default: colors.background, paper: colors.paper }
      : isDark
        ? { default: '#0c2340', paper: '#112e51' }
        : { default: '#f8f9fb', paper: '#ffffff' },
    text: colors
      ? { primary: colors.text_primary, secondary: colors.text_secondary }
      : isDark
        ? { primary: 'rgba(255, 255, 255, 0.96)', secondary: 'rgba(255, 255, 255, 0.76)' }
        : { primary: '#1b1b1b', secondary: '#5c5c5c' },
  };
}

/** MUI theme for the content area — synced with Scorecard content-theme toggle. */
export function getTheme(mode: ColorMode, branding?: AppBranding): Theme {
  const isDark = mode === 'dark';
  const palette = paletteFromBranding(mode, branding);
  return createTheme({
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      text: palette.text,
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
          containedPrimary: ({ theme }) =>
            theme.palette.mode === 'dark'
              ? {
                  backgroundColor: DHS_PRIMARY.main,
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: DHS_PRIMARY.light,
                  },
                }
              : {},
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
