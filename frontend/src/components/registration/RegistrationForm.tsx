import { Button, Icon, Input } from "@atomberg/ui";
import { fieldAriaProps } from "@/components/common/field-a11y";
import { FormField } from "@/components/common/FormField";
import { useT } from "@/i18n";
import type { Masters } from "@/types/registration";
import { FIELD_IDS } from "./field-errors";
import { LocationFields } from "./LocationFields";
import { MobileVerification } from "./MobileVerification";
import { ProductPicker } from "./ProductPicker";
import { useRegistrationForm, type Registered } from "./use-registration-form";

export function RegistrationForm({ masters, onRegistered }: {
  masters: Masters;
  onRegistered: (result: Registered) => void;
}) {
  const t = useT();
  const form = useRegistrationForm(onRegistered);
  const { draft, errors, verification, sending, submitting } = form;
  const busy = sending || submitting;

  const submitLabel =
    verification.step === "details"
      ? sending ? t.form.sendingOtp : t.form.getOtp
      : submitting ? t.form.submitting : t.form.submit;

  return (
    <form className="po-reg__form" onSubmit={form.onSubmit} noValidate>
      <FormField id={FIELD_IDS.name} label={t.form.nameLabel} hideLabel error={errors.name}>
        <Input
          id={FIELD_IDS.name}
          autoComplete="name"
          maxLength={100}
          placeholder={t.form.namePlaceholder}
          value={draft.name}
          onChange={(e) => form.updateField("name", e.target.value)}
          error={!!errors.name}
          {...fieldAriaProps(FIELD_IDS.name, errors.name)}
        />
      </FormField>

      <ProductPicker
        id={FIELD_IDS.productCodes}
        legend={t.form.productsLabel}
        products={masters.products}
        selected={draft.productCodes}
        onChange={(codes) => form.updateField("productCodes", codes)}
        error={errors.productCodes}
      />

      <LocationFields
        states={masters.states}
        stateCode={draft.stateCode}
        cityId={draft.cityId}
        stateError={errors.stateCode}
        cityError={errors.cityId}
        onStateChange={form.selectState}
        onCityChange={(cityId) => form.updateField("cityId", cityId)}
      />

      <MobileVerification
        verification={verification}
        mobile={draft.mobile}
        onMobileChange={(mobile) => form.updateField("mobile", mobile)}
        mobileError={errors.mobile}
        otp={form.otp}
        onOtpChange={form.changeOtp}
        otpError={errors.otp}
        otpRef={form.otpRef}
        resendDisabled={busy}
        onResend={form.resendOtp}
        onChangeNumber={form.changeNumber}
      />

      {errors.form && (
        <p className="po-form-error" role="alert">
          <Icon name="alert-circle" size={16} /> {errors.form}
        </p>
      )}

      {/* aria-disabled, not disabled: a focused button that becomes disabled drops focus to
          <body>, losing the user's place. The form ignores submits while a request runs. */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="po-reg__submit"
        busy={busy}
        aria-disabled={busy || undefined}
      >
        {submitLabel}
        {!busy && <Icon name="arrow-right" size={18} />}
      </Button>
    </form>
  );
}
