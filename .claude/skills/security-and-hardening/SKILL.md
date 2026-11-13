---
name: security-and-hardening
description: Security review and hardening for frontend code touching auth, authorization/scopes, user input, file upload/export, or API integration. Use when changing Cognito/Amplify auth, token handling, route or action gating, rendering user-supplied content, env/config, or adding a new API surface. For a full pending-changes audit on a branch, the built-in /security-review covers the diff.
---

# Frontend security review

Client-side checks are UX, not enforcement — every finding here should also ask "does the
backend enforce this?" Note where it can't be verified from this repo.

## Threat surface in this app

Cognito/Amplify auth ([amplify-config.ts](src/lib/amplify-config.ts),
[auth-service.ts](src/features/auth/auth-service.ts), [auth-store.ts](src/stores/auth-store.ts)),
scope-based authorization ([accessControlStore.ts](src/stores/accessControlStore.ts)),
API keys with scopes, public unauthenticated pages (`public-csat`, `public-invoice`,
`public-quotation` in `src/services`), file export (`xlsx`, `@react-pdf/renderer`),
media capture (`@zxing/*` scanner, `mediasoup-client` video calls), S3 image access
([useS3Images.ts](src/lib/useS3Images.ts)), and customer PII throughout the case flow.

## 1. Authentication & tokens

- Tokens come from Amplify's session (`fetchAuthSession`) at call time — never copied into
  `localStorage`/`sessionStorage`, a zustand store, a URL, or a log line.
- No credentials, client secrets, or AWS keys in `VITE_*` env vars. Everything `VITE_*`
  ships in the bundle and is world-readable; only public identifiers belong there
  (`.env.example` documents this).
- Sign-out must clear all app state — a new store holding user/customer data must be
  registered in [resetAllStores.ts](src/stores/resetAllStores.ts), or the next user on a
  shared machine sees it.
- Idle logout ([use-idle-logout.ts](src/hooks/use-idle-logout.ts)) must not be bypassable by
  a route that mounts outside the authenticated layout.
- Token refresh failure must land the user on the login screen, not a half-authenticated UI
  that retries forever.
- No auth decisions from decoded JWT claims that the client could have tampered with in
  transit-less paths; treat claims as hints, backend as truth.

## 2. Authorization / scopes

- Every new route, action, and mutation needs an explicit scope check via the access-control
  store — default deny, not "hidden if no permission".
- Hiding a button is not authorization. Confirm the corresponding API call is rejected
  server-side for users lacking the scope; flag it as unverified if you can't tell.
- Super-admin / OTP escalation paths ([super-otp-store.ts](src/stores/super-otp-store.ts))
  deserve extra scrutiny: no client-only gate, no persisted "escalated" flag that survives
  reload, and a bounded window.
- IDOR: any id taken from the URL (`caseId`, `userId`, invoice tokens) must be authorized
  server-side; the client must not assume "I could navigate here" means "I may read this".
- New API-key scopes must be least-privilege and consistent with the existing scope names.

## 3. Untrusted input & rendering

- `dangerouslySetInnerHTML` requires sanitization plus a comment justifying it; prefer text.
- Never build a URL for `href`/`src`/`window.open` from user data without validating the
  scheme — `javascript:`/`data:` are XSS. External links get `rel="noopener noreferrer"`.
- Validate at the boundary with Zod (`safeParse`) rather than asserting `as` on responses;
  a malformed/hostile payload should produce a handled error, not a crash or a wrong render.
- `postMessage`/socket message handlers must check origin and validate the payload shape
  before use ([vc-socket.ts](src/lib/vc-socket.ts)).
- Uploads: check MIME/extension and size client-side for UX, and assume the server
  re-checks; filenames from users must be sanitized before being echoed into the DOM or a
  `Content-Disposition`-style download name.
- CSV/XLSX export: prefix cells starting with `= + - @` (formula injection) before writing
  with `xlsx`.

## 4. Data exposure

- No PII (phone, address, email, customer names) in `console.*`, analytics, or error
  messages surfaced to unauthenticated pages.
- Public pages must fetch only what an unauthenticated token/link grants — check the shape
  returned by `public-*` services for over-fetching (internal notes, other customers' data).
- Signed S3 URLs: short expiry, not persisted, not logged, not shared across users.
- Error UI shows a message, not a stack trace or raw backend response.

## 5. Config & dependencies

- `.env*` files: never committed with real secrets (`.gitignore` covers `.env*.local`);
  `.env.example` holds placeholders and public ids only.
- New dependency → check it's the real package (typosquat), maintained, and doesn't pull a
  postinstall script. `npm audit --omit=dev` for known advisories on runtime deps.
- Don't add remote script/style/font hosts casually — each is a supply-chain and CSP
  concern. Prefer bundled/self-hosted.

## 6. Reporting

For each finding: `path:line`, the concrete abuse path (who does what, and what they get),
severity (critical/high/medium/low), and the fix. Separate **confirmed client-side issues**
from **needs backend verification**. Do not pad the list — a clean diff gets a one-line
verdict naming what you checked.
