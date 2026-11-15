# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**partnerOnboarding**: Atomberg's partner onboarding, built from the BRD in `documentation/BRD_Partner_Onboarding.md`. So far only step S1 is built: the public self-registration site (FR-01). See `documentation/fr-01-self-registration.md`. A dev-only read API (`/api/internal/leads`) also serves leads and their status history to atlas-frontend's onboarding pages; see `documentation/onboarding-internal-api.md`.

The frontend and backend are separate npm projects with no shared code. Validation rules live in both `backend/src/lib/validation.ts`, which is authoritative, and `frontend/src/lib/validation.ts`. Change them together.

## Commands

Backend (`cd backend`):
- Dev server: `npm run dev` (http://localhost:4000)
- Typecheck: `npm run typecheck`
- Tests: `npm test` (Vitest + Supertest; rebuilds `prisma/test.db` from migrations, never touches `dev.db`)
- New migration after editing `prisma/schema.prisma`: `npx prisma migrate dev --name <change>`
- Seed masters: `npm run db:seed`
- Hosted demo start: `npm run start:demo` (migrate, seed masters and demo applicants, then start; used by the root `Dockerfile`, see README "Deploy a demo")
- Seed demo applicants at every onboarding stage: `npm run db:seed:demo` (dev only; replaces earlier demo rows)

Frontend (`cd frontend`):
- Dev server: `npm run dev` (http://localhost:5173, proxies `/api` to :4000)
- Typecheck + build: `npm run build`
- Lint: `npm run lint` (ESLint with React hooks rules, same setup as atlas-frontend)

The OTP is mocked (`OTP_PROVIDER=mock`) and always `1234`. The backend refuses to start with the mock in production.

## Conventions

- **BRD references:** cite field (`F-xx`), rule (`BR-xx`), status (`ST-xxx`) and open item (`OI-xx`) codes in comments where code implements them.
- **Design:** the homepage follows the Swiggy partner page closely, which the user asked for explicitly. That means a plain white header bar, an edge-to-edge photo hero with a dark overlay and a large light-weight white headline, and a solid white form card with the logo mark on its top edge. Where the Swiggy look conflicts with AtomUI's rules (dark hero, solid card), the Swiggy look wins. Elsewhere, build with Atomberg UI only, imported as `@atomberg/ui` (vendored in `frontend/src/vendor/atomberg-ui`, see its README). Don't add Tailwind, shadcn or icon libraries. If an icon is missing from `icons.js`, copy it from the AtomUI connector (`get_icon`).
- **Brand colours:** yellow `#F2BB44` with black text, set only in `frontend/src/styles/theme.css` plus the `atomberg` pigment in `pigments.js`. Never hard-code a colour in components or `styles/partials/`; use `var(--at-accent)`, `rgb(var(--at-accent-rgb) / <alpha>)` or `var(--at-ink)`. Yellow is never used for text or focus rings (~1.8:1 contrast). Use ink, with yellow as a fill, wash or underline. The one exception is yellow text on the dark hero overlay, where it reads well. Primary buttons and selected chips are full yellow with black text, and buttons darken to amber on hover (overrides in `theme.css`).
- **Headings:** only the hero headline has a coloured accent word ("Atomberg." in bold yellow). Other section headings are plain.
- **Logos:** `frontend/public/logo.png` (full logo) and `logosmall.png` (mark only) are the originals. The page uses optimised copies: `logo-wordmark.png` (trimmed, header and footer) and `logo-mark.png` (128px; favicon and form card).
- **Audience:** copy speaks first to individual technicians and engineers. Firms are welcome, but the page shouldn't read as being for agencies only.
- **Page styles:** one partial per page area in `frontend/src/styles/partials/`, imported in order by `styles/app.css`, with classes prefixed `po-`. Keep `responsive.css` after the base partials, since its media queries override them.
- **Animation:** the registration card uses React's `<ViewTransition>` (stable in React 19.3). A change only animates when its state update runs inside `startTransition`. Classes are defined in `styles/partials/view-transitions.css`, which also turns animations off for reduced motion.
- **User-facing copy:** goes in `frontend/src/i18n/en.ts`, never inline in components. Copy must not claim anything the BRD doesn't support. Deposit amount and refund terms are still open (OI-08).
- **Content:** placeholder images, figures and testimonials live in `frontend/src/content/placeholders.ts`. Real product photos are in `frontend/public`, mapped by product code in `frontend/src/content/products.ts`.
- **First screen:** the hero (with the registration card) and the four benefit titles must fit above the fold at 1366×768 and up. Check this after any change to the hero, the form or the benefits section.
- **API errors:** use the shape `{ error: { code, message, fields? } }`. Throw `HttpError` from `backend/src/lib/errors.ts`.

## Repository layout

- `frontend/`: React 19 + TypeScript + Vite registration site
- `backend/`: Express 5 + TypeScript + Prisma (SQLite) API
- `CHANGELOG.md`: notable changes (see [Changelog](#changelog))
- `.claude/skills/`: project skills (see below)
- `documentation/`: specs, integration notes, backend asks and audits (see [documentation/README.md](documentation/README.md))

### Frontend source (`frontend/src`)

Modelled on atlas-frontend's layout. Import across folders with the `@/` alias (`@/lib/api`); use `./` only within a feature folder.

| Folder | Holds |
| --- | --- |
| `pages/` | Page components that only compose sections (`HomePage.tsx`) |
| `components/common/` | Shared building blocks: `FormField`, `OtpInput`, `Wordmark`, field a11y helpers |
| `components/layout/` | `SiteHeader`, `SiteFooter` |
| `components/home/` | One file per homepage section (`Hero`, `Benefits`, `Steps`, …) |
| `components/registration/` | The FR-01 feature: `RegistrationCard` (+ `.parts.tsx`), its subcomponents, and the hooks that own its logic (`use-registration-form.ts`, `use-masters.ts`) |
| `hooks/` | Generic hooks (`use-seconds-until.ts`) |
| `services/` | One function per API endpoint. Only this layer may call `request`/`postJson` (enforced by ESLint) |
| `lib/` | `api.ts` (fetch client + `ApiError`), `validation.ts`, `utils.ts` (`cn()`), `scroll.ts` |
| `types/` | Shared shapes (`registration.ts`) that mirror the backend |
| `i18n/`, `content/`, `styles/`, `vendor/` | Copy, placeholder content, CSS, vendored AtomUI |

Naming: components `PascalCase.tsx`; hooks `use-kebab-case.ts`; other modules `kebab-case.ts`. A file that exports a component exports only components, so Vite fast refresh works (ESLint enforces this).

## Skills

Project skills live in `.claude/skills/`. Use the matching skill when a task fits its description.

| Skill | Use for |
| --- | --- |
| `code-review-and-quality` | Multi-axis review of a branch or diff before merge |
| `security-and-hardening` | Auth, scopes, user input, file upload/export, API integration |
| `typescript-react-reviewer` | React + TypeScript anti-patterns (effects, derived state, stale closures, keys) |
| `typescript-advanced-types` | Generics, conditional/mapped types, discriminated unions, Zod inference, tsc errors |
| `vercel-react-best-practices` | React performance: render cost, memoization, code splitting, waterfalls, Suspense |
| `web-design-guidelines` | UI, accessibility and UX review against Web Interface Guidelines |
| `tailwind-4-docs` | Tailwind CSS v4 utilities, config and v3 to v4 migration (offline docs in `references/`) |
| `explore-design` | Side-by-side HTML design explorations, then implementing the chosen direction |

## Documentation

- Write feature specs, integration plans, backend requirements and audits as Markdown in `documentation/`.
- Use kebab-case file names (e.g. `partner-signup-flow.md`, `onboarding-be-asks.md`).
- When a change affects behaviour described in `documentation/`, update the relevant doc in the same change.

## Changelog

- Every notable change gets an entry under `## [Unreleased]` in `CHANGELOG.md`, in the same change. That includes features, behaviour changes, fixes, and docs or tooling added to the repo.
- Use the Keep a Changelog sections: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Newest entry goes first in its section.
- Start each entry with a bold one-line summary of what changed for the user, then explain the details in plain language: who it affects, what they see, and any backend or integration it depends on.
- Don't log internal refactors that change no behaviour.
