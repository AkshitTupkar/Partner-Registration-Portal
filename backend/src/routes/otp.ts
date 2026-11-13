import { Router } from "express";
import { sendOtpSchema } from "../lib/validation.js";
import { sendOtp } from "../services/otp/otpService.js";

export const otpRouter = Router();

/** Sends a mobile OTP (FR-20 / BR-09). */
otpRouter.post("/", async (req, res) => {
  const { mobile } = sendOtpSchema.parse(req.body);
  res.json(await sendOtp(mobile));
});
