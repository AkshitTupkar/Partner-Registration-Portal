import { NETWORK } from "@/content/placeholders";
import { useT } from "@/i18n";

/** Network stats on photo tiles. Figures are placeholders (see content/placeholders.ts). */
export function Network() {
  const t = useT();
  return (
    <section className="po-section" aria-labelledby="network-title">
      <div className="po-container">
        <div className="po-section__head">
          <h2 id="network-title" className="at-h2">{t.network.title}</h2>
        </div>
        <ul className="po-network">
          {NETWORK.items.map((n) => (
            <li key={n.label} className="po-network__item">
              <img src={n.image} alt="" width={600} height={600} loading="lazy" decoding="async" />
              <div className="po-network__stat">
                <span className="po-network__value">{n.value}</span>
                <span className="at-label">{n.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
