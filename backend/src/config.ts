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
  /** Serves /api/internal/* (lead list and detail for the CRM). No auth yet: dev only. */
  INTERNAL_API_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
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

// /api/internal/* returns applicants' names and mobile numbers and has no login
// check yet. It exists so the CRM can be built against real lead data locally,
// until the CRM backend owns leads. Never expose it.
if (config.NODE_ENV === "production" && config.INTERNAL_API_ENABLED) {
  console.error("INTERNAL_API_ENABLED is not allowed in production: /api/internal has no authentication.");
  process.exit(1);
}
