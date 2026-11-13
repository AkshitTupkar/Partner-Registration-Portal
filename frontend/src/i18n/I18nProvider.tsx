import { useMemo, useState, type ReactNode } from "react";
import { I18nContext } from "./context";
import { LOCALES, type Locale } from "./locales";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const value = useMemo(() => ({ locale, setLocale, t: LOCALES[locale].messages }), [locale]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
