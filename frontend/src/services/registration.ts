import { postJson, request } from "@/lib/api";
import type {
  Masters,
  RegistrationRequest,
  RegistrationResponse,
  SendOtpResponse,
} from "@/types/registration";

/** Product and area masters for the form (F-04, F-05). */
export const getMasters = (signal?: AbortSignal) => request<Masters>("/masters", { signal });

/** Sends a 4-digit OTP to the mobile number (FR-20 / BR-09). */
export const sendOtp = (mobile: string) => postJson<SendOtpResponse>("/otp", { mobile });

/** Verifies the OTP and creates the lead (FR-01). */
export const registerPartner = (body: RegistrationRequest) =>
  postJson<RegistrationResponse>("/registrations", body);
