import { Avatar, IconButton } from "@atomberg/ui";
import { useRef } from "react";
import { TESTIMONIALS } from "@/content/placeholders";
import { useT } from "@/i18n";
import { scrollBehavior } from "@/lib/utils";

/** Partner quotes in a horizontally scrolling track with previous/next buttons. */
export function Testimonials() {
  const t = useT();
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth, behavior: scrollBehavior() });
  };

  return (
    <section className="po-section po-section--tint" aria-labelledby="testimonials-title">
      <div className="po-container">
        <div className="po-section__head">
          <h2 id="testimonials-title" className="at-h2">{t.testimonials.title}</h2>
        </div>
        <ul className="po-quotes" ref={trackRef}>
          {TESTIMONIALS.items.map((q) => (
            <li key={q.name} className="po-quote at-card">
              <span className="po-quote__mark" aria-hidden="true">“</span>
              <blockquote className="po-quote__text">{q.quote}</blockquote>
              <div className="po-quote__who">
                <Avatar src={q.avatar} alt="" size="lg" />
                <div>
                  <div className="po-quote__name">{q.name}</div>
                  <div className="at-help">{q.role}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="po-quotes__nav">
          <IconButton icon="chevron-left" label={t.testimonials.previous} size="sm" onClick={() => scrollBy(-1)} />
          <IconButton icon="chevron-right" label={t.testimonials.next} size="sm" onClick={() => scrollBy(1)} />
        </div>
      </div>
    </section>
  );
}
