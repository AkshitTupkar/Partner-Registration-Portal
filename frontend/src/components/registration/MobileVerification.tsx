import { Input } from "@atomberg/ui";
import { ViewTransition, type Ref } from "react";
import { OtpInput } from "@/components/common/OtpInput";
import { useSecondsUntil } from "@/hooks/use-seconds-until";
import { useT } from "@/i18n";
import { normaliseMobileInput } from "@/lib/validation";
import { FIELD_IDS, VERIFY_NOTE_ID } from "./field-errors";
import type { Verification } from "./use-registration-form";

/**
 * Mobile number, then the OTP beside it once sent (F-02, FR-20). The mobile
 * field fills the row until "Get OTP", then shares it with the OTP field. The
 * note line beneath is always there, so the card (and the hero) keep their size.
 */
export function MobileVerification({
  verification,
  mobile,
  onMobileChange,
  mobileError,
  otp,
  onOtpChange,
  otpError,
  otpRef,
  resendDisabled,
  onResend,
  onChangeNumber,
}: {
  verification: Verification;
  mobile: string;
  onMobileChange: (mobile: string) => void;
  mobileError?: string;
  otp: string;
  onOtpChange: (otp: string) => void;
  otpError?: string;
  otpRef: Ref<HTMLInputElement>;
  resendDisabled: boolean;
  onResend: () => void;
  onChangeNumber: () => void;
}) {
  const t = useT();
  const otpStep = verification.step === "otp" ? verification : null;
  const noteError = mobileError ?? otpError;

  return (
    <div className="po-verify">
      <div className={otpStep ? "po-row" : undefined}>
        {/* Glides to half width when the OTP field appears beside it. */}
        <ViewTransition update="auto" default="none">
          <div className="at-field">
            <label className="at-label po-visually-hidden" htmlFor={FIELD_IDS.mobile}>{t.form.mobileLabel}</label>
            <div className="po-phone">
              <span className="po-phone__prefix" aria-hidden="true">{t.form.mobilePrefix}</span>
              <Input
                id={FIELD_IDS.mobile}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder={t.form.mobilePlaceholder}
                value={mobile}
                readOnly={otpStep !== null}
                onChange={(e) => onMobileChange(normaliseMobileInput(e.target.value))}
                error={!!mobileError}
                aria-invalid={mobileError ? true : undefined}
                aria-describedby={VERIFY_NOTE_ID}
              />
            </div>
          </div>
        </ViewTransition>

        {otpStep && (
          <ViewTransition enter="po-vt-fade-in" exit="po-vt-fade-out" default="none">
            <div className="at-field">
              <label className="at-label po-visually-hidden" htmlFor={FIELD_IDS.otp}>{t.form.otpLabel}</label>
              <OtpInput
                ref={otpRef}
                id={FIELD_IDS.otp}
                value={otp}
                onChange={onOtpChange}
                error={!!otpError}
                autoFocus
                describedBy={VERIFY_NOTE_ID}
              />
            </div>
          </ViewTransition>
        )}
      </div>

      <div id={VERIFY_NOTE_ID} className="at-help po-verify__note">
        {noteError ? (
          <span className="at-help--error" role="alert">{noteError}</span>
        ) : otpStep ? (
          <>
            <span aria-live="polite">
              {otpStep.resent ? t.form.otpResentTo(mobile) : t.form.otpSentTo(mobile)}{" "}
              <button type="button" className="po-link" onClick={onChangeNumber}>
                {t.form.changeNumber}
              </button>
            </span>
            {/* Keyed so each new OTP restarts the countdown from now. */}
            <ResendControl key={otpStep.resendAt} resendAt={otpStep.resendAt} disabled={resendDisabled} onResend={onResend} />
          </>
        ) : (
          <span>{t.form.otpPending}</span>
        )}
      </div>
    </div>
  );
}

/**
 * "Resend in Ns", then a "Resend OTP" link. The once-a-second tick re-renders
 * only this component, not the whole form.
 */
function ResendControl({ resendAt, disabled, onResend }: {
  resendAt: number;
  disabled: boolean;
  onResend: () => void;
}) {
  const t = useT();
  const seconds = useSecondsUntil(resendAt);

  if (seconds > 0) return <span className="po-verify__resend">{t.form.resendIn(seconds)}</span>;
  return (
    <button type="button" className="po-link po-verify__resend" disabled={disabled} onClick={onResend}>
      {t.form.resend}
    </button>
  );
}
