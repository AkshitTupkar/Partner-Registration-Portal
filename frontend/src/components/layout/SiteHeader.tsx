import { Wordmark } from "@/components/common/Wordmark";
import { LOCALES, useLocale, useT, type Locale } from "@/i18n";

const LOCALE_ENTRIES = Object.entries(LOCALES) as [Locale, (typeof LOCALES)[Locale]][];

/** Plain white top bar, Swiggy-style: logo left, links right. The form sits in the hero, so no Register button. */
export function SiteHeader() {
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <header className="po-header">
      <div className="po-container po-header__bar">
        <Wordmark />
        <nav className="po-header__nav" aria-label={t.nav.main}>
          <a className="po-header__link po-hide-sm" href="#steps">{t.nav.howItWorks}</a>
          <a className="po-header__link" href="#faq">{t.nav.faqs}</a>
          {/* The switcher appears once a second language is registered in i18n/locales.ts. */}
          {LOCALE_ENTRIES.length > 1 && (
            <select
              className="at-select po-lang"
              aria-label={t.nav.language}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
            >
              {LOCALE_ENTRIES.map(([code, { label }]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          )}
        </nav>
      </div>
    </header>
  );
}
