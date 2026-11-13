import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFound } from "./lib/errors.js";
import { mastersRouter } from "./routes/masters.js";
import { otpRouter } from "./routes/otp.js";
import { internalLeadsRouter } from "./routes/internal-leads.js";
import { registrationsRouter } from "./routes/registrations.js";

function limiter(limit: number) {
  return rateLimit({
    windowMs: 10 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => config.NODE_ENV === "test",
    message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again in a few minutes." } },
  });
}

export function createApp() {
  const app = express();

  app.use(helmet());
  const origins = config.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean);
  if (origins.length) app.use(cors({ origin: origins }));
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api/masters", mastersRouter);
  app.use("/api/otp", limiter(10), otpRouter);
  app.use("/api/registrations", limiter(20), registrationsRouter);
  // Dev-only read API for the CRM; see INTERNAL_API_ENABLED in config.ts.
  if (config.INTERNAL_API_ENABLED) app.use("/api/internal/leads", internalLeadsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
