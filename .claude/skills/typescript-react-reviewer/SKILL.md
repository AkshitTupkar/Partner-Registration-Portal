---
name: typescript-react-reviewer
description: Review React 19 + TypeScript code for anti-patterns — useEffect abuse, derived state kept in useState, stale closures, missing/incorrect hook deps, zustand selector mistakes, prop drilling, unstable keys, `any`/assertion escapes. Use when reviewing or writing components, hooks, or stores, and when a component "re-renders too much", "flickers", "loops", or state drifts out of sync.
---

# TypeScript + React 19 reviewer

Read the file(s) in full before judging. Report findings as `path:line` with the
concrete failure (what input/interaction produces the wrong render), not style notes.

## Stack facts for this repo

- React 19.2, `react-dom` 19.2, Vite 8, TS 5.9 (strict via `tsconfig.app.json`).
- `eslint-plugin-react-hooks` v7 flat recommended is on — exhaustive-deps violations
  are lint errors, so a *silenced* one (`// eslint-disable-next-line`) is a review target.
- State lives in `src/stores/*` (zustand 5), data access in `src/lib/*` and
  `src/services/*`, URL state via `nuqs` (see [use-list-url-state.ts](src/hooks/use-list-url-state.ts)).
- Tables: `@tanstack/react-table` + `@tanstack/react-virtual`. Forms: `react-hook-form` + `zod` 4.

## 1. useEffect abuse — the highest-yield check

Flag an effect whenever the same result is reachable without one:

| Smell | Fix |
| --- | --- |
| Effect computes state from props/other state | Compute inline during render; `useMemo` only if provably expensive |
| Effect resets state when a prop changes | `key={id}` on the component, or compute from the prop |
| Effect syncs two `useState`s | Delete one — make it derived |
| Effect fetches on mount with no cancellation | Add an abort/ignore guard; check the store isn't already loading it |
| Effect calls a store action that sets state the effect depends on | Render loop — restructure or move into the action |
| Effect wires an event handler that belongs in the handler | Move the logic to the event handler |

Legit effects: subscriptions/sockets ([vc-socket.ts](src/lib/vc-socket.ts)), timers
([use-elapsed.ts](src/hooks/use-elapsed.ts)), idle timers
([use-idle-logout.ts](src/hooks/use-idle-logout.ts)), polling
([use-poll-if-in-flight.ts](src/hooks/use-poll-if-in-flight.ts)), imperative DOM/3rd-party
(GSAP, ZXing scanner), and browser-API reads. For those, verify the cleanup function
actually tears down every subscription/timer/listener it created, and that async work
resolving after unmount cannot call `setState`.

## 2. Fetch effects — the checklist

```tsx
useEffect(() => {
  let cancelled = false
  const ac = new AbortController()
  void load(ac.signal).then(r => { if (!cancelled) setData(r) })
  return () => { cancelled = true; ac.abort() }
}, [caseId])          // ← every value read inside must be here
```

Check: races on rapid `caseId` changes (last-response-wins bug), double-invoke under
StrictMode dev mount, error state left `undefined` on reject, and loading flags that
never clear on the throw path.

## 3. Derived state

Anything reconstructible from props, store state, or the URL must not sit in `useState`.
Common instances: filtered/sorted lists, counts, `isValid`, selected-row objects (store
the id, look up the row), and "copies" of a store field. A `useState` initialized from a
prop only ever reflects the first render — that's a bug unless it is deliberately a draft.

## 4. zustand 5 usage

- **Select narrowly**: `useCasesStore(s => s.cases)`, never `useCasesStore()` (subscribes
  to every field) and never a fresh object/array literal in the selector without
  `useShallow` — that returns a new reference each run and re-renders forever.
- Actions belong in the store, not spread across components; a component that reads three
  fields to compute one thing usually wants a derived selector.
- Cross-store writes during render are a red flag; do them in actions or handlers.
- On logout, state must go through [resetAllStores.ts](src/stores/resetAllStores.ts) —
  a new store that holds user data and isn't registered there leaks data across sessions.

## 5. Hooks discipline

- Deps arrays: no missing values, no silenced exhaustive-deps, no object/array literals as
  deps (new identity every render). Prefer primitives.
- `useCallback`/`useMemo` only where identity or cost matters (memoized child, dep array,
  TanStack `columns`). Everywhere else they add noise.
- **Unstable definitions**: `columns`, `defaultValues`, and Zod schemas rebuilt inline each
  render reset table/form state — hoist to module scope or memoize.
- No conditional hooks; no hooks in loops; custom hooks named `use*`.
- Refs are for imperative handles and latest-value reads, not for state that should render.

## 6. React 19 specifics

- `ref` is a normal prop — `forwardRef` in new code is unnecessary indirection.
- Prefer `useActionState`/`useOptimistic`/`useTransition` over hand-rolled
  `isSubmitting` + try/finally where they fit.
- `use()` for context reads is fine, but not conditionally inside a branch that changes.
- Cleanup return values from refs are supported; verify they're not accidentally returning
  a value from an arrow-bodied ref callback (`ref={el => (x = el)}` now warns).

## 7. TypeScript quality

- `any`, `as unknown as`, and non-null `!` are findings unless justified in a comment.
  Prefer narrowing, `unknown` + a Zod parse, or a type predicate.
- API payloads must be validated at the boundary (Zod in `src/lib`/`src/services`), not
  asserted with `as ApiResponse`. An `as` on a network response is a runtime hole.
- Discriminated unions over optional-field soup (`{status: 'ok'} | {status: 'error'}`).
- Props: no `React.FC` needed; type children as `ReactNode`; avoid `object`/`{}`.
- Enums → `as const` object + `keyof typeof` union, matching existing `src/constants`.

## 8. Rendering correctness

- Keys: stable domain ids, never array index for reorderable/filterable lists.
- No state updates during render (outside the render-phase setState-with-guard idiom).
- Lists over ~200 rows should go through `@tanstack/react-virtual`.
- Guard against `undefined` during first paint (`data?.items ?? []`), especially in tables.

## Output

Group findings as **Bugs** (wrong behavior) → **Anti-patterns** (works, will break) →
**Types**. Skip anything that is purely cosmetic. If the file is clean, say so in one line
rather than inventing findings.
