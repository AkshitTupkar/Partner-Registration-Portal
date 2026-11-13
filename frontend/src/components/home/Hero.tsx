import { RegistrationCard } from "@/components/registration/RegistrationCard";
import { IMAGES } from "@/content/placeholders";
import { useT } from "@/i18n";

/** Swiggy-style hero: edge-to-edge photo, dark overlay, light headline left, form card right. */
export function Hero() {
  const t = useT();
  return (
    <section className="po-hero" aria-labelledby="hero-title">
      <img className="po-hero__bg" src={IMAGES.hero} alt="" width={1600} height={889} fetchPriority="high" />
      <div className="po-hero__overlay" aria-hidden="true" />
      <div className="po-container po-hero__grid">
        <div className="po-hero__copy">
          <span className="po-hero__eyebrow">{t.hero.eyebrow}</span>
          <h1 id="hero-title" className="po-hero__title">
            {t.hero.titleStart} <strong className="po-hero__accent">{t.hero.titleAccent}</strong>
          </h1>
          <p className="po-hero__subtitle">{t.hero.subtitle}</p>
        </div>
        <RegistrationCard />
      </div>
    </section>
  );
}
