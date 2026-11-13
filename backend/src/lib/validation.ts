import { z } from "zod";

// Field rules from BRD Section 10. The frontend mirrors these in
// frontend/src/lib/validation.ts for instant feedback; this file is authoritative.

/** F-01: alphanumeric, 3–100 chars; special characters limited to & . - / */
export const NAME_PATTERN = /^[A-Za-z0-9 &.\-/]+$/;

/** F-02: ten digits beginning 6–9 */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const OTP_PATTERN = /^\d{4}$/;

export const nameSchema = z
  .string({ required_error: "Enter your name or firm name." })
  .transform((s) => s.trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(3, "Name must be at least 3 characters.")
      .max(100, "Name must be at most 100 characters.")
      .regex(NAME_PATTERN, "Use letters, numbers, spaces and & . - / only.")
      .regex(/[A-Za-z]/, "Name must contain at least one letter."),
  );

export const mobileSchema = z
  .string({ required_error: "Enter your mobile number." })
  .trim()
  .regex(MOBILE_PATTERN, "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.");

export const otpCodeSchema = z
  .string({ required_error: "Enter the OTP." })
  .trim()
  .regex(OTP_PATTERN, "Enter the 4-digit OTP.");

export const sendOtpSchema = z.object({ mobile: mobileSchema });

export const registrationSchema = z.object({
  name: nameSchema,
  mobile: mobileSchema,
  otp: otpCodeSchema,
  productCodes: z
    .array(z.string().min(1), { required_error: "Select at least one product." })
    .min(1, "Select at least one product.")
    .max(20)
    .transform((codes) => [...new Set(codes)]),
  stateCode: z.string({ required_error: "Select your state." }).min(1, "Select your state."),
  cityId: z
    .number({ required_error: "Select your city.", invalid_type_error: "Select your city." })
    .int()
    .positive("Select your city."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
