import { useEffect, useMemo, useState, createContext, useContext, createElement, type ReactNode } from 'react';
import { CssBaseline } from '@mui/material';
import { createTheme, responsiveFontSizes, ThemeProvider, type PaletteMode } from '@mui/material/styles';

const THEME_STORAGE_KEY = 'gogotime-theme-mode';

export const colorTokens = {
  primary: {
    100: '#E3F2FD',
    200: '#BBDEFB',
    300: '#90CAF9',
    400: '#64B5F6',
    500: '#42A5F5',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  secondary: {
    100: '#F3E5F5',
    200: '#E1BEE7',
    300: '#CE93D8',
    400: '#BA68C8',
    500: '#AB47BC',
    600: '#9C27B0',
    700: '#8E24AA',
    800: '#7B1FA2',
    900: '#4A148C',
  },
  success: {
    100: '#E6F4EA',
    200: '#C5E8CF',
    300: '#A3DBB3',
    400: '#81CE98',
    500: '#4CAF50',
    600: '#3D9B44',
    700: '#2E7D32',
    800: '#1E6024',
    900: '#124319',
  },
  warning: {
    100: '#FFF4E5',
    200: '#FFE4BF',
    300: '#FFD399',
    400: '#FFC273',
    500: '#FFB347',
    600: '#FF9E26',
    700: '#F57C00',
    800: '#D06000',
    900: '#A13F00',
  },
  error: {
    100: '#FEE7E7',
    200: '#FBB9B9',
    300: '#F88C8C',
    400: '#F25F5F',
    500: '#EB3B3B',
    600: '#D22727',
    700: '#B11212',
    800: '#8F0505',
    900: '#5C0000',
  },
  info: {
    100: '#E0F4F7',
    200: '#B8E4ED',
    300: '#8FD3E3',
    400: '#66C2D9',
    500: '#39B0D0',
    600: '#1E9ABF',
    700: '#0D7FA5',
    800: '#046685',
    900: '#004459',
  },
  neutral: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

type ModeValue = PaletteMode;

const createAppTheme = (mode: ModeValue) => {
  const palette = {
    mode,
    primary: {
      light: colorTokens.primary[400],
      main: colorTokens.primary[600],
      dark: colorTokens.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      light: colorTokens.secondary[300],
      main: colorTokens.secondary[600],
      dark: colorTokens.secondary[800],
      contrastText: '#ffffff',
    },
    success: {
      light: colorTokens.success[300],
      main: colorTokens.success[600],
      dark: colorTokens.success[800],
      contrastText: '#ffffff',
    },
    warning: {
      light: colorTokens.warning[300],
      main: colorTokens.warning[600],
      dark: colorTokens.warning[800],
      contrastText: mode === 'light' ? '#111827' : '#ffffff',
    },
    error: {
      light: colorTokens.error[300],
      main: colorTokens.error[600],
      dark: colorTokens.error[800],
      contrastText: '#ffffff',
    },
    info: {
      light: colorTokens.info[300],
      main: colorTokens.info[600],
      dark: colorTokens.info[800],
      contrastText: '#ffffff',
    },
    grey: {
      100: colorTokens.neutral[100],
      200: colorTokens.neutral[200],
      300: colorTokens.neutral[300],
      400: colorTokens.neutral[400],
      500: colorTokens.neutral[500],
      600: colorTokens.neutral[600],
      700: colorTokens.neutral[700],
      800: colorTokens.neutral[800],
      900: colorTokens.neutral[900],
    },
    background:
      mode === 'light'
        ? { default: '#F7F9FC', paper: '#FFFFFF' }
        : { default: '#0B1120', paper: '#111827' },
    divider: mode === 'light' ? 'rgba(148, 163, 184, 0.24)' : 'rgba(148, 163, 184, 0.18)',
    text:
      mode === 'light'
        ? { primary: colorTokens.neutral[900], secondary: colorTokens.neutral[600], disabled: 'rgba(55, 65, 81, 0.4)' }
        : { primary: '#F8FAFC', secondary: colorTokens.neutral[300], disabled: 'rgba(148, 163, 184, 0.38)' },
  };

  const theme = createTheme({
    palette,
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, fontSize: '2.75rem', letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, fontSize: '1.85rem', letterSpacing: '-0.01em' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1.1rem' },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background?.default,
            color: palette.text?.primary,
          },
          '*': {
            boxSizing: 'border-box',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
            padding: '0.6rem 1.5rem',
          },
          contained: {
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${
              mode === 'light' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.28)'
            }`,
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFFE6' : '#111827E6',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${
              mode === 'light' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.24)'
            }`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${
              mode === 'light' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.24)'
            }`,
            backgroundImage: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 12,
            '&.Mui-selected': {
              backgroundColor: `${palette.primary.main}20`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};

type ThemeModeContextValue = {
  mode: ModeValue;
  setMode: (mode: ModeValue) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ModeValue>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? (stored as ModeValue) : 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  }, [mode]);

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return createElement(
    ThemeModeContext.Provider,
    { value: contextValue },
    createElement(
      ThemeProvider,
      { theme },
      createElement(CssBaseline, null),
      children
    )
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within an AppThemeProvider');
  }
  return context;
};

export { useTheme } from '@mui/material/styles';

export type AppTheme = ReturnType<typeof createAppTheme>;
