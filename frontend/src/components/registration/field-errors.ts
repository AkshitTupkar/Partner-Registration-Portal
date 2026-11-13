import type { FieldErrors, FieldKey } from "@/types/registration";

/** Element ids per field, in on-screen order, so the first invalid one can be focused. */
export const FIELD_IDS = {
  name: "reg-name",
  productCodes: "reg-products",
  stateCode: "reg-state",
  cityId: "reg-city",
  mobile: "reg-mobile",
  otp: "reg-otp",
} as const satisfies Record<FieldKey, string>;

/** One note line under the mobile + OTP row: status, or the error for either field. */
export const VERIFY_NOTE_ID = "reg-verify-note";

const FIELD_ORDER = Object.keys(FIELD_IDS) as FieldKey[];
const isFieldKey = (key: string): key is FieldKey => Object.hasOwn(FIELD_IDS, key);

/** Moves focus to the first field (in on-screen order) that has an error. */
export function focusFirstInvalid(errors: FieldErrors) {
  const key = FIELD_ORDER.find((k) => errors[k]);
  if (!key) return;
  const el = document.getElementById(FIELD_IDS[key]);
  // The product fieldset can't take focus itself, so focus its first tile.
  const target = el instanceof HTMLFieldSetElement ? el.querySelector<HTMLElement>("input, select, button") : el;
  target?.focus();
}

/**
 * Maps the API's `fields` onto form fields. The backend keys them by Zod path
 * ("productCodes.0"), so only the first segment counts. A key the form doesn't
 * have becomes a form-level error, so no message is silently dropped.
 */
export function fieldErrorsFromApi(fields: Readonly<Record<string, string>>, fallback: string): FieldErrors {
  const errors: FieldErrors = {};
  for (const [path, message] of Object.entries(fields)) {
    const key = path.split(".")[0] ?? "";
    if (isFieldKey(key)) errors[key] ??= message;
    else errors.form ??= message;
  }
  return Object.keys(errors).length > 0 ? errors : { form: fallback };
}
