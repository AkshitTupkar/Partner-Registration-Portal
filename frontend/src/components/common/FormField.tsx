import type { ReactNode } from "react";
import { errorId, helpId } from "./field-a11y";

/** An inline error under a field, announced as soon as it appears. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={errorId(id)} className="at-help at-help--error" role="alert">
      {children}
    </span>
  );
}

/**
 * Label + control + help or error, using AtomUI field classes.
 * `hideLabel` keeps the label for screen readers but hides it visually,
 * for compact Swiggy-style fields where the placeholder carries the meaning.
 */
export function FormField({ id, label, hideLabel = false, help, error, children }: {
  id: string;
  label: ReactNode;
  hideLabel?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="at-field">
      <label className={hideLabel ? "at-label po-visually-hidden" : "at-label"} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <FieldError id={id}>{error}</FieldError>
      ) : (
        help && <span id={helpId(id)} className="at-help">{help}</span>
      )}
    </div>
  );
}

