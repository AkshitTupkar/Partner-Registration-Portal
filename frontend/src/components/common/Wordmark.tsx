import { useT } from "@/i18n";

/** Atomberg logo + "Partners", linking to the top of the page. Used in the header and footer. */
export function Wordmark() {
  const t = useT();
  return (
    <a href="#top" className="po-wordmark" aria-label={`${t.meta.brand} ${t.meta.brandSuffix}`}>
      <img src="/logo-wordmark.png" alt="" width={144} height={28} />
      <span className="po-wordmark__suffix" aria-hidden="true">{t.meta.brandSuffix}</span>
    </a>
  );
}
