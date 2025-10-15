import { CssBaseline, GlobalStyles, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider, useTheme as useMuiTheme } from '@mui/material/styles';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react';

import {
  createAppTheme,
  defaultThemeId,
  getNextTheme,
  getThemePreset,
  themePresetList,
  type DensitySetting,
  type ThemeId,
  type ThemePreset,
} from './theme';

import type { PaletteMode, Theme } from '@mui/material';

const STORAGE_KEY = 'gogotime-theme';

type StoredSettings = {
  themeId?: ThemeId;
  density?: DensitySetting;
};

const readStoredSettings = (): StoredSettings => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredSettings;
  } catch {
    return {};
  }
};

const writeStoredSettings = (settings: StoredSettings) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export type ThemeControllerContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  availableThemes: ThemePreset[];
  currentPreset: ThemePreset;
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
  selectNextTheme: (direction: 1 | -1) => void;
  density: DensitySetting;
  setDensity: (density: DensitySetting) => void;
  theme: Theme;
};

const ThemeControllerContext = createContext<ThemeControllerContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const storedRef = useRef<StoredSettings | null>(null);
  if (storedRef.current === null) {
    storedRef.current = readStoredSettings();
  }
  const stored = storedRef.current;

  const [themeId, setThemeId] = useState<ThemeId>(() => stored?.themeId ?? defaultThemeId);
  const [density, setDensity] = useState<DensitySetting>(() => stored?.density ?? 'comfortable');

  const currentPreset = useMemo(() => getThemePreset(themeId), [themeId]);
  const mode = currentPreset.mode;

  useEffect(() => {
    if (!stored?.themeId && prefersDark) {
      const firstDark = themePresetList.find((preset) => preset.mode === 'dark');
      if (firstDark) {
        setThemeId(firstDark.id);
      }
    }
  }, [prefersDark, stored?.themeId]);

  useEffect(() => {
    writeStoredSettings({ themeId, density });
  }, [themeId, density]);

  const setMode = useCallback((nextMode: PaletteMode) => {
    setThemeId((current: ThemeId) => {
      const preset = getThemePreset(current);
      const sibling = themePresetList.find(
        (candidate) => candidate.group === preset.group && candidate.mode === nextMode,
      );
      if (sibling) return sibling.id;
      const fallback = themePresetList.find((candidate) => candidate.mode === nextMode);
      return fallback?.id ?? current;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setThemeId((current: ThemeId) => {
      const preset = getThemePreset(current);
      const targetMode: PaletteMode = preset.mode === 'light' ? 'dark' : 'light';
      const sibling = themePresetList.find(
        (candidate) => candidate.group === preset.group && candidate.mode === targetMode,
      );
      if (sibling) return sibling.id;
      const fallback = themePresetList.find((candidate) => candidate.mode === targetMode);
      return fallback?.id ?? current;
    });
  }, []);

  const selectNextTheme = useCallback((direction: 1 | -1) => {
    setThemeId((current: ThemeId) => getNextTheme(current, direction).id);
  }, []);

  const theme = useMemo(() => createAppTheme(currentPreset, density), [currentPreset, density]);

  const contextValue = useMemo<ThemeControllerContextValue>(
    () => ({
      themeId,
      setThemeId,
      availableThemes: themePresetList,
      currentPreset,
      mode,
      setMode,
      toggleMode,
      selectNextTheme,
      density,
      setDensity,
      theme,
    }),
    [themeId, currentPreset, mode, setMode, toggleMode, selectNextTheme, density, theme],
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
            a: {
              color: 'inherit',
              textDecoration: 'none',
            },
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
