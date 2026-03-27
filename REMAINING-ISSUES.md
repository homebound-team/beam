# Remaining Truss 2 Migration Issues

Ran `yarn test` and `yarn type-check` on this branch.

- `yarn test` now passes: 782 passed, 1 skipped, 0 failed.
- `yarn type-check` now passes.
- Vitest still reports the known StyleX shutdown hang after successful test completion.

## Resolved migration work

The Truss 2 migration blockers that were previously tracked here are now resolved for the test suite:

- enabling `runtimeInjection: true` in `vitest.config.mts` fixed missing StyleX CSS in Vitest/JSDOM
- style-based test assertions were updated to work with Truss 2 / StyleX CSS variable output
- `expect(...).toHaveStyle(...)` now uses the matcher from `@homebound/truss/vitest` which resolves `var(--x)` references in jsdom
- `Tabs` / `NavLink` Truss transform issues were resolved without needing to rewrite app code
- `ScrollableParent` was updated to avoid destructuring style objects
- responsive grid hook tests were updated for Truss 2 output
- `useResponsiveGridItem` now uses runtime-injected `@container` CSS for arbitrary runtime values instead of dynamic `ifContainer({ gt })`
- `GridTable` tests now pass again after test cleanup and Truss-compatible style handling adjustments

## Remaining issues

### 1. Story type-check issue resolved

The previous story-level type-check failure is no longer reproducible:

- `src/components/Card.stories.tsx` now uses the Truss 2-compatible `Properties` type from `src/Css`
- `yarn type-check` completes successfully on this branch

This migration blocker is resolved.

### 2. Known upstream StyleX / Vitest shutdown issue

`vitest` still finishes successfully but logs a hanging-process shutdown timeout afterward.

Current understanding:

- this is not caused by Beam tests themselves
- this is not specific to the Truss repros
- isolation pointed to the StyleX Vite plugin rather than Truss
- the likely root cause matches the upstream StyleX issue discussed during this migration

This is currently treated as an upstream tooling issue, not a Beam migration blocker.

## Notes for future cleanup

- `useResponsiveGridItem` intentionally uses a shared runtime `<style>` tag with injected `@container` rules because Truss 2 / StyleX cannot express arbitrary runtime `ifContainer({ gt })` thresholds.
- We regression-tested the extra `Css.spread(...)` additions in `src/components/Table/GridTable.tsx` and `src/components/Table/components/Row.tsx`; none of those added wrappers were required, so they were removed.

## Suggested next step

1. Investigate the upstream StyleX / Vitest shutdown hang once a fix is available.
