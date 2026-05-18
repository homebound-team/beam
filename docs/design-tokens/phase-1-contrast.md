# Phase 1: Contrast Migration

**Status: complete.** Authoring, codegen outputs, validation, and naming guidance: [`tokens/README.md`](../../tokens/README.md). Later phases: [`README.md`](./README.md) in this folder.

## Goal

Replace color-level contrast branches with semantic token values so contrast mode is a scoped preset (`data-theme` + CSS custom properties) instead of duplicated style matrices.

**Key implementation:** [`src/components/ContrastScope.tsx`](../../src/components/ContrastScope.tsx), [`truss-config.ts`](../../truss-config.ts).

## Migration Checklist

- [x] Single JSON source (`tokens/tokens.json`: `beam.color.*`) and codegen for `truss-token-vars`, `truss-palette`, and `theme-scopes.css`
- [x] Semantic baselines on `:root` and contrast overrides in `theme-scopes.css`; primitives-only `truss-palette.ts`
- [x] Wire Truss token import from `truss-token-vars.ts`
- [x] Add `ContrastScope` (contrast via `data-theme` + generated `theme-scopes.css`; portaled overlays set the same attribute when scope is active)
- [x] Migrate core components to semantic token usage:
  - `Button`, `IconButton`, `NavLink`
  - `Menu`, `MenuItem`, `MenuSection`
  - `Option`, `TreeOption`, `ListBox`
  - `TextFieldBase`, `Label`, `HelperText`, `ErrorMessage`
  - `Loader`, `LoadingSkeleton`, `LoadingDots`
- [x] Add token docs (this file + roadmap)

## Exit Criteria

- Contrast can be applied by wrapping any subtree with `ContrastScope`.
- Migrated components resolve color semantics from tokens, not branch-local contrast color pairs.
- Per-component `contrast` props are removed; use `ContrastScope` (and rely on Beam `Popover` to re-apply the preset for portaled menus when the trigger sits inside an active scope).
- Truss output includes `Tokens` in `src/Css.ts` / `src/Css.json`; semantic colors use `Css.bgColor(Tokens.*)` (etc.), not palette shorthands.
