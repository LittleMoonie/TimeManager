import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

import type { Density } from '@/store/preferences';

const basePalette = {
  primary: {
    main: '#5E35B1',
    light: '#9162e4',
    dark: '#280680',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00BFA6',
    light: '#5df2d0',
    dark: '#008e78',
    contrastText: '#00332B',
  },
  success: { main: '#2E7D32' },
  warning: { main: '#F9A825' },
  error: { main: '#D32F2F' },
  info: { main: '#0288D1' },
};

const lightBackground = {
  default: '#F5F5FB',
  paper: '#FFFFFF',
};

const darkBackground = {
  default: '#121212',
  paper: '#1E1E27',
};

export const buildTheme = (mode: PaletteMode, density: Density) => {
  const focusOutline = mode === 'light' ? '#00BFA6' : '#80CBC4';
  const theme = createTheme({
    palette: {
      mode,
      ...basePalette,
      background: mode === 'light' ? lightBackground : darkBackground,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? lightBackground.default : darkBackground.default,
          },
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },
          'button:focus-visible, a:focus-visible, [role="button"]:focus-visible': {
            outline: `3px solid ${focusOutline}`,
            outlineOffset: 2,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiCard: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            borderColor: mode === 'light' ? 'rgba(94,53,177,0.12)' : 'rgba(0,191,166,0.3)',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 48,
            alignItems: 'flex-start',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minWidth: 200,
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
          enterTouchDelay: 0,
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};
