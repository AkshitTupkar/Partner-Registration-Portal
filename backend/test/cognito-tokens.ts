import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";
import { atlasAccessTokenVerifier } from "../src/lib/cognito-auth.js";

// Test Cognito access tokens. The verifier is handed this file's public key up
// front (cacheJwks), so tests never call AWS. Pool and client match vitest.config.ts.

export const TEST_POOL_ID = "ap-south-1_TestPool1";
export const TEST_CLIENT_ID = "test-atlas-client";
const ISSUER = `https://cognito-idp.ap-south-1.amazonaws.com/${TEST_POOL_ID}`;
const KID = "test-key";

function keyPair() {
  return generateKeyPairSync("rsa", { modulusLength: 2048 });
}

const trusted = keyPair();
/** A key the verifier doesn't know, for forged-signature tests. */
const untrustedKey = keyPair().privateKey;

if (!atlasAccessTokenVerifier) throw new Error("Cognito isn't configured for tests; see vitest.config.ts.");
const { n, e } = trusted.publicKey.export({ format: "jwk" });
if (!n || !e) throw new Error("RSA public key export is missing n or e.");
atlasAccessTokenVerifier.cacheJwks({ keys: [{ kty: "RSA", n, e, kid: KID, alg: "RS256", use: "sig" }] });

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** Signs a Cognito-style access token; override any claim, or sign with a key the API doesn't trust. */
export function accessToken(claims: Record<string, unknown> = {}, opts: { key?: KeyObject } = {}): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: "RS256", kid: KID, typ: "JWT" });
  const payload = b64url({
    sub: "11111111-2222-3333-4444-555555555555",
    iss: ISSUER,
    client_id: TEST_CLIENT_ID,
    token_use: "access",
    scope: "aws.cognito.signin.user.admin",
    "cognito:groups": ["admin"],
    username: "test-admin",
    iat: now,
    exp: now + 3600,
    ...claims,
  });
  const signature = sign("RSA-SHA256", Buffer.from(`${header}.${payload}`), opts.key ?? trusted.privateKey);
  return `${header}.${payload}.${signature.toString("base64url")}`;
}

export { untrustedKey };

/** Authorization header value for an admin. */
export const asAdmin = () => `Bearer ${accessToken()}`;
