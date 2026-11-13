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

## Checks

```bash
cd backend && npm run typecheck && npm test    # API tests run against prisma/test.db
cd frontend && npm run lint && npm run build    # ESLint, then typecheck + production build
```
