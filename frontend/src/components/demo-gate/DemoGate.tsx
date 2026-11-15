import { Button, Card, Icon, Input } from "@atomberg/ui";
import { useState, type FormEvent, type ReactNode } from "react";
import { FormField } from "@/components/common/FormField";
import { errorId } from "@/components/common/field-a11y";
import { useT } from "@/i18n";
import { ApiError } from "@/lib/api";
import { passDemoGate } from "@/services/demo-gate";
import { rememberPassed, useDemoGate } from "./use-demo-gate";

/** Shows the children once the demo gate is passed, or straight away when the server has no gate. */
export function DemoGate({ children }: { children: ReactNode }) {
  const [state, open] = useDemoGate();
  if (state === "open") return children;
  // Blank while checking, so the registration page never flashes before the gate.
  if (state === "checking") return <div className="at-root at-sky po-gate" />;
  return <DemoGateForm onPassed={open} />;
}

function DemoGateForm({ onPassed }: { onPassed: () => void }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError(t.demoGate.required);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await passDemoGate(email, password);
      rememberPassed();
      onPassed();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? t.demoGate.denied : t.form.networkError);
      setBusy(false);
    }
  }

  return (
    <div className="at-root at-sky po-gate">
      <main className="po-gate__main">
        <img className="po-gate__wordmark" src="/logo-wordmark.png" alt={t.meta.brand} width={144} height={28} />
        <Card className="po-reg po-gate__card">
          <div className="po-reg__head">
            <img className="po-reg__logo" src="/logo-mark.png" alt="" width={56} height={56} />
            <h1 className="po-reg__title">{t.demoGate.title}</h1>
            <p className="at-help po-gate__subtitle">{t.demoGate.subtitle}</p>
          </div>
          <form className="po-reg__form" onSubmit={submit} noValidate>
            <FormField id="gate-email" label={t.demoGate.emailLabel}>
              <Input
                id="gate-email"
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(error)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId("gate-form") : undefined}
              />
            </FormField>
            <FormField id="gate-password" label={t.demoGate.passwordLabel}>
              <Input
                id="gate-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(error)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId("gate-form") : undefined}
              />
            </FormField>
            {error && (
              <p className="po-form-error" id={errorId("gate-form")} role="alert">
                <Icon name="alert-circle" size={16} /> {error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="po-reg__submit"
              busy={busy}
              aria-disabled={busy || undefined}
            >
              {busy ? t.demoGate.checking : t.demoGate.submit}
              {!busy && <Icon name="arrow-right" size={18} />}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
