/**
 * Theme customization interface
 */
export interface ThemeCustomization {
  fontFamily?: string;
  borderRadius?: number;
  navType?: 'light' | 'dark';
  isOpen?: string[];
  opened?: boolean;
}

/**
 * Store state for customization
 */
export interface CustomizationState extends ThemeCustomization {
  isOpen: string[];
  fontFamily: string;
  borderRadius: number;
  opened: boolean;
}

/**
 * Default theme configuration
 */
export const defaultThemeConfig: Required<ThemeCustomization> = {
  fontFamily: "'Roboto', sans-serif",
  borderRadius: 12,
  navType: 'light',
  isOpen: [],
  opened: true,
};

/**
 * Theme action types
 */
export enum ThemeActionTypes {
  MENU_OPEN = 'MENU_OPEN',
  SET_MENU = 'SET_MENU',
  SET_FONT_FAMILY = 'SET_FONT_FAMILY',
  SET_BORDER_RADIUS = 'SET_BORDER_RADIUS',
  SET_NAV_TYPE = 'SET_NAV_TYPE',
}

/**
 * Theme actions
 */
export interface MenuOpenAction {
  type: ThemeActionTypes.MENU_OPEN;
  id: string;
}

export interface SetMenuAction {
  type: ThemeActionTypes.SET_MENU;
  opened: boolean;
}

export interface SetFontFamilyAction {
  type: ThemeActionTypes.SET_FONT_FAMILY;
  fontFamily: string;
}

export interface SetBorderRadiusAction {
  type: ThemeActionTypes.SET_BORDER_RADIUS;
  borderRadius: number;
}

export interface SetNavTypeAction {
  type: ThemeActionTypes.SET_NAV_TYPE;
  navType: 'light' | 'dark';
}

export type ThemeAction =
  | MenuOpenAction
  | SetMenuAction
  | SetFontFamilyAction
  | SetBorderRadiusAction
  | SetNavTypeAction;
