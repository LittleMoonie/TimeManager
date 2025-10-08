import { alpha, createTheme as muiCreateTheme, responsiveFontSizes } from '@mui/material/styles';
import type { PaletteMode, ThemeOptions } from '@mui/material';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}

export type PrimaryKey = 'purple' | 'blue' | 'teal';

export const primarySwatches: Record<PrimaryKey, { light: string; main: string; dark: string }> = {
  purple: {
    light: '#8E6CD9',
    main: '#5E35B1',
    dark: '#4527A0',
  },
  blue: {
    light: '#63A4FF',
    main: '#1E88E5',
    dark: '#1565C0',
  },
  teal: {
    light: '#4DD0E1',
    main: '#0097A7',
    dark: '#006978',
  },
};

const neutral = {
  50: '#F8FAFF',
  100: '#F4F6FA',
  200: '#E5E8EC',
  300: '#D6DAE1',
  400: '#B0B7C3',
  500: '#8A94A6',
  600: '#556070',
  700: '#3B4754',
  800: '#1F2A37',
  900: '#111827',
};

const shadowLevel = {
  xs: '0px 2px 6px rgba(16, 24, 40, 0.06)',
  sm: '0px 4px 12px rgba(16, 24, 40, 0.08)',
  md: '0px 6px 20px rgba(16, 24, 40, 0.10)',
  lg: '0px 12px 40px rgba(15, 23, 42, 0.16)',
};

const buildShadows = (mode: PaletteMode) => {
  const base = muiCreateTheme({ palette: { mode } }).shadows;
  return base.map((_, index) => {
    if (index === 0) return 'none';
    if (index < 3) return shadowLevel.xs;
    if (index < 6) return shadowLevel.sm;
    if (index < 10) return shadowLevel.md;
    return shadowLevel.lg;
  }) as typeof base;
};

const typography: ThemeOptions['typography'] = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 600, fontSize: '2rem', lineHeight: 1.25, letterSpacing: '-0.025em' },
  h2: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.33, letterSpacing: '-0.02em' },
  h3: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4, letterSpacing: '-0.015em' },
  h4: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.44, letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.6 },
  subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.57 },
  body1: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.57 },
  body2: { fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.54 },
  caption: { fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.5, color: neutral[500] },
  overline: {
    fontWeight: 600,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    lineHeight: 1.67,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none' as const,
  },
};

const getPalette = (mode: PaletteMode, primaryKey: PrimaryKey) => {
  const primary = primarySwatches[primaryKey];
  if (mode === 'light') {
    return {
      mode,
      primary,
      secondary: primarySwatches.blue,
      info: {
        light: '#74CAFF',
        main: '#1890FF',
        dark: '#0C53B7',
      },
      success: {
        light: '#AAF27F',
        main: '#54D62C',
        dark: '#229A16',
      },
      warning: {
        light: '#FFE16A',
        main: '#FFC130',
        dark: '#B78103',
      },
      error: {
        light: '#FF8682',
        main: '#FF4842',
        dark: '#B72136',
      },
      grey: neutral,
      background: {
        default: '#F8FAFF',
        paper: '#FFFFFF',
      },
      divider: 'rgba(145, 158, 171, 0.24)',
      text: {
        primary: '#1A1C1E',
        secondary: '#637381',
        disabled: 'rgba(99, 115, 129, 0.48)',
      },
    } satisfies ThemeOptions['palette'];
  }

  return {
    mode,
    primary,
    secondary: primarySwatches.blue,
    info: {
      light: '#5F9BFF',
      main: '#308BFF',
      dark: '#1E5CB3',
    },
    success: {
      light: '#6BE680',
      main: '#3BB66E',
      dark: '#1F8654',
    },
    warning: {
      light: '#FFB547',
      main: '#F79009',
      dark: '#B05E00',
    },
    error: {
      light: '#FF6B6B',
      main: '#FF4444',
      dark: '#C62828',
    },
    grey: neutral,
    background: {
      default: '#0B0F19',
      paper: '#111827',
    },
    divider: 'rgba(148, 163, 184, 0.16)',
    text: {
      primary: '#EDF2F7',
      secondary: '#94A3B8',
      disabled: 'rgba(148, 163, 184, 0.38)',
    },
  } satisfies ThemeOptions['palette'];
};

const buildComponentOverrides = (mode: PaletteMode) => {
  const isLight = mode === 'light';
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isLight ? '#F8FAFF' : '#0B0F19',
          color: isLight ? '#1A1C1E' : '#EDF2F7',
          overscrollBehaviorY: 'none',
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: alpha(isLight ? '#637381' : '#94A3B8', 0.32),
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: alpha(isLight ? '#637381' : '#94A3B8', 0.5),
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: isLight ? shadowLevel.sm : '0px 0px 0px 1px rgba(148,163,184,0.16)',
          backgroundImage: 'none',
          backgroundColor: isLight ? '#FFFFFF' : '#111827',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: 56,
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)',
          backgroundColor: isLight ? alpha('#FFFFFF', 0.92) : alpha('#111827', 0.9),
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '56px !important',
          height: 56,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0px 8px 16px rgba(93, 120, 255, 0.18)',
        },
        outlined: {
          borderWidth: 1,
        },
      },
      variants: [
        {
          props: { variant: 'soft' },
          style: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
          }),
        },
      ],
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: shadowLevel.sm,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: 44,
          borderRadius: 12,
          paddingLeft: 16,
          paddingRight: 12,
          marginBlock: 2,
          transition: theme.transitions.create(['background-color', 'transform'], { duration: 120 }),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            fontWeight: 600,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 8,
              bottom: 8,
              width: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            height: 44,
            borderRadius: 12,
            backgroundColor: isLight ? '#FFFFFF' : alpha('#1E293B', 0.8),
            boxShadow: isLight ? '0 1px 2px rgba(16,24,40,0.06), 0 1px 1px rgba(16,24,40,0.04)' : '0 8px 16px rgba(8, 15, 35, 0.52)',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          },
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          padding: 10,
          transition: theme.transitions.create(['background-color', 'transform'], { duration: 120 }),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 42,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          paddingBlock: 8,
          boxShadow: shadowLevel.md,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: '0.75rem',
        },
      },
    },
  } satisfies ThemeOptions['components'];
};

export const createTheme  = (
  mode: PaletteMode,
  primaryKey: PrimaryKey,
  density: 'comfortable' | 'compact'
) => {
  const palette = getPalette(mode, primaryKey);
  const baseTheme = muiCreateTheme({
    palette,
    typography,
    shape: { borderRadius: 16 },
    spacing: 8, // 1 unit = 8px, so spacing={3} = 24px
    shadows: buildShadows(mode),
  });

  const themeWithOverrides = muiCreateTheme(baseTheme, {
    density,
    components: buildComponentOverrides(mode),
  });

  themeWithOverrides.palette.background = palette.background!;
  themeWithOverrides.palette.text = palette.text!;

  return responsiveFontSizes(themeWithOverrides);
};
