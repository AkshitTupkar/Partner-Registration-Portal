import { startTransition, useRef, useState, useTransition, type FormEvent } from "react";
import { useT } from "@/i18n";
import { ApiError } from "@/lib/api";
import { validateDraft, validateOtp } from "@/lib/validation";
import { registerPartner, sendOtp } from "@/services/registration";
import type { FieldErrors, FieldKey, RegistrationDraft } from "@/types/registration";
import { FIELD_IDS, fieldErrorsFromApi, focusFirstInvalid } from "./field-errors";

/** Where the applicant is in mobile verification. Only the OTP step has a resend deadline. */
export type Verification =
  | { step: "details" }
  | { step: "otp"; resent: boolean; resendAt: number };

export interface Registered {
  referenceNumber: string;
  name: string;
}

const EMPTY_DRAFT: RegistrationDraft = { name: "", productCodes: [], stateCode: "", cityId: null, mobile: "" };

/**
 * State and actions for the self-registration form (FR-01): details, then a
 * mobile OTP, then the lead is created. Requests run in transitions, so the
 * OTP field and the success panel animate in (see view-transitions.css).
 */
export function useRegistrationForm(onRegistered: (result: Registered) => void) {
  const t = useT();
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [verification, setVerification] = useState<Verification>({ step: "details" });
  const [sending, startSending] = useTransition();
  const [submitting, startSubmitting] = useTransition();
  const otpRef = useRef<HTMLInputElement>(null);
  const busy = sending || submitting;

  function clearErrors(keys: FieldKey[]) {
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of [...keys, "form" as const]) delete next[key];
      return next;
    });
  }

  function showErrors(next: FieldErrors) {
    setErrors(next);
    focusFirstInvalid(next);
  }

  function showApiError(err: unknown) {
    if (err instanceof ApiError && err.status !== 0) showErrors(fieldErrorsFromApi(err.fields, err.message));
    else setErrors({ form: t.form.networkError });
  }

  function updateField<K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    clearErrors([key]);
  }

  /** A new state invalidates the chosen city. */
  function selectState(stateCode: string) {
    setDraft((d) => ({ ...d, stateCode, cityId: null }));
    clearErrors(["stateCode", "cityId"]);
  }

  function changeOtp(value: string) {
    setOtp(value);
    clearErrors(["otp"]);
  }

  function backToDetails() {
    setVerification({ step: "details" });
    setOtp("");
  }

  /** "Change" next to the sent-to line: edit the number again. */
  function changeNumber() {
    startTransition(backToDetails);
    document.getElementById(FIELD_IDS.mobile)?.focus();
  }

  function requestOtp() {
    if (busy) return;
    const check = validateDraft(draft, t.validation);
    if (!check.ok) return showErrors(check.errors);

    const isResend = verification.step === "otp";
    setErrors({});
    startSending(async () => {
      try {
        const res = await sendOtp(draft.mobile);
        startTransition(() => {
          setOtp("");
          setVerification({ step: "otp", resent: isResend, resendAt: Date.now() + res.resendInSeconds * 1000 });
        });
        // On first send the OTP field mounts with autoFocus; on resend it is already there.
        if (isResend) otpRef.current?.focus();
      } catch (err) {
        showApiError(err);
      }
    });
  }

  function submit() {
    if (busy) return;
    const check = validateDraft(draft, t.validation);
    const otpError = validateOtp(otp, t.validation);
    if (!check.ok || otpError) {
      return showErrors({ ...(check.ok ? {} : check.errors), ...(otpError ? { otp: otpError } : {}) });
    }

    const valid = check.value;
    setErrors({});
    startSubmitting(async () => {
      try {
        const res = await registerPartner({ ...valid, otp });
        startTransition(() => onRegistered({ referenceNumber: res.referenceNumber, name: valid.name }));
      } catch (err) {
        // A duplicate number can't be fixed with another OTP: send them back to edit it.
        if (err instanceof ApiError && err.code === "DUPLICATE_MOBILE") startTransition(backToDetails);
        showApiError(err);
      }
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (verification.step === "details") requestOtp();
    else submit();
  }

  return {
    draft,
    otp,
    errors,
    verification,
    sending,
    submitting,
    otpRef,
    updateField,
    selectState,
    changeOtp,
    changeNumber,
    resendOtp: requestOtp,
    onSubmit,
  };
}
