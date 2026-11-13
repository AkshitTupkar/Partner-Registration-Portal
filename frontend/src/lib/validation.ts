import type { Messages } from "@/i18n/en";
import type { FieldErrors, RegistrationDraft, ValidDraft } from "@/types/registration";

// Client-side copy of the field rules in backend/src/lib/validation.ts (BRD
// Section 10), for instant feedback. The backend stays authoritative.

/** F-01: letters, digits, spaces and & . - / only. */
const NAME_PATTERN = /^[A-Za-z0-9 &.\-/]+$/;
/** F-02: ten digits beginning 6–9. */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const OTP_PATTERN = /^\d{4}$/;

export const normaliseName = (s: string) => s.trim().replace(/\s+/g, " ");

/** Keeps digits only, dropping a pasted +91 or 0 prefix, capped at 10 digits. */
export function normaliseMobileInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(0, 10);
}

export type DraftCheck = { ok: true; value: ValidDraft } | { ok: false; errors: FieldErrors };

/** Checks the details step. On success, returns the draft ready to send. */
export function validateDraft(d: RegistrationDraft, v: Messages["validation"]): DraftCheck {
  const errors: FieldErrors = {};
  const name = normaliseName(d.name);
  if (!name) errors.name = v.nameRequired;
  else if (name.length < 3 || name.length > 100) errors.name = v.nameLength;
  else if (!NAME_PATTERN.test(name)) errors.name = v.nameChars;
  else if (!/[A-Za-z]/.test(name)) errors.name = v.nameLetter;

  if (d.productCodes.length === 0) errors.productCodes = v.productsRequired;
  if (!d.stateCode) errors.stateCode = v.stateRequired;
  else if (d.cityId === null) errors.cityId = v.cityRequired;
  if (!MOBILE_PATTERN.test(d.mobile)) errors.mobile = v.mobileInvalid;

  if (Object.keys(errors).length > 0 || d.cityId === null) return { ok: false, errors };
  return { ok: true, value: { ...d, name, cityId: d.cityId } };
}

/** Returns the OTP error message, or undefined when the code is well-formed. */
export const validateOtp = (otp: string, v: Messages["validation"]) =>
  OTP_PATTERN.test(otp) ? undefined : v.otpInvalid;
