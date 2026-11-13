import { Button, Icon } from "@atomberg/ui";
import { useT } from "@/i18n";
import { goToRegistration } from "@/lib/scroll";

export function CtaBanner() {
  const t = useT();
  return (
    <section className="po-section">
      <div className="po-container">
        <div className="po-cta at-card">
          <h2 className="po-cta__title">{t.cta.title}</h2>
          <Button variant="primary" size="lg" onClick={goToRegistration}>
            {t.cta.button} <Icon name="arrow-right" size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
