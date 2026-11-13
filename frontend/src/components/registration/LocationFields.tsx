import { fieldAriaProps } from "@/components/common/field-a11y";
import { FormField } from "@/components/common/FormField";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { State } from "@/types/registration";
import { FIELD_IDS } from "./field-errors";

/** State and city dropdowns side by side (F-05). The city list follows the chosen state. */
export function LocationFields({ states, stateCode, cityId, stateError, cityError, onStateChange, onCityChange }: {
  states: State[];
  stateCode: string;
  cityId: number | null;
  stateError?: string;
  cityError?: string;
  onStateChange: (stateCode: string) => void;
  onCityChange: (cityId: number | null) => void;
}) {
  const t = useT();
  const selectedState = states.find((s) => s.code === stateCode);

  return (
    <div className="po-row">
      <FormField id={FIELD_IDS.stateCode} label={t.form.stateLabel} hideLabel error={stateError}>
        <select
          id={FIELD_IDS.stateCode}
          className={cn("at-select", stateError && "at-input--error")}
          value={stateCode}
          onChange={(e) => onStateChange(e.target.value)}
          {...fieldAriaProps(FIELD_IDS.stateCode, stateError)}
        >
          <option value="">{t.form.statePlaceholder}</option>
          {states.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </FormField>

      <FormField id={FIELD_IDS.cityId} label={t.form.cityLabel} hideLabel error={cityError}>
        <select
          id={FIELD_IDS.cityId}
          className={cn("at-select", cityError && "at-input--error")}
          value={cityId ?? ""}
          disabled={!selectedState}
          onChange={(e) => onCityChange(e.target.value ? Number(e.target.value) : null)}
          {...fieldAriaProps(FIELD_IDS.cityId, cityError)}
        >
          <option value="">{t.form.cityPlaceholder}</option>
          {selectedState?.cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </FormField>
    </div>
  );
}
