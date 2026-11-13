import { Icon } from "@atomberg/ui";
import { useT } from "@/i18n";

/** FAQ as native <details> disclosures: keyboard and screen-reader support built in. */
export function Faq() {
  const t = useT();
  return (
    <section className="po-section" id="faq" aria-labelledby="faq-title">
      <div className="po-container">
        <h2 id="faq-title" className="at-h2">{t.faq.title}</h2>
        <div className="po-faq">
          {t.faq.items.map((f) => (
            <details key={f.q} className="po-faq__item">
              <summary>
                <span>{f.q}</span>
                <Icon name="chevron-down" size={18} className="po-faq__chevron" />
              </summary>
              <p className="at-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="at-muted po-small po-faq__more">{t.faq.more}</p>
      </div>
    </section>
  );
}
