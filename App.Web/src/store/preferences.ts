import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';
export type LocaleKey = 'en' | 'fr';

interface PreferencesState {
  mode: ThemeMode;
  density: Density;
  locale: LocaleKey;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
  setLocale: (locale: LocaleKey) => void;
  resolvedMode: () => 'light' | 'dark';
}

const systemMode = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      density: 'comfortable',
      locale: 'en',
      setMode: (mode) => set({ mode }),
      toggleMode: () => {
        const next = get().resolvedMode() === 'dark' ? 'light' : 'dark';
        set({ mode: next });
      },
      setDensity: (density) => set({ density }),
      toggleDensity: () => set({ density: get().density === 'compact' ? 'comfortable' : 'compact' }),
      setLocale: (locale) => set({ locale }),
      resolvedMode: () => {
        const { mode } = get();
        if (mode === 'system') {
          return systemMode();
        }
        return mode;
      },
    }),
    { name: 'portal-preferences' },
  ),
);
