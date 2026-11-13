import { Button, Icon } from "@atomberg/ui";
import { IMAGES } from "@/content/placeholders";
import { useT } from "@/i18n";
import { goToRegistration } from "@/lib/scroll";

/** "Become a partner in 3 easy steps": photo plus a vertical timeline. */
export function Steps() {
  const t = useT();
  return (
    <section className="po-section" id="steps" aria-labelledby="steps-title">
      <div className="po-container">
        <div className="po-steps at-card">
          <img
            className="po-steps__image"
            src={IMAGES.steps}
            alt={t.steps.imageAlt}
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
          />
          <div className="po-steps__body">
            <h2 id="steps-title" className="at-h2">{t.steps.title}</h2>
            <ol className="po-timeline">
              {t.steps.items.map((s, i) => (
                <li key={s.title} className="po-timeline__item">
                  <span className="po-bubble po-timeline__node" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className="po-timeline__title">{s.title}</h3>
                    <p className="at-muted po-small">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button variant="primary" size="lg" onClick={goToRegistration}>
              {t.steps.cta} <Icon name="arrow-right" size={18} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
