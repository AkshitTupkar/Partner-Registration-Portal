import { Button, Dots, Icon } from "@atomberg/ui";
import { useT } from "@/i18n";
import type { Registered } from "./use-registration-form";

/** The logo mark sitting on the card's top edge (positioned by .po-reg__logo). */
function CardLogo() {
  return <img className="po-reg__logo" src="/logo-mark.png" alt="" width={56} height={56} />;
}

export function CardHeader() {
  const t = useT();
  return (
    <div className="po-reg__head">
      <CardLogo />
      <h2 className="po-reg__title">{t.form.title}</h2>
    </div>
  );
}

export function MastersLoading() {
  const t = useT();
  return (
    <div className="po-reg__loading" aria-live="polite">
      <Dots />
      <span className="at-help">{t.form.loadingMasters}</span>
    </div>
  );
}

export function MastersError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div className="po-reg__loading" aria-live="polite">
      <p className="at-help at-help--error">{t.form.mastersError}</p>
      <Button size="sm" onClick={onRetry}>
        <Icon name="arrow-right" size={14} /> {t.form.retry}
      </Button>
    </div>
  );
}

/**
 * The submit button disappears with the form, so focus moves to the heading and it is
 * read out. It is already on screen (same card), so don't let focus scroll the page.
 */
const focusOnMount = (el: HTMLElement | null) => {
  el?.focus({ preventScroll: true });
};

export function SuccessPanel({ registered }: { registered: Registered }) {
  const t = useT();
  return (
    <>
      <CardLogo />
      <div className="po-reg__done">
        <span className="po-bubble po-bubble--lg"><Icon name="check" size={28} /></span>
        <h2 className="at-h3 po-reg__done-title" tabIndex={-1} ref={focusOnMount}>
          {t.success.title(registered.name)}
        </h2>
        <p className="at-muted">{t.success.body}</p>
        <div className="po-ref">
          <span className="at-label">{t.success.referenceLabel}</span>
          <span className="po-ref__value">{registered.referenceNumber}</span>
        </div>
        <h3 className="po-reg__next-title">{t.success.nextTitle}</h3>
        <p className="at-muted po-small">{t.success.next}</p>
      </div>
    </>
  );
}
