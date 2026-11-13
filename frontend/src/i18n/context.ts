import { createContext, use } from "react";
import type { Messages } from "./en";
import type { Locale } from "./locales";

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

export const I18nContext = createContext<I18nValue | null>(null);

function useI18n(): I18nValue {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}

/** The copy for the current language (from en.ts and its translations). */
export const useT = () => useI18n().t;

export const useLocale = () => {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
};
