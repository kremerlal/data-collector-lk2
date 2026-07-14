import { useColorMode } from '../colorMode';
import type { ColorMode } from '../theme';

export type ContentTheme = ColorMode;

/** Content-area theme toggle (sidebar/header stay navy). Synced with MUI ThemeProvider. */
export function useContentTheme() {
  const { mode, toggleMode, setMode } = useColorMode();
  return {
    contentTheme: mode,
    isContentDark: mode === 'dark',
    toggleContentTheme: toggleMode,
    setContentTheme: setMode,
  };
}
