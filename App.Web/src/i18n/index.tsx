import { createContext, useContext, useEffect, useMemo } from 'react';

import { usePreferencesStore, type LocaleKey } from '@/store/preferences';

import { en } from './en';
import { fr } from './fr';

type Messages = typeof en;

type Dictionaries = Record<LocaleKey, Messages>;

type TranslateParams = Record<string, string | number>;

interface I18nContextValue {
  locale: LocaleKey;
  t: (key: string, params?: TranslateParams) => string;
}

const dictionaries: Dictionaries = {
  en,
  fr,
};

const resolveKey = (dict: Messages, key: string): string | undefined => {
  return key.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict) as string | undefined;
};

const format = (value: string, params?: TranslateParams) => {
  if (!params) return value;
  return Object.entries(params).reduce(
    (acc, [token, tokenValue]) => acc.replaceAll(`{${token}}`, String(tokenValue)),
    value,
  );
};

const fallbackLocale: LocaleKey = 'en';

const I18nContext = createContext<I18nContextValue>({
  locale: fallbackLocale,
  t: (key) => key,
});

export const locales: Array<{ key: LocaleKey; label: string }> = [
  { key: 'en', label: 'EN' },
  { key: 'fr', label: 'FR' },
];

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const locale = usePreferencesStore((state) => state.locale);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale] ?? dictionaries[fallbackLocale];
    const fallback = dictionaries[fallbackLocale];
    const translate = (key: string, params?: TranslateParams) => {
      const localized = resolveKey(dictionary, key) ?? resolveKey(fallback, key) ?? key;
      return typeof localized === 'string' ? format(localized, params) : key;
    };

    return { locale, t: translate };
  }, [locale]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
