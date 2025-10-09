import { alpha, createTheme as muiCreateTheme, responsiveFontSizes } from '@mui/material/styles';
import type { Theme, ThemeOptions } from '@mui/material';
import {
  defaultThemeId,
  themePresetList,
  themePresets,
  type ThemeGroup,
  type ThemeId,
  type ThemePreset,
} from './presets';

export type DensitySetting = 'comfortable' | 'compact';

declare module '@mui/material/styles' {
  interface Theme {
    app: {
      id: ThemeId;
      label: string;
      description: string;
      group: ThemeGroup;
      gradients: {
        brand: string;
        soft: string;
      };
      surfaces: {
        muted: string;
        elevated: string;
        translucent: string;
      };
      focusRing: string;
    };
    density: DensitySetting;
  }

  interface ThemeOptions {
    app?: Partial<Theme['app']>;
    density?: DensitySetting;
  }
}

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
  caption: { fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.5 },
  overline: {
    fontWeight: 600,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    lineHeight: 1.67,
    textTransform: 'uppercase',
  },
  button: { fontWeight: 600, textTransform: 'none' },
};

const computeShadows = (theme: Theme) => {
  const soft = alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.08 : 0.32);
  const medium = alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.12 : 0.45);
  const strong = alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.18 : 0.5);

  const next = [...theme.shadows];
  next[0] = 'none';
  next[1] = `0px 1px 2px ${soft}`;
  next[2] = `0px 3px 10px ${soft}`;
  next[3] = `0px 6px 18px ${soft}`;
  next[4] = `0px 10px 30px ${medium}`;
  next[6] = `0px 14px 42px ${medium}`;
  next[8] = `0px 18px 50px ${strong}`;
  return next as Theme['shadows'];
};

const buildComponentOverrides = (theme: Theme, density: DensitySetting): ThemeOptions['components'] => {
  const focusRingColor = alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.28 : 0.42);
  const hoverOverlay = alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.16);
  const scrollbarThumb = alpha(
    theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.primary.light,
    0.32
  );

  const fieldHeight = density === 'compact' ? 40 : 44;

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          overscrollBehaviorY: 'none',
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: scrollbarThumb,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: alpha(scrollbarThumb, 1),
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: Number(theme.shape.borderRadius) * 1.5,
          backgroundImage: 'none',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: 56,
          boxShadow: theme.shadows[1],
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.92 : 0.86),
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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: Number(theme.shape.borderRadius) * 1.5,
          fontWeight: 600,
        },
        contained: {
          boxShadow: theme.shadows[2],
        },
        outlined: {
          borderWidth: 1,
        },
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            '&:focus-visible': {
              boxShadow: `0 0 0 3px ${focusRingColor}`,
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            '&:focus-visible': {
              boxShadow: `0 0 0 3px ${focusRingColor}`,
            },
          },
        },
      ],
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: Number(theme.shape.borderRadius) * 1.2,
          boxShadow: theme.shadows[3],
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          height: density === 'compact' ? 42 : 48,
          borderRadius: theme.shape.borderRadius,
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(1.5),
          marginBlock: theme.spacing(0.25),
          transition: theme.transitions.create(['background-color', 'transform'], { duration: 120 }),
          '&:hover': {
            backgroundColor: hoverOverlay,
          },
          '&.Mui-selected': {
            backgroundColor: hoverOverlay,
            color: theme.palette.primary.main,
            fontWeight: 600,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              insetBlock: theme.spacing(1),
              left: 0,
              width: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            height: fieldHeight,
            borderRadius: Number(theme.shape.borderRadius) * 1.1,
            backgroundColor:
              theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : alpha(theme.palette.background.paper, 0.9),
            boxShadow:
              theme.palette.mode === 'light'
                ? theme.shadows[1]
                : `0px 8px 18px ${alpha(theme.palette.common.black, 0.5)}`,
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${focusRingColor}`,
            },
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(density === 'compact' ? 2.5 : 3),
          '&:last-child': {
            paddingBottom: theme.spacing(density === 'compact' ? 2.5 : 3),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          padding: density === 'compact' ? theme.spacing(1) : theme.spacing(1.25),
          transition: theme.transitions.create(['background-color', 'transform'], { duration: 120 }),
          '&:hover': {
            backgroundColor: hoverOverlay,
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: `2px solid ${focusRingColor}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: density === 'compact' ? 38 : 42,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: Number(theme.shape.borderRadius) * 1.1,
          paddingBlock: theme.spacing(1),
          boxShadow: theme.shadows[4],
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: Number(theme.shape.borderRadius) * 1.1,
          boxShadow: theme.shadows[4],
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: Number(theme.shape.borderRadius) * 0.75,
          padding: theme.spacing(1, 1.5),
          fontSize: '0.75rem',
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.92 : 0.8),
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[2],
        },
      },
    },
  };
};

const assignAppTokens = (theme: Theme, preset: ThemePreset) => {
  const augmented = theme as Theme & {
    app: Theme['app'];
    density: DensitySetting;
  };

  const brandGradient = `linear-gradient(135deg, ${(preset.palette.primary as any)?.light ?? (preset.palette.primary as any)?.main}, ${
    (preset.palette.secondary as any)?.main ?? (preset.palette.primary as any)?.dark
  })`;
  const softGradient = `linear-gradient(135deg, ${alpha(
    theme.palette.primary.light,
    theme.palette.mode === 'light' ? 0.22 : 0.38
  )}, ${alpha(theme.palette.secondary.light, theme.palette.mode === 'light' ? 0.18 : 0.32)})`;

  augmented.app = {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    group: preset.group,
    gradients: {
      brand: brandGradient,
      soft: softGradient,
    },
    surfaces: {
      muted: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.05 : 0.12),
      elevated: theme.palette.background.paper,
      translucent: alpha(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.85 : 0.72),
    },
    focusRing: `0 0 0 3px ${alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.3 : 0.45)}`,
  };

  return augmented;
};

export const createAppTheme = (preset: ThemePreset, density: DensitySetting) => {
  let theme = muiCreateTheme({
    palette: preset.palette,
    typography,
    spacing: density === 'compact' ? 6 : 8,
    shape: {
      borderRadius: density === 'compact' ? 12 : 16,
    },
  });

  theme.shadows = computeShadows(theme);
  theme = muiCreateTheme(theme, {
    components: buildComponentOverrides(theme, density),
  });

  const responsiveTheme = responsiveFontSizes(theme);
  responsiveTheme.density = density;

  return assignAppTokens(responsiveTheme, preset);
};

export const getThemePreset = (id: ThemeId): ThemePreset => themePresets[id] ?? themePresets[defaultThemeId];
export const getNextTheme = (currentId: ThemeId, direction: 1 | -1) => {
  const index = themePresetList.findIndex((preset) => preset.id === currentId);
  if (index === -1) return themePresets[defaultThemeId];
  const nextIndex = (index + direction + themePresetList.length) % themePresetList.length;
  return themePresetList[nextIndex];
};

export { themePresetList, themePresets, defaultThemeId };
