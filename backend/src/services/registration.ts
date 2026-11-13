import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { LeadStatus, type LeadStatusCode } from "../domain/status.js";
import { HttpError } from "../lib/errors.js";
import type { RegistrationInput } from "../lib/validation.js";
import { verifyAndConsumeOtp } from "./otp/otpService.js";

const DUPLICATE_MOBILE_MESSAGE = "This mobile number is already registered.";

/** Crockford base32 without I, L, O, U, so references read clearly over the phone. */
const REF_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function newReferenceNumber(): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `ATB-${s}`;
}

/** Products, state and city must exist in the masters, and the city must belong to the state. */
async function assertMastersValid(input: RegistrationInput) {
  const [products, state, city] = await Promise.all([
    prisma.product.findMany({ where: { code: { in: input.productCodes }, active: true }, select: { code: true } }),
    prisma.state.findUnique({ where: { code: input.stateCode }, select: { code: true } }),
    prisma.city.findFirst({
      where: { id: input.cityId, stateCode: input.stateCode, active: true },
      select: { id: true },
    }),
  ]);

  const fields: Record<string, string> = {};
  if (products.length !== input.productCodes.length) fields.productCodes = "Select products from the list.";
  if (!state) fields.stateCode = "Select your state from the list.";
  else if (!city) fields.cityId = "Select a city from the list for your state.";

  if (Object.keys(fields).length) {
    throw new HttpError(400, "VALIDATION_ERROR", "Please check the highlighted fields.", fields);
  }
}

/**
 * Lead qualification (FR-02, BR-01): progress to screening only where a partner
 * is required in the area; otherwise keep the lead in the pipeline pool.
 * TODO(OI-02): the rule is not yet defined, so every lead starts as Registered.
 */
async function qualifyLead(_input: RegistrationInput): Promise<LeadStatusCode> {
  return LeadStatus.REGISTERED;
}

export interface RegistrationResult {
  referenceNumber: string;
}

/**
 * S1 self-registration (FR-01). Order matters:
 * 1. Masters are checked before the OTP is used, so a bad pick doesn't burn the code.
 * 2. Duplicate and blocked checks run only after OTP verification, so nobody can
 *    probe whether a number they don't own is registered.
 */
export async function registerLead(input: RegistrationInput): Promise<RegistrationResult> {
  await assertMastersValid(input);
  await verifyAndConsumeOtp(input.mobile, input.otp);

  // BR-06: the error names the field only, never the existing record.
  const existing = await prisma.lead.findUnique({ where: { mobile: input.mobile }, select: { id: true } });
  if (existing) {
    throw new HttpError(409, "DUPLICATE_MOBILE", DUPLICATE_MOBILE_MESSAGE, { mobile: DUPLICATE_MOBILE_MESSAGE });
  }

  // BR-08: a blocked match halts onboarding (ST-403). The applicant is not told
  // why; the record waits for Super Admin review.
  const blocked = await prisma.blockedPartner.findUnique({ where: { mobile: input.mobile }, select: { id: true } });
  const statusCode = blocked ? LeadStatus.ON_HOLD_BLOCKED : await qualifyLead(input);

  for (let attempt = 0; attempt < 3; attempt++) {
    const referenceNumber = newReferenceNumber();
    try {
      await prisma.lead.create({
        data: {
          referenceNumber,
          name: input.name,
          mobile: input.mobile,
          mobileVerifiedAt: new Date(),
          stateCode: input.stateCode,
          cityId: input.cityId,
          statusCode,
          products: { create: input.productCodes.map((productCode) => ({ productCode })) },
          // First history row. A blocked match is the system's call, not the applicant's.
          statusEvents: {
            create: blocked
              ? { statusCode, actor: "SYSTEM", reason: "Matched the Blocked Partner Master (BR-08)." }
              : { statusCode, actor: "APPLICANT" },
          },
        },
      });
      return { referenceNumber };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const target = String(e.meta?.target ?? "");
        if (target.includes("mobile")) {
          throw new HttpError(409, "DUPLICATE_MOBILE", DUPLICATE_MOBILE_MESSAGE, { mobile: DUPLICATE_MOBILE_MESSAGE });
        }
        if (target.includes("referenceNumber")) continue;
      }
      throw e;
    }
  }
  throw new HttpError(500, "INTERNAL", "Could not create your registration. Please try again.");
}
