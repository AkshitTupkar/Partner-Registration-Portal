# Atomberg Partner Onboarding

The public partner registration site (BRD FR-01) and its API. Requirements are in [documentation/BRD_Partner_Onboarding.md](documentation/BRD_Partner_Onboarding.md). What's built so far is described in [documentation/fr-01-self-registration.md](documentation/fr-01-self-registration.md).

| Folder | Stack |
| --- | --- |
| `frontend/` | React 19 + TypeScript + Vite, styled with Atomberg UI (vendored) |
| `backend/` | Node + Express 5 + TypeScript, Zod, Prisma with SQLite |

## Run locally

Requires Node 20 or newer.

```bash
# Backend: http://localhost:4000
cd backend
npm install
cp .env.example .env        # first time only
npx prisma migrate dev      # creates prisma/dev.db and seeds products, states and cities
npm run db:seed:demo        # optional: 22 demo applicants at every onboarding stage
npm run dev

# Frontend: http://localhost:5173 (proxies /api to the backend)
cd frontend
npm install
npm run dev
```

The OTP is mocked: use **1234**. Mobile `9000000001` is seeded as a blocked partner, for testing.

## Deploy a demo

The `Dockerfile` at the repo root builds one service that holds the registration site, the API and the SQLite database. Hosts such as Render and Railway pick it up on their own when the repo is connected: create a web service from the repo and leave the build and start commands empty.

Set these variables on the host:

| Variable | Value |
| --- | --- |
| `INTERNAL_API_ENABLED` | `true`, if atlas-frontend's onboarding pages should read this database |
| `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` | with `INTERNAL_API_ENABLED`: Atlas's Cognito pool and app client, so only signed-in Atlas admins and the onboarding team can read applicants. Without them the internal API stays off |
| `CORS_ORIGIN` | the atlas-frontend origin that will call the API, for example `https://dev.example.com` |
| `OTP_HASH_SECRET` | any long random string |
| `DEMO_GATE_EMAIL`, `DEMO_GATE_PASSWORD` | optional: the site asks for this email and password before showing the registration page |

Leave `NODE_ENV` unset. The mock OTP refuses to start in production.

On every start the service applies the migrations, seeds the masters and recreates the 22 demo applicants. The database file lives inside the container, so registrations made on the hosted site are lost on the next deploy or restart unless the host mounts a persistent disk over `backend/prisma`.

The demo gate only stops someone who opens the link by accident from seeing the page. The browser remembers a passed check, and the API behind the page stays open. Set the gate's credentials on the host only, never in this repo, which is public.

This is a demo setup, not a production one: the OTP is always 1234 and the database is SQLite inside the container. `/api/internal/leads` returns applicants' names and mobile numbers only to a signed-in Atlas user in an allowed group (`documentation/onboarding-internal-api.md`, "Sign-in"). Use demo data only and take the service down when the demo is over.

## Checks

```bash
cd backend && npm run typecheck && npm test    # API tests run against prisma/test.db
cd frontend && npm run lint && npm run build    # ESLint, then typecheck + production build
```
