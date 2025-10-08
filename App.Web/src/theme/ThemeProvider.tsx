import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, GlobalStyles, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider, useTheme as useMuiTheme } from '@mui/material/styles';
import type { PaletteMode, Theme } from '@mui/material';
import { createAppTheme, type PrimaryColor } from './appTheme';

export type DensitySetting = 'comfortable' | 'compact';

const STORAGE_KEY = 'gogotime-theme';

type StoredSettings = {
  mode: PaletteMode;
  density: DensitySetting;
  primaryColor: PrimaryColor;
};

const defaultSettings: StoredSettings = {
  mode: 'light',
  density: 'comfortable',
  primaryColor: 'purple',
};

export type ThemeControllerContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
  density: DensitySetting;
  setDensity: (density: DensitySetting) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (primary: PrimaryColor) => void;
  theme: Theme;
};

const ThemeControllerContext = createContext<ThemeControllerContextValue | undefined>(undefined);

const readStoredSettings = (): StoredSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    return {
      mode: parsed.mode ?? defaultSettings.mode,
      density: parsed.density ?? defaultSettings.density,
      primaryColor: parsed.primaryColor ?? defaultSettings.primaryColor,
    };
  } catch {
    return defaultSettings;
  }
};

const writeStoredSettings = (settings: StoredSettings) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [mode, setMode] = useState<PaletteMode>(() => {
    const stored = readStoredSettings().mode;
    if (stored) return stored;
    return prefersDark ? 'dark' : 'light';
  });
  const [density, setDensity] = useState<DensitySetting>(() => readStoredSettings().density);
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(() => readStoredSettings().primaryColor);

  useEffect(() => {
    writeStoredSettings({ mode, density, primaryColor });
  }, [mode, density, primaryColor]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => createAppTheme(mode, primaryColor, density), [mode, primaryColor, density]);

  const contextValue = useMemo<ThemeControllerContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
      density,
      setDensity,
      primaryColor,
      setPrimaryColor,
      theme,
    }),
    [mode, density, primaryColor, theme, toggleMode]
  );

  return (
    <ThemeControllerContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              fontFeatureSettings: '"kern","liga","clig","calt"',
            },
            a: { textDecoration: 'none' },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeControllerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeController = () => {
  const context = useContext(ThemeControllerContext);
  if (!context) {
    throw new Error('useThemeController must be used within AppThemeProvider');
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => useMuiTheme();
