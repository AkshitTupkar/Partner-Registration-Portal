---
name: typescript-advanced-types
description: Complex TypeScript typing work — generics, conditional and mapped types, discriminated unions, type predicates, `satisfies`, template literal types, Zod schema inference, and deciphering cryptic tsc errors. Use when designing an API's types, making something generic, removing `any`/`as` casts, or when a type error is hard to read.
---

# Advanced TypeScript

TS 5.9, `strict` on. Type-check with `npx tsc -b --pretty false` (also part of `npm run build`).

## Method

1. Write the call sites you want first, then work backwards to the type that permits them.
2. Start from the simplest thing that compiles; add generics only when a caller needs the
   relationship preserved. A generic used once, in one position, is a value in disguise.
3. Verify inference, not just compilation — hover/assert the inferred type at the call site:
   ```ts
   type Expect<T extends true> = T
   type Eq<A, B> = (<X>() => X extends A ? 1 : 2) extends (<X>() => X extends B ? 1 : 2) ? true : false
   type _ = Expect<Eq<ReturnType<typeof f>, string>>
   ```
4. Prefer runtime validation at boundaries over clever types that assume the network is honest.

## The toolkit, and when each earns its place

**Discriminated unions** — the default for "one of several shapes". Beats optional fields:
```ts
type Result<T> = { status: 'ok'; data: T } | { status: 'error'; error: string }
```
Exhaustiveness: `default: { const _x: never = value; throw new Error(...) }`.

**Type predicates / assertion functions** — narrow `unknown` deliberately:
```ts
function isCase(v: unknown): v is Case { ... }
function assertDefined<T>(v: T): asserts v is NonNullable<T> { if (v == null) throw new Error('nullish') }
```
A predicate whose body doesn't actually check the shape is a lie the compiler trusts —
prefer a Zod parse when the check is non-trivial.

**`satisfies`** — keeps literal types while checking against a constraint. Correct choice
for config/constant maps in `src/constants`:
```ts
const SCOPES = { caseRead: 'case:read', assign: 'case:assign' } satisfies Record<string, string>
type Scope = typeof SCOPES[keyof typeof SCOPES]   // 'case:read' | 'case:assign'
```

**Mapped + key-remapped types** — derive shapes instead of restating them:
```ts
type Nullable<T> = { [K in keyof T]: T[K] | null }
type Setters<T> = { [K in keyof T & string as `set${Capitalize<K>}`]: (v: T[K]) => void }
```

**Conditional types** — for genuinely input-dependent returns. Overloads are usually
clearer for 2–3 discrete cases; conditionals win when the relationship is generic.
Distribution over unions is the common surprise — wrap in `[T] extends [U]` to stop it.

**`infer`** — extracting from a type you don't own (`Awaited`, element of an array,
params of a callback). Reach for built-ins (`Parameters`, `ReturnType`, `Awaited`,
`Extract`, `Exclude`, `NoInfer`) before hand-rolling.

**Template literal types** — route paths, event names, permission strings. Pairs with
key remapping; keep them shallow or errors become unreadable.

**Generic constraints** — `<T extends { id: string }>` documents the requirement and keeps
inference. Add a default (`<T = unknown>`) only when callers commonly omit it. `const T`
type params preserve literal inference without `as const` at the call site.

## Zod 4 (the boundary layer)

- Schema is the source of truth: `type Case = z.infer<typeof caseSchema>` — don't maintain
  a hand-written interface alongside it.
- `z.input` vs `z.output` differ once `.transform()`/`.default()` are involved; pick the
  right side for form values vs parsed data.
- Parse network payloads (`schema.safeParse`) in `src/lib`/`src/services` and return the
  typed result; that's what removes `as ApiResponse` casts upstream.
- `discriminatedUnion` for tagged API responses — better errors and faster than `union`.
- With `react-hook-form`, let the resolver drive form types rather than duplicating them.

## Removing `any` / `as`

In order of preference: narrow with a check → `unknown` + Zod parse → type predicate →
generic that preserves the caller's type → `as` with a comment stating the invariant that
makes it safe. `as unknown as X` and non-null `!` are last resorts and should be rare.

## Reading tsc errors

- Read bottom-up: the last "Type 'X' is not assignable to 'Y'" line is usually the real one.
- Long structural mismatches: bisect by annotating intermediates until the error moves.
- "Excessively deep and possibly infinite" → a recursive conditional/mapped type needs a
  depth guard or a simpler formulation.
- Variance surprises with function props: parameters are contravariant; `(e: MouseEvent) => void`
  won't accept where `(e: Event) => void` is required under `strictFunctionTypes`.

## Guardrails

Don't build a type-level program to save three lines of runtime code. If a type takes
longer to explain than the function it describes, simplify it — future readers and error
messages both pay for cleverness. Keep shared utility types in `src/types`, not inlined
into components.
