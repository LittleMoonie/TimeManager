import { alpha } from '@mui/material/styles';

import type { PaletteMode, PaletteOptions } from '@mui/material';

export type ThemeGroup = 'aurora' | 'ember' | 'lagoon';
export type ThemeTone = 'light' | 'dark';
export type ThemeId = `${ThemeGroup}-${ThemeTone}`;

export type ThemePreset = {
  id: ThemeId;
  label: string;
  description: string;
  group: ThemeGroup;
  mode: PaletteMode;
  palette: PaletteOptions;
};

const greyScale = {
  50: '#F9FAFB',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5F5',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
};

type PaletteSeed = {
  primary: NonNullable<PaletteOptions['primary']>;
  secondary: NonNullable<PaletteOptions['secondary']>;
  backgroundDefault: string;
  backgroundPaper: string;
  textPrimary: string;
  textSecondary: string;
};

const createLightPalette = ({
  primary,
  secondary,
  backgroundDefault,
  backgroundPaper,
  textPrimary,
  textSecondary,
}: PaletteSeed): PaletteOptions => ({
  mode: 'light' as PaletteMode,
  primary,
  secondary,
  background: {
    default: backgroundDefault,
    paper: backgroundPaper,
  },
  text: {
    primary: textPrimary,
    secondary: textSecondary,
    disabled: alpha(textSecondary, 0.38),
  },
  divider: alpha(textSecondary, 0.18),
  grey: greyScale,
  info: { light: '#BAE6FD', main: '#0EA5E9', dark: '#0369A1', contrastText: '#F8FAFC' },
  success: { light: '#BBF7D0', main: '#16A34A', dark: '#166534', contrastText: '#052E16' },
  warning: { light: '#FDE68A', main: '#D97706', dark: '#92400E', contrastText: '#1B1305' },
  error: { light: '#FCA5A5', main: '#DC2626', dark: '#991B1B', contrastText: '#FEF2F2' },
});

const createDarkPalette = ({
  primary,
  secondary,
  backgroundDefault,
  backgroundPaper,
  textPrimary,
  textSecondary,
}: PaletteSeed): PaletteOptions => ({
  mode: 'dark' as PaletteMode,
  primary,
  secondary,
  background: {
    default: backgroundDefault,
    paper: backgroundPaper,
  },
  text: {
    primary: textPrimary,
    secondary: textSecondary,
    disabled: alpha(textSecondary, 0.36),
  },
  divider: alpha(textSecondary, 0.22),
  grey: greyScale,
  info: { light: '#38BDF8', main: '#0EA5E9', dark: '#0284C7', contrastText: '#081225' },
  success: { light: '#34D399', main: '#10B981', dark: '#059669', contrastText: '#042F1A' },
  warning: { light: '#FBBF24', main: '#D97706', dark: '#B45309', contrastText: '#1E1203' },
  error: { light: '#F87171', main: '#EF4444', dark: '#B91C1C', contrastText: '#2F0B0B' },
});

const auroraLight = {
  id: 'aurora-light' as const,
  label: 'Aurora Light',
  description: 'Airy blues with lilac accents for focus and clarity.',
  group: 'aurora' as const,
  mode: 'light',
  palette: createLightPalette({
    primary: { light: '#93C5FD', main: '#3B82F6', dark: '#1D4ED8', contrastText: '#F8FAFC' },
    secondary: { light: '#C7D2FE', main: '#6366F1', dark: '#4338CA', contrastText: '#F8FAFC' },
    backgroundDefault: '#F5F7FF',
    backgroundPaper: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
  }),
};

const auroraDark = {
  id: 'aurora-dark' as const,
  label: 'Aurora Dark',
  description: 'Deep midnight blues with neon accents.',
  group: 'aurora' as const,
  mode: 'dark',
  palette: createDarkPalette({
    primary: { light: '#60A5FA', main: '#3B82F6', dark: '#1E3A8A', contrastText: '#0B1120' },
    secondary: { light: '#A855F7', main: '#7C3AED', dark: '#5B21B6', contrastText: '#0B1120' },
    backgroundDefault: '#0B1120',
    backgroundPaper: '#111827',
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
  }),
};

const emberLight = {
  id: 'ember-light' as const,
  label: 'Ember Light',
  description: 'Warm sunrise oranges balanced with rose highlights.',
  group: 'ember' as const,
  mode: 'light' as PaletteMode,
  palette: createLightPalette({
    primary: { light: '#FECBA1', main: '#F97316', dark: '#C2410C', contrastText: '#1F1307' },
    secondary: { light: '#FDA4AF', main: '#F43F5E', dark: '#BE123C', contrastText: '#2F0B1A' },
    backgroundDefault: '#FFF7F0',
    backgroundPaper: '#FFFFFF',
    textPrimary: '#1F2933',
    textSecondary: '#4B5563',
  }),
};

const emberDark = {
  id: 'ember-dark' as const,
  label: 'Ember Dark',
  description: 'Rich volcanic tones with glowing embers.',
  group: 'ember' as const,
  mode: 'dark' as PaletteMode,
  palette: createDarkPalette({
    primary: { light: '#FDBA74', main: '#FB923C', dark: '#EA580C', contrastText: '#2B1201' },
    secondary: { light: '#F9A8D4', main: '#F472B6', dark: '#DB2777', contrastText: '#2F0B1A' },
    backgroundDefault: '#1B1110',
    backgroundPaper: '#241817',
    textPrimary: '#FDEDE4',
    textSecondary: '#F2B8A6',
  }),
};

const lagoonLight = {
  id: 'lagoon-light' as const,
  label: 'Lagoon Light',
  description: 'Cool teals and aquas for calm productivity.',
  group: 'lagoon' as const,
  mode: 'light' as PaletteMode,
  palette: createLightPalette({
    primary: { light: '#5EEAD4', main: '#14B8A6', dark: '#0F766E', contrastText: '#022C22' },
    secondary: { light: '#7DD3FC', main: '#0EA5E9', dark: '#0369A1', contrastText: '#031626' },
    backgroundDefault: '#F1FAF9',
    backgroundPaper: '#FFFFFF',
    textPrimary: '#102A26',
    textSecondary: '#3F5551',
  }),
};

const lagoonDark = {
  id: 'lagoon-dark' as const,
  label: 'Lagoon Dark',
  description: 'Oceanic depths with luminous cyan highlights.',
  group: 'lagoon' as const,
  mode: 'dark' as PaletteMode,
  palette: createDarkPalette({
    primary: { light: '#2DD4BF', main: '#14B8A6', dark: '#0D9488', contrastText: '#01221E' },
    secondary: { light: '#38BDF8', main: '#0EA5E9', dark: '#0284C7', contrastText: '#011427' },
    backgroundDefault: '#041C1F',
    backgroundPaper: '#0B272B',
    textPrimary: '#D1FAF5',
    textSecondary: '#7DDCD3',
  }),
};

export const themePresets: Record<ThemeId, ThemePreset> = {
  [auroraLight.id]: auroraLight as ThemePreset,
  [auroraDark.id]: auroraDark as ThemePreset,
  [emberLight.id]: emberLight as ThemePreset,
  [emberDark.id]: emberDark as ThemePreset,
  [lagoonLight.id]: lagoonLight as ThemePreset,
  [lagoonDark.id]: lagoonDark as ThemePreset,
};

export const themePresetList = Object.values(themePresets);
export const defaultThemeId: ThemeId = auroraLight.id as ThemeId;
