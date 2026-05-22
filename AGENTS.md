## Testing

Use `vitest` to run tests, not jest. Example:

```
npx vitest run src/forms/FormLines.test.tsx
```

### `useTestIds` for components

Use [`useTestIds`](src/utils/useTestIds.tsx) for any element tests need to target — do **not** set `data-testid={...}` by hand in components or tests.

```tsx
const tid = useTestIds(props, "myComponent");
return <div {...tid}>…</div>;
```

- Prefix comes from `props["data-testid"]` when a parent forwarded it, otherwise `defaultTestId(defaultPrefix)` (e.g. `"myComponent"`).
- Named parts use the proxy: `tid.trigger` → `{ "data-testid": "myComponent_trigger" }`.
- Apply with spreads only: `{...tid}` on the root, `{...tid.panel}` on named DOM nodes.

**Passing test ids to child components** — spread the parent’s `tid` object (or a scoped part like `tid.linkGroup`); never pass `data-testid={someVariable}`:

```tsx
// Parent (NavGroup)
const tid = useTestIds(props, "navGroup");
return (
  <div {...tid}>
    <NavGroupTrigger {...tid} label={label} … />
    <div {...tid.panel}>…</div>
  </div>
);

// Child (NavGroupTrigger) — reads prefix from props via the spread above
const tid = useTestIds(props, "trigger");
return <button {...mergeProps(…, tid.trigger)}>…</button>;
```

When the child should live under a sub-scope (e.g. `sideNav_linkGroup`), the outer parent spreads that slice: `<SideNavLinkGroupView {...tid.linkGroup} />`. Reference: [`NavGroup.tsx`](src/components/NavLinks/NavGroup.tsx), [`NavGroupTrigger.tsx`](src/components/NavLinks/NavGroupTrigger.tsx), [`SideNavLinkGroup.tsx`](src/components/SideNav/SideNavLinkGroup.tsx).

In tests, use each component’s default prefix (e.g. `r.sideNav_trigger`) — do not pass `data-testid` on the component under test.

More detail: [`.cursor/rules/tests.mdc`](.cursor/rules/tests.mdc), example: [`SnackbarNotice.tsx`](src/components/Snackbar/SnackbarNotice.tsx).

### Test and story helpers

- **Tests:** Helpers inside a `describe` block (harness components, fixture factories, local functions) go **after all `it` / `test` cases** in that block. See [`.cursor/rules/tests.mdc`](.cursor/rules/tests.mdc) and [`NavGroup.test.tsx`](src/components/NavLinks/NavGroup.test.tsx).
- **Storybook:** Local helpers in `*.stories.tsx` go **at the bottom of the file**, after meta, stories, and play functions. See [`.cursor/rules/general.mdc`](.cursor/rules/general.mdc) **Storybook**.
- **No top-level fixtures:** Do not put objects/arrays at the **module root** of test or story files — the runner loads the whole file eagerly, so those values are created even when this file’s tests/stories are not run. Use **factory functions** at the bottom of the `describe` / story file instead; inline literals inside an `it` or story function are OK.

## Design tokens

Authoring, structure, nomenclature, and commands: [`tokens/README.md`](tokens/README.md) (source: [`tokens/tokens.json`](tokens/tokens.json)). After JSON edits: `yarn generate:design-tokens` (also at the start of `yarn build` / `yarn build:truss`), then `yarn validate:tokens`. **CI** runs **`yarn validate:tokens`** then **`yarn check:token-drift`** before `yarn build`; on drift, regenerate, commit `truss-token-vars.ts`, `truss-palette.ts`, `truss-motion.ts`, and `src/css/generated/theme-scopes.css`, and push. Roadmap: [`docs/design-tokens/README.md`](docs/design-tokens/README.md).

## Linting

CI **`validate-code`** runs **`yarn lint:ci`** on `src/` (ESLint with cache + quiet, same as local). **Before opening a PR**, run **`yarn lint:ci`** and fix all reported issues so the lint job does not fail downstream.

Whenever you edit **`.ts` / `.tsx` / `.js` under `src/`**, run ESLint with **`--fix`** on those paths (then address anything left manually):

```
yarn lint:fix:files src/components/Example.tsx
```

Pass every touched path under `src/`. For a full-tree autofix, use **`yarn lint:fix`**.
