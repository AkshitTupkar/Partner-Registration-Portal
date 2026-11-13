---
name: vercel-react-best-practices
description: React performance and data-flow patterns when writing or refactoring components — render cost, memoization, bundle splitting, list virtualization, waterfall requests, Suspense/transitions, image and font loading. Use when a screen feels slow, a list janks, the bundle grows, or when building a new page/component and wanting the fast shape from the start.
---

# React performance patterns

This project is a **Vite 8 SPA** (React 19.2, `react-router-dom` 7) — not Next.js. Server
Components, `next/image`, and route-segment caching do not apply; the transferable rules
are below, adapted to client rendering.

Measure before optimizing. React DevTools Profiler for renders, the Network panel for
waterfalls, and `npx vite build --mode staging` + the chunk sizes it prints for bundle
regressions. State the measured cost in any recommendation.

## 1. Render cost

- **Narrow the subscription, not the render.** Most excess renders here come from
  `useStore()` without a selector or a selector returning a fresh object. Fix the selector
  before reaching for `memo`.
- **Lift the expensive child out, don't memo around it.** `memo` only helps when props are
  referentially stable; a `memo` component receiving `{...obj}` or an inline arrow gains
  nothing.
- **Move state down.** A `useState` in a page component re-renders the whole page; push it
  into the subtree that reads it.
- **Composition beats memoization**: passing `children` through a component that owns fast-
  changing state keeps the children from re-rendering at all.
- `useMemo` for real work (parsing, grouping, sorting thousands of rows) and for dep-array
  identity. Not for `a + b`.

## 2. Lists and tables

- Over ~200 rows, virtualize with `@tanstack/react-virtual` (already a dependency).
- `columns` for `@tanstack/react-table` must be module-scope or `useMemo`'d — rebuilding
  them resets column sizing/visibility and re-renders every cell.
- Stable domain-id keys. Index keys plus filtering = wrong rows retaining state.
- Row-level `onClick` handlers: one handler on the container reading a `data-id`, or a
  `useCallback` per stable id — not a new closure per row per render.
- Keep per-cell formatting cheap; hoist `date-fns`/`Intl` formatter instances to module
  scope instead of constructing them per cell.

## 3. Data fetching

- **Kill waterfalls.** Independent requests → `Promise.all`. A child that fetches what its
  parent already has should take it as a prop. Fetching in a `useEffect` that depends on
  another fetch's result is a two-round-trip screen.
- Fetch on interaction/route entry, and cancel with `AbortController` when the input
  changes so a stale response can't win.
- De-dupe in the store: if two components mount and both trigger the same load, guard with
  an in-flight flag (the pattern in [use-poll-if-in-flight.ts](src/hooks/use-poll-if-in-flight.ts)).
- Polling: interval driven by whether work is actually in flight; always clear on unmount
  and pause when the tab is hidden.

## 4. Bundle

- Route-level `React.lazy` + `Suspense` for pages behind navigation; check `App.tsx` /
  route config before adding a heavy page eagerly.
- **Dynamic-import the heavy leaves**: `xlsx`, `@react-pdf/renderer`, `@zxing/*`,
  `mediasoup-client`, `gsap`, `world-countries`. These belong in the chunk of the feature
  that uses them, loaded on the click that needs them.
- Import specific icons from `lucide-react` (`import { X } from 'lucide-react'`) — never a
  namespace import.
- Prefer `date-fns` function imports over broad ones; avoid pulling a whole locale set.
- No `import type` values at runtime; keep type-only imports marked so they're erased.

## 5. Perceived performance

- Every async view needs the four states: loading (skeleton matching final layout, not a
  spinner that shifts content), empty, error with a retry, and loaded.
- `useTransition` for filter/sort/tab switches that re-render a big list — keeps input
  responsive instead of blocking on the render.
- `useOptimistic` for mutations with an obvious expected outcome (assign, mark-read).
- Avoid layout shift: reserve dimensions for images and async blocks; `width`/`height` on
  `<img>` and stable container heights.

## 6. Assets

- Images through Vite's asset pipeline (imported, so they're hashed); `loading="lazy"` +
  `decoding="async"` below the fold; correct intrinsic sizes.
- Self-host fonts, `font-display: swap`, preload only the one face above the fold.
- Tailwind handles CSS — don't add per-component style objects that defeat class merging;
  use `cn()`.

## 7. Anti-patterns to flag

Wrapping everything in `memo`/`useCallback` "for safety" · `key={Math.random()}` ·
state duplicated between a store and a component · effects that write state read by the
same effect · `JSON.parse(JSON.stringify(x))` on every render · sorting/filtering inside
JSX rather than a memo · a context provider holding fast-changing values with many
consumers · `window.location` navigation instead of the router.

Report as: measured/observed cost → cause at `path:line` → smallest fix → expected effect.
