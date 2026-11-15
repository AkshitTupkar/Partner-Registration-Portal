import { createHash, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { HttpError } from "../lib/errors.js";

// Demo gate: a single email and password in front of the hosted demo, so someone
// who stumbles on the link doesn't land on the registration form. Not
// authentication: the API itself stays open, and the browser only remembers that
// the check passed. Off unless DEMO_GATE_EMAIL and DEMO_GATE_PASSWORD are both
// set. The credentials live in the host's environment, never in this public repo.

export const demoGateRouter = Router();

const enabled = () => Boolean(config.DEMO_GATE_EMAIL && config.DEMO_GATE_PASSWORD);

/** Compares fixed-length digests, so the time taken doesn't leak how much matched. */
function same(a: string, b: string) {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

const bodySchema = z.object({
  email: z.string().trim().max(200),
  password: z.string().max(200),
});

demoGateRouter.get("/", (_req, res) => {
  res.json({ enabled: enabled() });
});

demoGateRouter.post("/", (req, res) => {
  if (!enabled()) {
    res.json({ ok: true });
    return;
  }
  const { email, password } = bodySchema.parse(req.body);
  const emailOk = same(email.toLowerCase(), config.DEMO_GATE_EMAIL.trim().toLowerCase());
  const passwordOk = same(password, config.DEMO_GATE_PASSWORD);
  if (!emailOk || !passwordOk) {
    throw new HttpError(401, "DEMO_GATE_DENIED", "That email and password don't match.");
  }
  res.json({ ok: true });
});
