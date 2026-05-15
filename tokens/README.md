# Beam token authoring (`tokens.json`)

Source of truth: [`tokens.json`](./tokens.json) (DTCG 2025.10–shaped). [`yarn generate:design-tokens`](../scripts/generate-design-tokens.ts) reads it and emits **`truss-token-vars.ts`**, **`truss-palette.ts`**, and **`src/css/generated/theme-scopes.css`**. Truss uses [`truss-config.ts`](../truss-config.ts); run **`yarn build:truss`** after token edits when you also need regenerated **`src/Css.ts`** / **`src/Css.json`**.

**Palette order in `truss-palette.ts`:** every `beam.color.semantic.*` leaf in **JSON key order** (keep semantic keys **sorted alphabetically** for stable diffs), then **Extended Palette**: `White` / `Transparent` literals, then other `beam.color.primitive.*` keys in JSON order.

**Normative color format:** [Design Tokens Color Module 2025.10](https://www.designtokens.org/tr/2025.10/color/#color-tokens) — for `$type: "color"`, `$value` is `colorSpace: "srgb"`, `components: [r, g, b]` (each **0–1**), optional `alpha`, optional `hex`. Semantic baselines usually reference `{beam.color.primitive.*}`.

## Root

All Beam tokens live under **`beam`** in [`tokens.json`](./tokens.json) (sibling of `$schema` at the document root).

## Tailwind-aligned namespaces

We mirror [Tailwind theme variable namespaces](https://tailwindcss.com/docs/theme#theme-variable-namespaces): Tailwind `--{namespace}-*` maps to **`beam.{namespace}`** when we add that category.

| Tailwind theme prefix (CSS)                                         | Beam JSON path (group)            | Status                                          |
| ------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------- |
| `--color-*`                                                         | `beam.color`                      | **In use** — see below                          |
| `--font-*`                                                          | `beam.font`                       | Reserved                                        |
| `--text-*`                                                          | `beam.text`                       | Reserved                                        |
| `--font-weight-*`                                                   | `beam.fontWeight`                 | Reserved                                        |
| `--spacing-*`                                                       | `beam.spacing`                    | Reserved                                        |
| `--radius-*`                                                        | `beam.radius`                     | Reserved                                        |
| `--shadow-*`                                                        | `beam.shadow`                     | Reserved                                        |
| Other rows (`--breakpoint-*`, `--blur-*`, etc.)                     | `beam.breakpoint`, `beam.blur`, … | Add only when codegen + product need it       |

**Rule:** New groups use a key under `beam` that matches this mapping (camelCase JSON, e.g. `fontWeight`). Do not invent ad hoc top-level names without updating this README and codegen.

## `beam.color`

Two children for the current pipeline:

### `beam.color.primitive.*`

Literal DTCG `srgb` colors (ramps `Gray50` … `Blue900`, etc.). **`White`** and **`Transparent`** are required. No `$extensions["com.homebound.beam"]` unless codegen explicitly supports it. **`$value` must not reference semantic tokens** (semantic may reference primitive only).

### `beam.color.semantic.*`

Role colors consumed as `var(--b-*, …)` in [`truss-palette.ts`](../truss-palette.ts). Each leaf **must** include `$extensions["com.homebound.beam"]` with **`cssVar`** (`--b-*`). Optional theme axes (e.g. **`contrast`**) are hex or `{beam.color.primitive.*}`. Leaf keys: **PascalCase**; do not prefix keys with `Beam`. **`$value`:** baseline (usually a primitive reference). **`$description`:** optional usage note.

## Nomenclature and best practices

These conventions help humans, agents, and upstream tools (e.g. a future Figma export) stay consistent. **`yarn validate:tokens` does not enforce vocabulary** (no allowlist of semantic names). It **does** enforce **structure**: color value shape, unresolved `{path}` refs, required primitive `White`/`Transparent`, semantic `$extensions`, **`contrast`** shape when present, and **`cssVar` must equal `--b-` + kebab-case of the JSON leaf key** (same segment order; see [`scripts/token-naming.ts`](../scripts/token-naming.ts) for the kebab mapping used in validation).

| Kind | When to use | Shape | Examples |
|------|-------------|-------|----------|
| **Global** | App-wide surfaces, brand, paired foreground roles | Short PascalCase | `Surface`, `PopoverSurface`, `OnSurface`, `OnSurfaceMuted`, `SelectionIndicator`, `Primary`, `PrimaryHover`, `PrimaryPressed`, `OnPrimary`, `Danger`, `Scrim`, … |
| **Scoped** | Controls and product-specific patterns | `{Scope}{Aspect}{State?}` | `FieldBorderHover`, `NavTextActive`, `TextLabel`, `ButtonGhostFg`, `TextLinkHover`, `FocusRingInset`, … |

**Pairing:** Prefer **`On*`** for ink on a fill (`OnSurface` on `Surface`). Use purpose-named globals when the role is not “text on a fill” (e.g. `SelectionIndicator` on `PopoverSurface`). Use scoped tokens for product-specific copy (e.g. `TextLabel` for labels).

**Semantic roles (by area)** — illustrative; authoritative set is `beam.color.semantic` in `tokens.json`:

- **Surfaces / ink:** `Surface`, `OnSurface`, `PopoverSurface`, `OnSurfaceMuted`, `Scrim`, …
- **Brand / actions:** `Primary`, `PrimaryHover`, `PrimaryPressed`, `OnPrimary`, `SelectionIndicator`, `Danger`, …
- **Typography / form copy:** `TextLabel`, `TextHelper`, `TextPlaceholder`, `TextDisabled`, `FieldTextDisabled`, `TextLink*`, `TextSelection`, …
- **Fields:** `FieldBg*`, `FieldBorder*`, …
- **Navigation:** `NavText*`, `NavItemBg*`, …
- **List / menu:** `ListRowBgHover`, `MenuItemBgHover`, …
- **Neutrals / buttons / focus / loaders / status:** `Neutral*`, `Button*`, `FocusRing*`, `Loader*`, `StatusSuccessFg`, `DangerPressed`, …

Avoid semantic leaf keys that **collide with Truss `Css` shorthands** (e.g. do not use `Outline` as a color token key).

## Contrast and theming

- Baseline colors live in JSON; fallbacks appear in `truss-palette.ts` as `var(--b-*, rgba(…))`.
- Theme axes on the Beam extension (e.g. `contrast`) resolve to rgba and emit as **`[data-theme="…"] { --b-*: … }`** in **`src/css/generated/theme-scopes.css`** (axis keys must align with [`ContrastScope`](../src/components/ContrastScope.tsx)).
- Wrap subtrees in **`ContrastScope`**. Portaled overlays (e.g. menus from a field) should inherit the preset (`Popover` / `data-theme` when contrast scope is active).
- **`CssReset`** imports **`theme-scopes.css`** so rules ship with the app.

## DTCG references

Use `{beam.color.primitive.Gray900}` in `$value` and in extension fields when pointing at a primitive. Paths are **case-sensitive**.

## Workflow

1. Edit `tokens/tokens.json`. Keep **`beam.color.semantic`** keys **alphabetically sorted** when adding or renaming.
2. Run **`yarn generate:design-tokens`** (or **`yarn build`** / **`yarn build:truss`**).
3. Run **`yarn validate:tokens`**.

**CI** (see [AGENTS.md](../AGENTS.md)): **`yarn validate:tokens`** then **`yarn check:token-drift`** before **`yarn build`**. If drift fails, regenerate, commit the three emitted files above, and push.

**Roadmap:** [docs/design-tokens/README.md](../docs/design-tokens/README.md). **Phase 1 (complete) record:** [docs/design-tokens/phase-1-contrast.md](../docs/design-tokens/phase-1-contrast.md).
