import type { RequestHandler } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { FetchError, JwtBaseError } from "aws-jwt-verify/error";
import { config, csv } from "../config.js";
import { HttpError } from "./errors.js";

// Sign-in for /api/internal/*: the caller sends the Atlas user's Cognito access
// token (what atlas-frontend already sends its own backend) as a Bearer token. The
// token must be signed by Atlas's user pool, issued to Atlas's app client, unexpired,
// and carry one of INTERNAL_API_GROUPS in cognito:groups. Signing keys are fetched
// from the pool's public JWKS once and cached.

/**
 * Null when Cognito isn't configured. app.ts then never mounts the internal API
 * (see internalApiActive), so the middleware below is never reached without it.
 */
export const atlasAccessTokenVerifier =
  config.COGNITO_USER_POOL_ID && csv(config.COGNITO_CLIENT_ID).length
    ? CognitoJwtVerifier.create({
        userPoolId: config.COGNITO_USER_POOL_ID,
        tokenUse: "access",
        clientId: csv(config.COGNITO_CLIENT_ID),
      })
    : null;

// Atlas compares roles case-insensitively too: groups can arrive as "ASM" or "asm".
const allowedGroups = new Set(csv(config.INTERNAL_API_GROUPS).map((g) => g.toLowerCase()));

const SIGN_IN_AGAIN = "Sign in to Atlas again to see onboarding applicants.";

export const requireAtlasStaff: RequestHandler = async (req, res, next) => {
  // Responses carry applicants' names and mobile numbers: keep them out of caches.
  res.set("Cache-Control", "no-store");

  const verifier = atlasAccessTokenVerifier;
  if (!verifier) throw new HttpError(503, "AUTH_NOT_CONFIGURED", "Onboarding sign-in is not set up on this server.");

  const [scheme, token, extra] = (req.get("authorization") ?? "").split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token || extra !== undefined) {
    throw new HttpError(401, "UNAUTHENTICATED", SIGN_IN_AGAIN);
  }

  let groups: string[];
  try {
    const payload = await verifier.verify(token);
    groups = payload["cognito:groups"] ?? [];
  } catch (err) {
    // Couldn't download the pool's signing keys: our problem, not the caller's.
    if (err instanceof FetchError) {
      console.error("Cognito JWKS fetch failed:", err.message);
      throw new HttpError(503, "AUTH_UNAVAILABLE", "Couldn't check your Atlas sign-in. Try again in a moment.");
    }
    // Bad signature, expired, wrong pool, wrong client, an ID token instead of an access token…
    if (err instanceof JwtBaseError) throw new HttpError(401, "UNAUTHENTICATED", SIGN_IN_AGAIN);
    throw err;
  }

  if (!groups.some((g) => allowedGroups.has(g.toLowerCase()))) {
    throw new HttpError(403, "FORBIDDEN", "Your Atlas role can't view onboarding applicants.");
  }
  next();
};
