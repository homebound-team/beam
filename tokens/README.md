# Beam token authoring

Color tokens are driven from Figma Variables. Motion tokens are hand-authored in repo.

| File | Role |
| --- | --- |
| [`figma-colors.raw.json`](./figma-colors.raw.json) | **Color source of truth** — MCP export from Figma Variables |
| [`color.json`](./color.json) | **Generated** DTCG colors — do not edit; produced by `yarn generate:design-tokens` |
| [`motion.json`](./motion.json) | **Hand-authored** motion (`duration` / `easing`) |

[`yarn generate:design-tokens`](../scripts/generate-design-tokens.ts) merges `color.json` + `motion.json` and emits **`truss-token-vars.ts`**, **`truss-palette.ts`**, **`truss-motion.ts`**, and **`src/css/generated/theme-scopes.css`**. Truss uses [`truss-config.ts`](../truss-config.ts); run **`yarn build:truss`** after token edits when you also need regenerated **`src/Css.ts`** / **`src/Css.json`**.

**Palette in `truss-palette.ts`:** primitives only — `White` / `Transparent`, then other `beam.color.primitive.*` keys in JSON order. Semantic roles are **not** in the Truss palette.

**Normative color format:** [Design Tokens Color Module 2025.10](https://www.designtokens.org/tr/2025.10/color/#color-tokens) — for `$type: "color"`, `$value` is `colorSpace: "srgb"`, `components: [r, g, b]` (each **0–1**), optional `alpha`, optional `hex`. Semantic baselines usually reference `{beam.color.primitive.*}`.

## Updating colors from Figma

Do **not** use Figma’s per-collection JSON export — wrong shape, and you’d have to merge **Primitive Colors** + **Semantic Tokens** by hand.

1. Edit Variables in [BEAM_27_LIBRARY](https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY) (`Primitive Colors`, `Semantic Tokens`). Set **Contrast** even when it matches Light.
2. In Cursor: ask for an **MCP export** of those Variables into [`figma-colors.raw.json`](./figma-colors.raw.json) (one file, both collections). Needs an authenticated Figma MCP session.
3. Run:
   ```
   yarn generate:design-tokens && yarn validate:tokens
   ```
4. Commit `figma-colors.raw.json`, `color.json`, and any regenerated `truss-*` / `theme-scopes.css` files.

## Root document shape

Codegen merges files into a DTCG document with all Beam tokens under **`beam`**:

- `beam.color` ← `color.json`
- `beam.motion` ← `motion.json`

## Tailwind-aligned namespaces

We mirror [Tailwind theme variable namespaces](https://tailwindcss.com/docs/theme#theme-variable-namespaces): Tailwind `--{namespace}-*` maps to **`beam.{namespace}`** when we add that category.

| Tailwind theme prefix (CSS)                                         | Beam JSON path (group)            | Status                                          |
| ------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------- |
| `--color-*`                                                         | `beam.color`                      | **In use** — see below                          |
| (no Tailwind namespace — Truss/JS literals)                         | `beam.motion`                     | **In use** — see below                          |
| `--font-*`                                                          | `beam.font`                       | Reserved                                        |
| `--text-*`                                                          | `beam.text`                       | Reserved                                        |
| `--font-weight-*`                                                   | `beam.fontWeight`                 | Reserved                                        |
| `--spacing-*`                                                       | `beam.spacing`                    | Reserved                                        |
| `--radius-*`                                                        | `beam.radius`                     | Reserved                                        |
| `--shadow-*`                                                        | `beam.shadow`                     | Reserved                                        |
| Other rows (`--breakpoint-*`, `--blur-*`, etc.)                     | `beam.breakpoint`, `beam.blur`, … | Add only when codegen + product need it       |

**Rule:** New groups use a key under `beam` that matches this mapping (camelCase JSON, e.g. `fontWeight`). Do not invent ad hoc top-level names without updating this README and codegen.

## `beam.color`

### `beam.color.primitive.*`

Literal DTCG `srgb` colors (ramps `Gray50` … `Blue900`, etc.). **`White`** and **`Transparent`** are required. No `$extensions["com.homebound.beam"]` unless codegen explicitly supports it. **`$value` must not reference semantic tokens** (semantic may reference primitive only).

### `beam.color.semantic.*`

Role colors exposed as **`Tokens`** in [`truss-token-vars.ts`](../truss-token-vars.ts) (`--b-*` names). Baseline values are on **`:root`** in [`src/css/generated/theme-scopes.css`](../src/css/generated/theme-scopes.css); theme overrides use **`[data-theme="…"]`**. Each leaf **must** include `$extensions["com.homebound.beam"]` with **`cssVar`** (`--b-*`) and **`contrast`** (hex or `{beam.color.primitive.*}`). Leaf keys: **PascalCase**; do not prefix keys with `Beam`. **`$value`:** Light / baseline. **`$description`:** optional usage note.

**Usage in components:** pass `Tokens` to Truss param methods (Truss wraps `--*` in `var()`), e.g. `Css.bgColor(Tokens.Surface).$`, `Css.color(Tokens.OnSurface).$`, `Css.bc(Tokens.FieldBorderDefault).$`. For `Icon` / `CountBadge` and similar props, use type `BeamColor` (`Palette | Tokens`) and pass `Tokens` directly — `Css.fill` / `Css.bgColor` wrap it. Inside template strings (e.g. `boxShadow`), use `` `var(${Tokens.FocusRingInset})` `` yourself.

## Nomenclature and best practices

These conventions help humans, agents, and upstream tools stay consistent. **`yarn validate:tokens` does not enforce vocabulary** (no allowlist of semantic names). It **does** enforce **structure**: color value shape; **`duration`** / **`cubicBezier`** value shape and path prefixes (`beam.motion.duration.*`, `beam.motion.easing.*`); unresolved `{path}` refs; required primitive `White`/`Transparent`; semantic `$extensions` including **required `contrast`**; and **`cssVar` must equal `--b-` + kebab-case of the JSON leaf key** (same segment order; see [`scripts/token-naming.ts`](../scripts/token-naming.ts) for the kebab mapping used in validation).

| Kind | When to use | Shape | Examples |
|------|-------------|-------|----------|
| **Global** | App-wide surfaces, brand, paired foreground roles | Short PascalCase | `Surface`, `SurfaceRaised`, `OnSurface`, `OnSurfaceMuted`, `SelectionIndicator`, `Primary`, `PrimaryHover`, `PrimaryPressed`, `OnPrimary`, `Danger`, `Scrim`, … |
| **Scoped** | Controls and product-specific patterns | `{Scope}{Aspect}{State?}` | `FieldBorderHover`, `NavTextActive`, `TextLabel`, `ButtonGhostFg`, `TextLinkHover`, `FocusRingInset`, … |

**Pairing:** Prefer **`On*`** for ink on a fill (`OnSurface` on `Surface`). Use purpose-named globals when the role is not “text on a fill” (e.g. `SelectionIndicator` on `SurfaceRaised`). Use scoped tokens for product-specific copy (e.g. `TextLabel` for labels).

**Semantic roles (by area)** — illustrative; authoritative set is `beam.color.semantic` in `color.json`:

- **Surfaces / ink:** `Surface`, `SurfaceHover` (hover on `Surface`, e.g. table rows), `SurfaceRaised`, `SurfaceRaisedHover` (items on raised panels), `OnSurface`, `OnSurfaceMuted`, `Scrim`, …
- **Brand / actions:** `Primary`, `PrimaryHover`, `PrimaryPressed`, `OnPrimary`, `SelectionIndicator`, `Danger`, …
- **Typography / form copy:** `TextLabel`, `TextHelper`, `TextPlaceholder`, `TextDisabled`, `FieldTextDisabled`, `TextLink*`, `TextSelection`, …
- **Fields / choice:** `FieldBg*`, `FieldBorder*`, `ChoiceSelected` (checkbox, radio, switch fills), …
- **Navigation:** `NavText*`, `NavItemBg*` (contrast-themed side nav); `NavGlobal*` (fixed dark chrome for Navbar), …
- **Neutrals / buttons / focus / loaders:** `Neutral*`, `Button*` (incl. `ButtonSecondaryFg`, tertiary/ghost), `FocusRing*`, `LoaderFill`, `LoaderSpinner`, `LoaderTrack`, `DangerPressed`, …

Avoid semantic leaf keys that **collide with Truss `Css` shorthands** (e.g. do not use `Outline` as a color token key).

## `beam.motion`

Transition **durations** and **easing curves** for Truss animation helpers. Unlike colors, motion is **not** themed at runtime: values codegen to string literals in [`truss-motion.ts`](../truss-motion.ts) (no `--b-*` CSS variables). [`truss-config.ts`](../truss-config.ts) imports `motion` for the default `Css.transition` bundle and per-property helpers (`transitionWidth`, `transitionOpacity`, etc.).

Edit [`motion.json`](./motion.json) directly.

### `beam.motion.duration.*`

[`$type: "duration"`](https://www.designtokens.org/tr/2025.10/format/#duration) — `$value` is `{ "value": <number>, "unit": "ms" | "s" }` (non-negative `value`). Leaf keys: **camelCase** (`fast`, `normal`, `slow`). No `$extensions["com.homebound.beam"]`.

### `beam.motion.easing.*`

[`$type: "cubicBezier"`](https://www.designtokens.org/tr/2025.10/format/#cubicbezier) — `$value` is `[P1x, P1y, P2x, P2y]` with **P1x and P2x in [0, 1]** (y may be any real). Leaf keys: **camelCase** (`standard`, `decelerate`, `accelerate`). No Beam extensions.

**Usage:** Prefer Truss motion helpers from [`truss-config.ts`](../truss-config.ts) (`Css.transition`, `Css.transitionWidth`, …) rather than hard-coding `ms` / `cubic-bezier(...)` in components. For one-off transitions, compose from `motion.duration.*` and `motion.easing.*` in repo code that already imports [`truss-motion.ts`](../truss-motion.ts).

## Contrast and theming

- Baseline colors live in JSON and emit on **`:root { --b-*: rgba(…) }`** in **`src/css/generated/theme-scopes.css`**.
- Theme axes on the Beam extension (e.g. `contrast`) resolve to rgba and emit as **`[data-theme="…"] { --b-*: … }`** in the same file (axis keys must align with [`ContrastScope`](../src/components/ContrastScope.tsx)).
- Apps stay on light `:root` values; we do **not** follow `prefers-color-scheme` yet. Use **`ContrastScope`** (or Storybook’s **Color scheme → Dark**) to force the contrast axis for verification.
- Wrap subtrees in **`ContrastScope`** for dark chrome. Portaled overlays (e.g. menus from a field) should inherit the preset (`Popover` / `data-theme` when contrast scope is active).
- **`CssReset`** imports **`theme-scopes.css`** so rules ship with the app.

## DTCG references

Use `{beam.color.primitive.Gray900}` in `$value` and in extension fields when pointing at a primitive. Paths are **case-sensitive**.

## Workflow

**Colors:** see [Updating colors from Figma](#updating-colors-from-figma) above.

**Motion:** edit `motion.json` → `yarn generate:design-tokens` → `yarn validate:tokens`.

**CI** (see [AGENTS.md](../AGENTS.md)): **`yarn validate:tokens`** then **`yarn check:token-drift`** before **`yarn build`**. Drift re-runs sync + codegen and fails if `color.json` or emitted files are stale.

**Roadmap:** [docs/design-tokens/README.md](../docs/design-tokens/README.md). **Phase 1 (complete) record:** [docs/design-tokens/phase-1-contrast.md](../docs/design-tokens/phase-1-contrast.md).
