import { useState, type Ref } from "react";
import { cn } from "@/lib/utils";

/**
 * N-digit OTP entry shown as separate rounded boxes. A single transparent input sits over
 * the boxes, so SMS autofill (`one-time-code`), paste, backspace and screen readers all work
 * as for one ordinary field. The boxes only draw the digits and which one is next.
 */
export function OtpInput({
  id,
  ref,
  value,
  onChange,
  length = 4,
  error = false,
  autoFocus = false,
  describedBy,
}: {
  id: string;
  ref?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  /** Focus on mount. The field only appears after the user asks for an OTP. */
  autoFocus?: boolean;
  describedBy?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);

  return (
    <div className={cn("po-otp", error && "po-otp--error")}>
      <input
        ref={ref}
        id={id}
        className="po-otp__input"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        // Typing always goes to the next empty box, so keep the caret at the end.
        onSelect={(e) => {
          const el = e.currentTarget;
          const end = el.value.length;
          if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
      />
      <div className="po-otp__boxes" aria-hidden="true">
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={cn(
              "po-otp__box",
              value[i] && "po-otp__box--filled",
              focused && i === active && "po-otp__box--active",
            )}
          >
            {value[i] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
