// Shapes for self-registration (FR-01), shared by the API service, the form and
// validation. They mirror backend/src/routes/masters.ts and
// backend/src/lib/validation.ts; change them together.

export interface Product {
  code: string;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface State {
  code: string;
  name: string;
  cities: City[];
}

/** Product and area masters for the form (F-04, F-05). */
export interface Masters {
  products: Product[];
  states: State[];
}

export interface SendOtpResponse {
  expiresInSeconds: number;
  resendInSeconds: number;
}

export interface RegistrationRequest {
  name: string;
  mobile: string;
  otp: string;
  productCodes: string[];
  stateCode: string;
  cityId: number;
}

export interface RegistrationResponse {
  referenceNumber: string;
}

/** What the applicant has entered so far. `cityId` stays null until a city is picked. */
export interface RegistrationDraft {
  name: string;
  productCodes: string[];
  stateCode: string;
  cityId: number | null;
  mobile: string;
}

/** A draft that passed validation: the name is normalised and a city is chosen. */
export type ValidDraft = Omit<RegistrationDraft, "cityId"> & { cityId: number };

/** Every input on the form, in on-screen order. */
export type FieldKey = keyof RegistrationDraft | "otp";

/** One message per field, plus `form` for errors that belong to no single field. */
export type FieldErrors = Partial<Record<FieldKey | "form", string>>;
