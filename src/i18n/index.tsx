'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ar from './ar.json';
import en from './en.json';

type Language = 'ar' | 'en';
type Translations = typeof ar;

const translations: Record<Language, Translations> = { ar, en };

interface I18nContextType {
  locale: Language;
  dir: 'rtl' | 'ltr';
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  defaultLocale = 'ar',
}: {
  children: ReactNode;
  defaultLocale?: Language;
}) {
  const [locale, setLocaleState] = useState<Language>(defaultLocale);

  const setLocale = useCallback((lang: Language) => {
    setLocaleState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('fatma-locale', lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = translations[locale];
      for (const k of keys) {
        value = value?.[k];
      }
      if (typeof value !== 'string') return key;
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
          value
        );
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, dir: locale === 'ar' ? 'rtl' : 'ltr', t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

export type { Language };
