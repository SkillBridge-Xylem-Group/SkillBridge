"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  htmlLang,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/locales";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";

type LocaleContextValue = {
  locale: AppLocale;
  dictionary: Dictionary;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale?: AppLocale | null;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    if (initialLocale && isAppLocale(initialLocale)) return initialLocale;
    return DEFAULT_LOCALE;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isAppLocale(stored) && !initialLocale) {
        setLocaleState(stored);
      }
    } catch {
      // ignore
    }
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      dictionary: getDictionary(locale),
      setLocale,
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      dictionary: getDictionary(DEFAULT_LOCALE),
      setLocale: () => undefined,
    };
  }
  return ctx;
}
