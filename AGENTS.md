# Agent guide

This file is the **source of truth** for agent-oriented conventions in this repo. Cursor rules under [`.cursor/rules/`](.cursor/rules/) only route you here — they do not duplicate guidance, so practices stay in one place.

## Imports

Use the `src/` path alias (e.g. `import { Css } from "src/Css"`), not relative paths like `../../utils/...`. This applies repo-wide — components, hooks, tests, and stories.

**Do not re-export types through component files.** A `*.tsx` file may export types it defines locally (e.g. `FooProps` beside `Foo`), but do not `export type { … } from "…/types"` (or similar) from a component file just to create a second import path. Put shared types in a dedicated module (e.g. `types.ts`) and expose the public API from the folder barrel (`index.ts`). Consumers import components from the component file (or barrel) and shared types from `types.ts` or the barrel.

## File naming

Match the existing conventions when adding files:

- **Components** — PascalCase matching the export: `NavbarLayout.tsx`.
- **React contexts** — PascalCase with a `Context` suffix: `BeamContext.tsx`, `ModalContext.tsx`, `SideNavLayoutContext.tsx` (even when the file also exports the Provider and hooks).
- **Hooks** — camelCase `use*`: `useTestIds.tsx`, `useMeasuredHeight.ts`.
- **Utility / constant modules** — camelCase: `zIndices.ts`, `layoutVars.ts`.
- Co-locate `*.test.tsx` and `*.stories.tsx` beside the file they cover.

## Utility modules

In camelCase utility files (e.g. `formatDocumentTitle.ts`), put **types first**, then the **primary exported function** the file exists for, then other exports and private helpers. Do not bury the main export below unrelated helpers.

## Comments

- **JSDoc:** Keep exported symbols to **one or two lines**. State purpose, not implementation; point to `docs/` for full contracts (e.g. [`docs/layouts.md`](docs/layouts.md)).
- **Inline comments:** Use for non-obvious logic near the code. Keep them **short** — one line when possible.
- **Avoid:** Multi-paragraph JSDoc, restating what the code already says, and duplicating docs that live elsewhere.

## Testing

Use **vitest**, not Jest. Example:

```
npx vitest run src/forms/FormLines.test.tsx
```

Tests use a custom wrapper around React Testing Library: [`src/utils/rtl.tsx`](src/utils/rtl.tsx) and helpers in [`src/utils/rtlUtils.tsx`](src/utils/rtlUtils.tsx).

After editing a test file, run `yarn lint:fix:files` on that path (see **Linting** below). Before a PR, run `yarn lint:ci`.

### Structure

- **Given/When/Then:** In each `it` block, use `// Given …` for setup, `// When …` for the action (render, click, rerender, etc.), and `// Then …` before assertions. Omit `When` only when there is no separate action step after setup. See [`PageHeaderLayout.test.tsx`](src/layouts/PageHeaderLayout/PageHeaderLayout.test.tsx).
- Each test should focus on one behavior; cover happy path and important edge cases.
- Use descriptive `it` names.
- **Inline test data:** Define props, items, and other fixtures **inside the `it` body** when only that test needs them. Extract a shared factory only when **multiple tests** need the same shape and duplicating it would hurt maintainability.
- **Describe-scoped helpers:** Helpers used only in one `describe` (e.g. a local `withState` wrapper) go **after all `it` / `test` cases** in that block (tests first, helpers last). Example: [`NavGroup.test.tsx`](src/components/NavLinks/NavGroup.test.tsx).
- **File-scoped helpers:** Harness components and factories shared across the file belong at **module level** (outside `describe`), typically after the `describe` block(s) — e.g. [`useSideNavLinkGroupExpanded.test.tsx`](src/components/SideNav/useSideNavLinkGroupExpanded.test.tsx). Prefer module level over nesting inside `describe`.
- **No module-level fixture values:** Do not declare objects, arrays, or other non-trivial **values** at the top level of a test file. Vitest loads the whole module eagerly, so `const items = [{ … }]` at module scope runs even when this file’s tests do not. Module-level **functions** (factories, harness components) are fine. Inline literals inside an `it` body are preferred for one-off data.

### Selectors

- Prefer `data-testid` for DOM selection; avoid text, classes, or other brittle selectors.
- In tests, use each component’s default prefix (e.g. `r.sideNav_trigger`) — do not pass `data-testid` on the component under test.
- For **absence** checks, use `r.query.someTestId` (e.g. `expect(r.query.sideNav_section_label).toBeNull()`), not `r.queryByTestId("sideNav_section_label")`.

### `useTestIds` for components

Use [`useTestIds`](src/utils/useTestIds.tsx) for any element tests need to target — do **not** set `data-testid={...}` by hand in components or tests.

```tsx
const tid = useTestIds(props, "myComponent");
return <div {...tid}>…</div>;
```

