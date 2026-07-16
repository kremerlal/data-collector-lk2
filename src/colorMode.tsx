import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { getTheme } from './theme';
import type { ColorMode } from './theme';
import { useBranding } from './branding/BrandingProvider';

const STORAGE_KEY = 'dhs-data-collector-content-theme';

interface ColorModeContextValue {
  mode: ColorMode;
  toggleMode: () => void;
  setMode: (mode: ColorMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

function readInitialMode(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return 'light';
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() => readInitialMode());
  const { branding } = useBranding();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* localStorage may be unavailable */
    }
    const dark = mode === 'dark';
    document.body.classList.toggle('content-theme-dark', dark);
  }, [mode]);

  const setMode = useCallback((next: ColorMode) => setModeState(next), []);
  const toggleMode = useCallback(
    () => setModeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    [],
  );

  const theme = useMemo(() => getTheme(mode, branding), [mode, branding]);
  const value = useMemo<ColorModeContextValue>(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used inside ColorModeProvider');
  }
  return ctx;
}
