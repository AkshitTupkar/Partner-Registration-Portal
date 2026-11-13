import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../../config.js";
import { prisma } from "../../db.js";
import { HttpError } from "../../lib/errors.js";
import { createOtpSender, type OtpSender } from "./sender.js";

const sender: OtpSender = createOtpSender();

function hashCode(mobile: string, code: string): string {
  return createHmac("sha256", config.OTP_HASH_SECRET).update(`${mobile}:${code}`).digest("hex");
}

function sameHash(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export interface SendOtpResult {
  expiresInSeconds: number;
  resendInSeconds: number;
  /** Only set when the mock sender is active, so testers know what to type. */
  mockCode?: string;
}

/** Issues a new OTP challenge for the number, respecting the resend cooldown. */
export async function sendOtp(mobile: string): Promise<SendOtpResult> {
  const latest = await prisma.otpChallenge.findFirst({
    where: { mobile },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    const elapsed = (Date.now() - latest.createdAt.getTime()) / 1000;
    const wait = Math.ceil(config.OTP_RESEND_COOLDOWN_SECONDS - elapsed);
    if (wait > 0) {
      throw new HttpError(429, "OTP_COOLDOWN", `Please wait ${wait} seconds before requesting another OTP.`);
    }
  }

  const code = sender.generateCode();
  await prisma.otpChallenge.create({
    data: {
      mobile,
      codeHash: hashCode(mobile, code),
      expiresAt: new Date(Date.now() + config.OTP_TTL_SECONDS * 1000),
    },
  });
  await sender.send(mobile, code);

  return {
    expiresInSeconds: config.OTP_TTL_SECONDS,
    resendInSeconds: config.OTP_RESEND_COOLDOWN_SECONDS,
    ...(sender.isMock ? { mockCode: code } : {}),
  };
}

/**
 * Checks the code against the latest challenge for the number and marks it
 * used. Throws an HttpError with field "otp" when the code cannot be accepted.
 */
export async function verifyAndConsumeOtp(mobile: string, code: string): Promise<void> {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { mobile },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.consumedAt || challenge.expiresAt.getTime() < Date.now()) {
    throw new HttpError(400, "OTP_EXPIRED", "This OTP has expired. Please request a new one.", {
      otp: "This OTP has expired. Please request a new one.",
    });
  }
  const tooManyAttempts = () =>
    new HttpError(429, "OTP_TOO_MANY_ATTEMPTS", "Too many wrong attempts. Please request a new OTP.", {
      otp: "Too many wrong attempts. Please request a new OTP.",
    });
  if (challenge.attempts >= config.OTP_MAX_ATTEMPTS) throw tooManyAttempts();

  // Count the attempt before comparing, in one conditional update. Checking first and
  // incrementing after a wrong guess let parallel guesses all pass the check before
  // any was recorded, so the attempt cap could be exceeded.
  const { count: counted } = await prisma.otpChallenge.updateMany({
    where: { id: challenge.id, consumedAt: null, attempts: { lt: config.OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (counted !== 1) throw tooManyAttempts();

  if (!sameHash(challenge.codeHash, hashCode(mobile, code))) {
    throw new HttpError(400, "OTP_INVALID", "The OTP you entered is incorrect.", {
      otp: "The OTP you entered is incorrect.",
    });
  }

  // Conditional update so two concurrent submits cannot both use one code.
  const { count } = await prisma.otpChallenge.updateMany({
    where: { id: challenge.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (count !== 1) {
    throw new HttpError(400, "OTP_EXPIRED", "This OTP has already been used. Please request a new one.", {
      otp: "This OTP has already been used. Please request a new one.",
    });
  }
}