- Prefix comes from `props["data-testid"]` when a parent forwarded it, otherwise `defaultTestId(defaultPrefix)` (e.g. `"myComponent"`).
- Named parts use the proxy: `tid.trigger` → `{ "data-testid": "myComponent_trigger" }`.
- Apply with spreads only: `{...tid}` on the root, `{...tid.panel}` on named DOM nodes.
- **Nested components:** Parent spreads `tid` into the child (`<NavGroupTrigger {...tid} … />` or `<SideNavLinkGroupView {...tid.linkGroup} … />`); child calls `useTestIds(props, "trigger")` and spreads `{...tid.trigger}`. Do **not** build or pass `data-testid` strings by hand.

**Passing test ids to children** — spread the parent’s `tid` (or a scoped part like `tid.linkGroup`); never `data-testid={someVariable}`:

```tsx
// Parent (NavGroup)
const tid = useTestIds(props, "navGroup");
return (
  <div {...tid}>
    <NavGroupTrigger {...tid} label={label} … />
    <div {...tid.panel}>…</div>
  </div>
);

// Child (NavGroupTrigger)
const tid = useTestIds(props, "trigger");
return <button {...mergeProps(…, tid.trigger)}>…</button>;
```

References: [`NavGroup.tsx`](src/components/NavLinks/NavGroup.tsx), [`NavGroupTrigger.tsx`](src/components/NavLinks/NavGroupTrigger.tsx), [`SideNavLinkGroup.tsx`](src/components/SideNav/SideNavLinkGroup.tsx), [`SnackbarNotice.tsx`](src/components/Snackbar/SnackbarNotice.tsx).

### Interactions

Use helpers from `@homebound/rtl-utils` (re-exported via `rtl.tsx`), e.g. `click(r.save)`, `type(r.name, "value")`, `blur`, `focus`, `input`.

- **Do not await:** `click`, `type`, `blur`, `focus`, `input`, `change`
- **Await:** `render`, `clickAndWait`, `typeAndWait`, `changeAndWait`, `wait`

### Assertions and examples

- Prefer `toHaveTextContent`, `toBeInTheDocument`, `not.toBeDisabled`, `toHaveValue` as appropriate.
- Prefer `toBe` / `toBeDefined` / `toBeUndefined` over `toEqual` / `toBeTruthy` / `toBeFalsy`.

Example tests: [`DateField.test.tsx`](src/inputs/DateFields/DateField.test.tsx), [`BoundDateField.test.tsx`](src/forms/BoundDateField.test.tsx), [`useTestIds.test.tsx`](src/utils/useTestIds.test.tsx), [`useFilter.test.tsx`](src/hooks/useFilter.test.tsx).

## Storybook

- Primary development surface for components; Storybook **helpers** (decorators, viewport modes) in [`src/utils/sb.tsx`](src/utils/sb.tsx); shared story **fixtures** in [`src/utils/sbComponents.tsx`](src/utils/sbComponents.tsx) — do not export reusable fixtures from `*.stories.tsx` or Storybook will register them as stories.
- Every feature should have at least one story; use `PlayFunction` for interaction states (hover, focus, etc.).
- Chromatic snapshots stories for visual regression. When a Chromatic mode name matches a built-in Storybook viewport key, use [`viewportModes()`](src/utils/sb.tsx) (e.g. `modes: viewportModes("desktop", "iphone12")`). Keys are type-checked against Storybook's [`INITIAL_VIEWPORTS`](https://storybook.js.org/docs/essentials/viewport#use-a-detailed-set-of-devices) and default [`MINIMAL_VIEWPORTS`](https://storybook.js.org/docs/essentials/viewport#use-a-detailed-set-of-devices) sets via the `StorybookViewportKey` type.
- **Helper placement:** Local helpers in `*.stories.tsx` go **at the bottom of the file**, after meta, story exports, and play functions.
- **No module-level fixture values:** Do not declare objects, arrays, or other non-trivial values at the **top level** of a story file — Storybook loads modules eagerly. Use **factory functions** at the bottom (`function createItems() { return […]; }`) or inline values inside a story export.

## Design tokens

Authoring, structure, nomenclature, and commands: [`tokens/README.md`](tokens/README.md) (source: [`tokens/tokens.json`](tokens/tokens.json)). After JSON edits: `yarn generate:design-tokens` (also at the start of `yarn build` / `yarn build:truss`), then `yarn validate:tokens`. **CI** runs **`yarn validate:tokens`** then **`yarn check:token-drift`** before `yarn build`; on drift, regenerate, commit `truss-token-vars.ts`, `truss-palette.ts`, `truss-motion.ts`, and `src/css/generated/theme-scopes.css`, and push. Roadmap: [`docs/design-tokens/README.md`](docs/design-tokens/README.md).

## Linting

CI **`validate-code`** runs **`yarn lint:ci`** on `src/` (ESLint with cache + quiet, same as local). **Before opening a PR**, run **`yarn lint:ci`** and fix all reported issues so the lint job does not fail downstream.

Whenever you edit **`.ts` / `.tsx` / `.js` under `src/`**, run ESLint with **`--fix`** on those paths (then address anything left manually):

```
yarn lint:fix:files src/components/Example.tsx
```

Pass every touched path under `src/`. For a full-tree autofix, use **`yarn lint:fix`**.
