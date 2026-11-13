---
name: code-review-and-quality
description: Multi-axis review of a working branch before merging — correctness, types, state, performance, security, dead code, and consistency with existing repo conventions. Use when asked to review a branch or diff before merge/PR, "check this before I merge", or for a general quality pass over recent changes.
---

# Branch review before merge

Scope: the diff between this branch and `main`. Do not review untouched code except to
confirm a changed call site still matches its definition.

## 0. Establish the diff first

```bash
git fetch origin main --quiet
git --no-pager diff --stat origin/main...HEAD
git --no-pager diff origin/main...HEAD
git --no-pager log --oneline origin/main..HEAD
git status --short          # uncommitted work is part of the review
```

Read every changed file in full — a diff hunk hides the surrounding contract.

## 1. Gates that must pass

Run these; a failure outranks any opinion you have:

```bash
npx tsc -b --pretty false     # `npm run build` also runs this
npm run lint
npm run graph:check           # dependency-cruiser rules
```

Report the actual output for failures. Never claim these passed without running them.

## 2. Review axes

Work through all of these; note explicitly which ones the diff didn't touch.

**Correctness** — off-by-one, inverted conditions, `undefined` on first render, error
paths that leave a loading flag stuck, `await` missing on a promise, unhandled rejection,
timezone/`date-fns` mistakes, money/quantity arithmetic on strings.

**Types** — new `any`/`as`/`!`, network payloads asserted instead of Zod-parsed, widened
return types, props typed loosely enough to accept wrong data. See
`typescript-react-reviewer` for the React-specific set (effects, derived state,
zustand selectors) and delegate the component-level pass to it rather than duplicating.

**State** — does new state belong in a `src/stores/*` store, the URL (`nuqs`), or local
component state? Is a new store registered in
[resetAllStores.ts](src/stores/resetAllStores.ts)? Any duplicate source of truth?

**Performance** — unmemoized `columns`/schemas rebuilt per render, whole-store
subscriptions, list rendering without virtualization, sequential `await`s that should be
`Promise.all`, `xlsx`/`@react-pdf/renderer` pulled into the main chunk instead of a
dynamic `import()`, images/assets without dimensions.

**Security** — see `security-and-hardening` for the full list; at minimum check auth/scope
gating on new routes and actions, `dangerouslySetInnerHTML`, tokens or PII in
`localStorage`/logs, and new env vars (public by definition — no secrets).

**Consistency** — does it match the neighbours? File naming (`kebab-case.ts` dominates),
`src/lib` vs `src/services` placement, existing shadcn/Radix component instead of a
hand-rolled one, `cn()` for class merging, existing formatters in
[formatters.ts](src/lib/formatters.ts), toast via `sonner`/`use-toast`. A second
implementation of something that already exists is a finding.

**Dead weight** — commented-out blocks, `console.log`, unused exports/imports/props,
leftover scratch files, `.env*` values committed by accident, TODOs with no owner.

**UX/a11y** (this branch is `ui-ux/enhancements/*`) — keyboard reachability, focus
handling in dialogs, `aria-label` on icon-only buttons, contrast, loading/empty/error
states for every new async view, and layout at narrow widths.

## 3. Verify before reporting

For each candidate finding, state the concrete trigger: inputs or interaction → wrong
result. If you cannot construct one, either downgrade it to a note or drop it. Re-read the
code once looking for the reason it might be *correct* — guards elsewhere, a type that
already excludes the case, a call site that can't hit it.

## 4. Output

Rank most-severe first, each as:
fix t
```
path:line — <one-sentence defect>
  Trigger: <inputs/interaction → wrong outcome>
  Fix: <smallest change that resolves it>
```

Then: **Gates** (tsc / lint / graph results), **Notes** (non-blocking), and a one-line
merge verdict. Do not apply fixes unless asked — for a fix-it pass, use `/simplify` for
quality cleanups or ask the user to confirm the fix list.
