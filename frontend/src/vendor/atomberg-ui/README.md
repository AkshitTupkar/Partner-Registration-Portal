# Atomberg UI (vendored)

A local copy of Atomberg UI v0.6.1, taken from the AtomUI connector on 2026-11-02, because the `@atomberg/ui` package isn't published to npm or available as a git dependency.

The app imports it as `@atomberg/ui`, the same as the upstream scaffold. A Vite alias in `vite.config.ts` and a TypeScript path in `tsconfig.app.json` point that name at this folder. Once the real package is available, add it as a dependency and delete the alias, the path and this folder.

## Copied as served

- `tokens.css`, `components.css`
- `Button.jsx`, `Icon.jsx`, `Card.jsx`, `Nav.jsx`, `Feedback.jsx`, `Data.jsx`

## Changed or rebuilt locally

| File | What and why |
| --- | --- |
| `tokens.css`, `components.css` | Every emerald colour that was hard-coded as `rgba(0,184,113,…)` now reads from tokens, so a theme can recolour everything. New tokens: `--at-accent-rgb` and `--at-accent-2-rgb` (channel triplets, used as `rgb(var(--at-accent-rgb) / 0.2)`), `--at-focus` (focus rings and focused field borders; defaults to the accent) and `--at-on-accent` (the checkbox tick; defaults to white). The default look is unchanged. The app's brand overrides live in `src/styles/theme.css`. |
| `Input.jsx` | `Field` takes an optional `htmlFor` and then renders a real `<label>`, so screen readers announce field names. |
| `Badge.jsx` | Upstream maps tone `viridian`, which has no CSS rule, and has no `accent` tone. `accent` now maps to `.at-badge--accent`; `viridian` is kept as an alias. |
| `pigments.js` | Not served by the connector. Rebuilt from the `list_pigments` values, plus a local `atomberg` preset. The preset adds an optional `paper` colour (brand yellow `#F2BB44`) to use as the light smoke base instead of white. |
| `Aura.jsx` | `AiSmoke` uses the pigment's `paper` as its light base when one is set. Without it, the base is white as upstream. |
| `icons.js` | Not served as a file. Holds only the icons this app uses, each copied from `get_icon`. Add more from `list_icons` as needed. |
| `smoke.js` | Not served by the connector. Rewritten as a WebGL fbm shader with the same API that `Aura.jsx` calls. It looks close to, but not exactly like, upstream. The light wash is stronger than a pastel, so light pigments such as yellow still look vivid. It pauses off-screen and draws a still frame under reduced motion. |
| `index.js`, `index.d.ts` | Barrel export and TypeScript declarations. |
