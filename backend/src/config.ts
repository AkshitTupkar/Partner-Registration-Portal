import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default(""),
  OTP_PROVIDER: z.enum(["mock"]).default("mock"),
  MOCK_OTP_CODE: z.string().regex(/^\d{4}$/, "MOCK_OTP_CODE must be 4 digits").default("1234"),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().nonnegative().default(30),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_HASH_SECRET: z.string().min(1).default("dev-only-change-me"),
  /** Folder with the built registration site (frontend/dist). When set, the API serves it too, so one service hosts both. */
  STATIC_DIR: z.string().default(""),
  /** Number of reverse proxies in front of the API (1 on Render, Railway and similar). Rate limits need it to see the visitor's IP. */
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(0),
  /** Demo gate (routes/demo-gate.ts): both set → the site asks for this email and password first. Not authentication. */
  DEMO_GATE_EMAIL: z.string().default(""),
  DEMO_GATE_PASSWORD: z.string().default(""),
  /** Serves /api/internal/* (lead list and detail for the CRM). Needs the Cognito settings below. */
  INTERNAL_API_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Atlas's Cognito user pool, e.g. ap-south-1_AbCdEf123. /api/internal/* accepts only its access tokens. */
  COGNITO_USER_POOL_ID: z
    .string()
    .trim()
    .regex(/^$|^[\w-]+_[0-9a-zA-Z]+$/, "COGNITO_USER_POOL_ID must look like ap-south-1_AbCdEf123")
    .default(""),
  /** Atlas's Cognito app client ID(s), comma-separated. Tokens issued to other clients are refused. */
  COGNITO_CLIENT_ID: z.string().default(""),
  /** Cognito groups (case-insensitive, comma-separated) allowed to read /api/internal/*. Mirrors atlas-frontend's ONBOARDING_ROLES. */
  INTERNAL_API_GROUPS: z.string().default("admin,superadmin,partner_account_admin"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;

if (config.NODE_ENV === "production" && config.OTP_HASH_SECRET === "dev-only-change-me") {
  console.error("OTP_HASH_SECRET must be set in production.");
  process.exit(1);
}

// The mock sender accepts MOCK_OTP_CODE for every number and returns it in the
// API response, so in production anyone could "verify" a mobile they don't own
// (BR-09). Refuse to start until a real SMS gateway is wired in (INT-07).
if (config.NODE_ENV === "production" && config.OTP_PROVIDER === "mock") {
  console.error("OTP_PROVIDER=mock is not allowed in production. Configure a real SMS gateway.");
  process.exit(1);
}

/** Splits a comma-separated setting into its trimmed, non-empty parts. */
export function csv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

// /api/internal/* returns applicants' names and mobile numbers, so it only runs
// behind Atlas sign-in (lib/cognito-auth.ts). Without the Cognito settings it stays
// off. The rest of the API still starts, so a hosted demo that already has
// INTERNAL_API_ENABLED set keeps serving the registration site.
export const internalApiActive =
  config.INTERNAL_API_ENABLED && Boolean(config.COGNITO_USER_POOL_ID) && csv(config.COGNITO_CLIENT_ID).length > 0;

if (config.INTERNAL_API_ENABLED && !internalApiActive) {
  console.error(
    "INTERNAL_API_ENABLED is set but COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID is missing: /api/internal stays off.",
  );
}
