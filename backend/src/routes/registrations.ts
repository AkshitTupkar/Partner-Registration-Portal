import { Router } from "express";
import { registrationSchema } from "../lib/validation.js";
import { registerLead } from "../services/registration.js";

export const registrationsRouter = Router();

/** Public self-registration (FR-01): verifies the OTP and creates the lead. */
registrationsRouter.post("/", async (req, res) => {
  const input = registrationSchema.parse(req.body);
  const result = await registerLead(input);
  res.status(201).json(result);
});
