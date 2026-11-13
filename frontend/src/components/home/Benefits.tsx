import { Icon, type IconName } from "@atomberg/ui";
import { useT } from "@/i18n";

/** One icon per benefit in `t.benefits.items`, in the same order. */
const BENEFIT_ICONS: readonly IconName[] = ["wrench", "star", "home", "shield"];

export function Benefits() {
  const t = useT();
  return (
    <section className="po-section po-benefits-section" aria-labelledby="benefits-title">
      <div className="po-container">
        <h2 id="benefits-title" className="po-visually-hidden">{t.benefits.title}</h2>
        <ul className="po-benefits">
          {t.benefits.items.map((b, i) => (
            <li key={b.title} className="po-benefit">
              <span className="po-bubble po-bubble--xl">
                <Icon name={BENEFIT_ICONS[i] ?? "check"} size={36} strokeWidth={1.6} />
              </span>
              <h3 className="po-benefit__title">{b.title}</h3>
              <p className="at-muted po-small">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
