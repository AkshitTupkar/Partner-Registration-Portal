import { Icon } from "@atomberg/ui";
import { Wordmark } from "@/components/common/Wordmark";
import { useT } from "@/i18n";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="po-footer">
      <div className="po-container po-footer__inner">
        <div>
          <Wordmark />
          <p className="at-help">{t.footer.tagline}</p>
        </div>
        <a className="po-link" href="https://atomberg.com" target="_blank" rel="noopener noreferrer">
          {t.footer.website} <Icon name="arrow-right" size={14} />
        </a>
        <p className="at-help po-footer__copy">{t.footer.copyright(new Date().getFullYear())}</p>
      </div>
    </footer>
  );
}
