// Hooks and locale registry. The provider is imported from ./I18nProvider so
// this module exports no components (keeps Vite fast refresh working).
export { useLocale, useT } from "./context";
export { LOCALES, type Locale } from "./locales";
